import asyncio
import json
import sys
import uuid
from os import environ
from typing import Literal, Union

import kthread
import uvicorn
from argument_models import (BoolArgument, CategoricalArgument, FloatArgument,
                             IntArgument, StringArgument)
from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, create_model, root_validator, validator

sys.path.insert(0, "/summary_workbench_plugin_files")

PLUGIN_CONFIG = json.loads(environ.get("PLUGIN_CONFIG"))
PLUGIN_CONFIG["instancetag"] = str(uuid.uuid4())
PLUGIN_TYPE = PLUGIN_CONFIG["type"]


class CancelError(Exception):
    pass


class KThreadWithReturnValue(kthread.KThread):
    def run(self):
        self.result = None
        self.exc = None
        try:
            self.result = self._target(*self._args, **self._kwargs)
        except Exception as e:
            self.exc = e

    def join(self, *args, **kwargs):
        super().join(*args, **kwargs)


async def cancable_execute(request: Request, function):
    thread = KThreadWithReturnValue(target=function)
    thread.start()
    while thread.is_alive():
        await asyncio.get_running_loop().run_in_executor(None, thread.join, 1)
        if await request.is_disconnected():
            thread.terminate()
            raise CancelError()
    if thread.exc:
        raise thread.exc
    return thread.result


app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc):
    return Response(exc.json(), status_code=400)


TYPE_TO_ARGUMENT = {
    "int": IntArgument,
    "float": FloatArgument,
    "bool": BoolArgument,
    "categorical": CategoricalArgument,
    "str": StringArgument,
}


def build_min_validator(min_value):
    def min_validator(_, v):
        if v < min_value:
            raise ValueError(f"{v} is smaller than {min_value}")
        return v

    return min_validator


def build_max_validator(max_value):
    def max_validator(_, v):
        if v > max_value:
            raise ValueError(f"{v} is bigger than {max_value}")
        return v

    return max_validator


def parse_arguments(arguments):
    kwargs = {}
    for varname, argument in arguments.items():
        parsed = []
        argument = TYPE_TO_ARGUMENT[argument["type"]](**argument)
        if argument.type == "int":
            parsed.append(int)
        elif argument.type == "float":
            parsed.append(float)
        elif argument.type == "bool":
            parsed.append(bool)
        elif argument.type == "str":
            parsed.append(str)
        elif argument.type == "categorical":
            parsed.append(Literal[tuple(argument.categories)])
        else:
            raise ValueError(f"unknown type {argument.type}")

        field_args = {}
        if hasattr(argument, "min") and argument.min is not None:
            field_args["ge"] = argument.min
        if hasattr(argument, "max") and argument.min is not None:
            field_args["le"] = argument.max

        if argument.default is not None:
            parsed.append(Field(argument.default, **field_args))
        else:
            parsed.append(Field(**field_args))

        kwargs[varname] = tuple(parsed)

    return kwargs


PARSED_ARGUMENTS = parse_arguments(PLUGIN_CONFIG["arguments"])


def to_list(value):
    if isinstance(value, str):
        return [value]
    return value


class MetricBase(BaseModel):
    hypotheses: Union[str, list]
    references: Union[str, list]

    hypotheses_validator = validator("hypotheses", allow_reuse=True)(to_list)
    references_validator = validator("references", allow_reuse=True)(to_list)

    @root_validator()
    def same_number_lines(_, values):
        if len(values["hypotheses"]) != len(values["references"]):
            raise ValueError("hypotheses and references have to have the same length")
        return values


class SummarizerBase(BaseModel):
    text: str
    ratio: float = Field(
        ..., gt=0, lt=1, description="The ratio must be in the closed interval (0,1)"
    )


def to_float_list(array):
    return [float(e) for e in array]


def create_plugin(Constructor):
    plugin = Constructor()
    updated_plugin_config = PLUGIN_CONFIG.copy()
    try:
        updated_plugin_config.setdefault("metadata", {})
        updated_plugin_config["metadata"].update(plugin.metadata())
    except:
        pass
    return plugin, updated_plugin_config


def construct_metric():
    from metric import MetricPlugin

    MetricBody = create_model("MetricBody", **PARSED_ARGUMENTS, __base__=MetricBase)

    plugin, updated_plugin_config = create_plugin(MetricPlugin)

    @app.post("/")
    async def evaluate(body: MetricBody, request: Request, response: Response):
        try:
            scores = await cancable_execute(
                request, lambda: plugin.evaluate(**body.dict())
            )
            if isinstance(scores, dict):
                scores = {k: to_float_list(v) for k, v in scores.items()}
            else:
                scores = to_float_list(scores)
            return {"scores": scores}
        except Exception as error:
            response.status_code = 400
            return {"message": ", ".join(error.args)}

    @app.post("/validate")
    def validate(_: MetricBody):
        pass

    return updated_plugin_config


def construct_summarizer():
    from summarizer import SummarizerPlugin

    SummarizerBody = create_model(
        "SummarizerBody", **PARSED_ARGUMENTS, __base__=SummarizerBase
    )

    plugin, updated_plugin_config = create_plugin(SummarizerPlugin)

    @app.post("/")
    async def summarize(body: SummarizerBody, request: Request, response: Response):
        try:
            summary = await cancable_execute(
                request, lambda: plugin.summarize(**body.dict())
            )
            return {"summary": summary}
        except CancelError:
            return
        except Exception as error:
            response.status_code = 400
            return {"message": ", ".join(error.args)}

    @app.post("/validate")
    def validate(_: SummarizerBody):
        pass

    return updated_plugin_config


PLUGIN_TYPES = {
    "metric": construct_metric,
    "summarizer": construct_summarizer,
}

if not PLUGIN_TYPE:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be defined (one of: {list(PLUGIN_TYPES)})"
    )

if PLUGIN_TYPE not in PLUGIN_TYPES:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be one of: {list(PLUGIN_TYPES)}"
    )

updated_plugin_config = PLUGIN_TYPES.get(PLUGIN_TYPE)()


@app.get("/config")
async def config():
    return updated_plugin_config


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
