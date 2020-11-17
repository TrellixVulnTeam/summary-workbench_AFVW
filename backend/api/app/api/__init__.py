from flask import Blueprint, current_app
from flask_restx import Api

from app.common import Metrics, Summarizers

from .resources.evaluate import EvaluateResource
from .resources.savedcalculations import (SavedCalculationResource,
                                         SavedCalculationsResource)
from .resources.summarize import SummarizeResource
from .resources.feedback import FeedbackResource

bp = Blueprint("api", __name__)
api = Api(bp)


def load_resources():
    current_app.METRICS = Metrics()
    current_app.SUMMARIZERS = Summarizers()


bp.before_app_first_request(load_resources)


api.add_resource(EvaluateResource, "/evaluate", endpoint="evaluate")
api.add_resource(SavedCalculationsResource, "/calculations", endpoint="calculations")
api.add_resource(
    SavedCalculationResource, "/calculation/<string:name>", endpoint="calculation"
)
api.add_resource(SummarizeResource, "/summarize", endpoint="summarize")
api.add_resource(FeedbackResource, "/feedback", endpoint="feedback")