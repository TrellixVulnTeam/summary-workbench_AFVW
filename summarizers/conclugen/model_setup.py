import requests
import tarfile
import pathlib
import inspect
import logging
import os

SAVE_PATH = pathlib.Path("~/checkpoints").expanduser()
URL = "https://files.webis.de/webis-conclugen21-models/dbart.tar.gz"
MODEL_NAME = "Webis-Conclugen21"


def setup():
    # create checkpoints directory if non-existent
    print("Creating and downloading checkpoints")
    SAVE_PATH.mkdir(parents=True, exist_ok=True)
    response = requests.get(URL, stream=True)
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.info("Downloading %s", MODEL_NAME)
    file = tarfile.open(fileobj=response.raw, mode="r|gz")
    file.extractall(path=SAVE_PATH)
    logger.info("Done")

if __name__ =="__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, level=logging.INFO, style="{")
    setup()
