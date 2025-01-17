import math
import pathlib

import transformers
from model_setup import SAVE_PATH, URL
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline

MODEL_PATH = SAVE_PATH / "dbart"


def add_dot(text):
    if text[-1] != ".":
        return text + "."
    return text


class ConcluGen(object):
    def __init__(self):
        print("Transformers Version:", transformers.__version__)
        print(MODEL_PATH)
        self.metadata = {"model": URL}
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
        if self.tokenizer:
            print("Tokenizer initialized")
        self.model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH, local_files_only=True)
        if self.model:
            print("Model initialized")
        self.pipeline = pipeline(
            "summarization", model=self.model, tokenizer=self.tokenizer
        )
        if self.tokenizer and self.model and self.pipeline:
            print("Successfully initialized ConcluGen")
        else:
            print("Model initialization failed")

    def _decode(self, tokens):
        return self.tokenizer.decode(tokens, skip_special_tokens=True)

    def _split(self, text):
        tokenize_result = self.tokenizer(
            text,
            add_special_tokens=True,
            padding=True,
            return_tensors="pt",
            truncation=True,
            return_overflowing_tokens=True,
            return_attention_mask=True,
        )
        token_chunks = tokenize_result.input_ids
        length = tokenize_result.attention_mask.sum(axis=1).tolist()
        text_chunks = [self._decode(chunk) for chunk in token_chunks]
        return list(zip(text_chunks, length))

    def _summarize_chunk(self, text, length, ratio, tolerance=0.1):
        if ratio > 0.5:
            ratio = 0.5
        if length < 5:  # too short inputs may give errors
            return ""
        requested_length = ratio * length
        max_length = max(
            math.floor((1 + tolerance) * requested_length), 16
        )  # short max_length will give error for short inputs
        min_length = math.floor((1 - tolerance) * requested_length)

        summary = self.pipeline(
            text,
            min_length=min_length,
            max_length=max_length,
            clean_up_tokenization_spaces=True,
        )[0]["summary_text"]
        return summary

    def summarize(self, text: str = None, ratio: float = 0.2):
        """BART cannot process sequences longer than 1024 tokens. Thus, truncate the text to appropriate number of tokens."""

        chunks = self._split(text)
        # don't summarize last chunk if too short
        if len(chunks) > 1 and chunks[-1][1] < 50:
            chunks.pop()

        summaries = [
            self._summarize_chunk(text, length, ratio) for text, length in chunks
        ]
        summaries = [s.replace("<n>", " ").replace("\n", " ") for s in summaries]
        summaries = [s.strip() for s in summaries]
        summaries = [add_dot(s) for s in summaries if s]
        return " ".join(summaries)


class SummarizerPlugin:
    def __init__(self):
        print("Initializing Conclugen")
        self.summarizer = ConcluGen()

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]

    def metadata(self):
        return self.summarizer.metadata
