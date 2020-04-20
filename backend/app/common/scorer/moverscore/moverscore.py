# MIT License
#
# Copyright (c) 2018 Han Xiao
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from __future__ import absolute_import, division, print_function

import string
from collections import Counter, defaultdict
from functools import partial
from itertools import chain
from math import log
from multiprocessing import Pool

import numpy as np
import torch
from pyemd import emd, emd_with_flow
from torch import nn
from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizer

model_name = "distilbert-base-uncased"
device = "cuda:0" if torch.cuda.is_available() else "cpu"
config = DistilBertConfig.from_pretrained(
    model_name, output_hidden_states=True, output_attentions=True
)
tokenizer = DistilBertTokenizer.from_pretrained(model_name, do_lower_case=False)
model = DistilBertModel.from_pretrained(model_name, config=config)
model.eval()
model.to(device)


def process(a):
    a = ["[CLS]"] + tokenizer.tokenize(a) + ["[SEP]"]
    a = tokenizer.convert_tokens_to_ids(a)
    return set(a)


def get_idf_dict(arr, nthreads=4):
    idf_count = Counter()
    num_docs = len(arr)

    process_partial = partial(process)

    with Pool(nthreads) as p:
        idf_count.update(chain.from_iterable(p.map(process_partial, arr)))

    idf_dict = defaultdict(lambda: log((num_docs + 1) / (1)))
    idf_dict.update(
        {idx: log((num_docs + 1) / (c + 1)) for (idx, c) in idf_count.items()}
    )
    return idf_dict


def padding(arr, pad_token, dtype=torch.long):
    lens = torch.LongTensor([len(a) for a in arr])
    max_len = lens.max().item()
    padded = torch.ones(len(arr), max_len, dtype=dtype) * pad_token
    mask = torch.zeros(len(arr), max_len, dtype=torch.long)
    for i, a in enumerate(arr):
        padded[i, : lens[i]] = torch.tensor(a, dtype=dtype)
        mask[i, : lens[i]] = 1
    return padded, lens, mask


def bert_encode(model, x, attention_mask):
    model.eval()
    with torch.no_grad():
        output, x_encoded_layers, _ = model(input_ids=x, attention_mask=attention_mask)
    return x_encoded_layers


# with open('stopwords.txt', 'r', encoding='utf-8') as f:
#    stop_words = set(f.read().strip().split(' '))


def collate_idf(arr, tokenize, numericalize, idf_dict, pad="[PAD]", device=device):

    tokens = [["[CLS]"] + tokenize(a) + ["[SEP]"] for a in arr]
    arr = [numericalize(a) for a in tokens]

    idf_weights = [[idf_dict[i] for i in a] for a in arr]

    pad_token = numericalize([pad])[0]

    padded, lens, mask = padding(arr, pad_token, dtype=torch.long)
    padded_idf, _, _ = padding(idf_weights, pad_token, dtype=torch.float)

    padded = padded.to(device=device)
    mask = mask.to(device=device)
    lens = lens.to(device=device)
    return padded, padded_idf, lens, mask, tokens


def get_bert_embedding(
    all_sens, model, tokenizer, idf_dict, batch_size=-1, device=device
):

    padded_sens, padded_idf, lens, mask, tokens = collate_idf(
        all_sens,
        tokenizer.tokenize,
        tokenizer.convert_tokens_to_ids,
        idf_dict,
        device=device,
    )

    if batch_size == -1:
        batch_size = len(all_sens)

    embeddings = []
    with torch.no_grad():
        for i in range(0, len(all_sens), batch_size):
            batch_embedding = bert_encode(
                model,
                padded_sens[i : i + batch_size],
                attention_mask=mask[i : i + batch_size],
            )
            batch_embedding = torch.stack(batch_embedding)
            embeddings.append(batch_embedding)
            del batch_embedding

    total_embedding = torch.cat(embeddings, dim=-3)
    return total_embedding, lens, mask, padded_idf, tokens


def _safe_divide(numerator, denominator):
    return numerator / (denominator + 1e-30)


def batched_cdist_l2(x1, x2):
    x1_norm = x1.pow(2).sum(dim=-1, keepdim=True)
    x2_norm = x2.pow(2).sum(dim=-1, keepdim=True)
    res = (
        torch.baddbmm(x2_norm.transpose(-2, -1), x1, x2.transpose(-2, -1), alpha=-2)
        .add_(x1_norm)
        .clamp_min_(1e-30)
        .sqrt_()
    )
    return res


def word_mover_score(
    refs,
    hyps,
    idf_dict_ref,
    idf_dict_hyp,
    stop_words=[],
    n_gram=1,
    remove_subwords=True,
    batch_size=256,
    device=device,
):
    preds = []
    for batch_start in range(0, len(refs), batch_size):
        batch_refs = refs[batch_start : batch_start + batch_size]
        batch_hyps = hyps[batch_start : batch_start + batch_size]

        ref_embedding, ref_lens, ref_masks, ref_idf, ref_tokens = get_bert_embedding(
            batch_refs, model, tokenizer, idf_dict_ref, device=device
        )
        hyp_embedding, hyp_lens, hyp_masks, hyp_idf, hyp_tokens = get_bert_embedding(
            batch_hyps, model, tokenizer, idf_dict_hyp, device=device
        )

        ref_embedding = ref_embedding[-1]
        hyp_embedding = hyp_embedding[-1]

        batch_size = len(ref_tokens)
        for i in range(batch_size):
            ref_ids = [
                k
                for k, w in enumerate(ref_tokens[i])
                if w in stop_words or "##" in w or w in set(string.punctuation)
            ]
            hyp_ids = [
                k
                for k, w in enumerate(hyp_tokens[i])
                if w in stop_words or "##" in w or w in set(string.punctuation)
            ]

            ref_embedding[i, ref_ids, :] = 0
            hyp_embedding[i, hyp_ids, :] = 0

            ref_idf[i, ref_ids] = 0
            hyp_idf[i, hyp_ids] = 0

        raw = torch.cat([ref_embedding, hyp_embedding], 1)

        raw.div_(torch.norm(raw, dim=-1).unsqueeze(-1) + 1e-30)

        distance_matrix = batched_cdist_l2(raw, raw).double().cpu().numpy()

        for i in range(len(ref_lens)):
            c1 = np.zeros(raw.shape[1], dtype=np.float)
            c2 = np.zeros(raw.shape[1], dtype=np.float)
            c1[: len(ref_idf[i])] = ref_idf[i]
            c2[len(ref_idf[i]) :] = hyp_idf[i]

            c1 = _safe_divide(c1, np.sum(c1))
            c2 = _safe_divide(c2, np.sum(c2))

            dst = distance_matrix[i]
            _, flow = emd_with_flow(c1, c2, dst)
            flow = np.array(flow, dtype=np.float32)
            score = 1 - np.sum(flow * dst)
            preds.append(score)

    return preds


class MoverScore:
    def __init__(self):
        pass

    def score(self, hypotheses, references):
        idf_dict_hyp = get_idf_dict(hypotheses)
        idf_dict_ref = get_idf_dict(references)

        scores = word_mover_score(
            references,
            hypotheses,
            idf_dict_ref,
            idf_dict_hyp,
            stop_words=[],
            n_gram=1,
            remove_subwords=True,
        )

        return float(np.average(scores))