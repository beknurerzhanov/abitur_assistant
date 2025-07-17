import os
import nltk
from tiktoken import encoding_for_model

nltk.download("punkt", quiet=True)
ENCODER = encoding_for_model("gpt-3.5-turbo")

MIN_CHUNK_SIZE = int(os.getenv("MIN_CHUNK_SIZE", 256))
MAX_CHUNK_SIZE = int(os.getenv("MAX_CHUNK_SIZE", 512))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 50))

def count_tokens(text: str) -> int:
    return len(ENCODER.encode(text))

def sentence_chunks(text: str) -> list[str]:
    sentences = nltk.sent_tokenize(text)
    chunks, chunk_sents, chunk_tokens = [], [], 0

    for sent in sentences:
        sent_tokens = count_tokens(sent)
        if chunk_sents and chunk_tokens + sent_tokens > MAX_CHUNK_SIZE:
            chunks.append(" ".join(chunk_sents))
            overlap_sents, overlap_tokens = [], 0
            for prev in reversed(chunk_sents):
                if overlap_tokens >= CHUNK_OVERLAP:
                    break
                overlap_sents.insert(0, prev)
                overlap_tokens = count_tokens(" ".join(overlap_sents))
            chunk_sents, chunk_tokens = overlap_sents, overlap_tokens

        chunk_sents.append(sent)
        chunk_tokens += sent_tokens

    if chunk_sents:
        chunks.append(" ".join(chunk_sents))

    return chunks
