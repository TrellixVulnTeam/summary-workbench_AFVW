import os
from pathlib import Path
from urllib.parse import urljoin

import numpy as np

import bleurt.score


class MetricPlugin:
    MODEL = os.environ.get("PLUGIN_MODEL") or "bleurt-base-128"
    MODEL_BASE_URL = "https://storage.googleapis.com/bleurt-oss/"
    MODEL_PATH = Path("~/.cache/bleurt/").expanduser()

    @classmethod
    def MODEL_URL(cls):
        return urljoin(cls.MODEL_BASE_URL + "/", cls.MODEL + ".zip")

    def __init__(self):
        self.bleurt = bleurt.score.BleurtScorer(str(self.MODEL_PATH / self.MODEL))

    def evaluate(self, hypotheses, references):
        return float(np.average(self.bleurt.score(references, hypotheses)))