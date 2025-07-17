from pathlib import Path
from langchain_community.document_loaders import (
    UnstructuredPDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredPowerPointLoader,
    TextLoader,
)
from chunking import sentence_chunks
import nltk

nltk.download("punkt", quiet=True)

def process_single_file(file_path: Path):
    file_path = file_path.resolve()
    print(f"📄 Processing: {file_path}")

    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        loader = UnstructuredPDFLoader(str(file_path))
    elif suffix in {".pptx", ".ppt"}:
        loader = UnstructuredPowerPointLoader(str(file_path))
    elif suffix == ".docx":
        loader = UnstructuredWordDocumentLoader(str(file_path))
    elif suffix == ".txt":
        loader = TextLoader(str(file_path), encoding="utf8")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    documents = loader.load()
    for doc in documents:
        doc.metadata["source"] = str(file_path.resolve())
        print("📝 Stored metadata source:", doc.metadata["source"])

    texts, metadatas = [], []
    for doc in documents:
        chunks = sentence_chunks(doc.page_content)
        for i, chunk in enumerate(chunks):
            md = doc.metadata.copy()
            md["chunk_id"] = i
            texts.append(chunk)
            metadatas.append(md)

    return texts, metadatas

def load_all_documents(data_dir: Path):
    all_texts, all_metadatas = [], []
    for file_path in data_dir.glob("*"):
        if file_path.suffix.lower() in [".pdf", ".docx", ".pptx", ".txt"]:
            try:
                print(f"📄 Loading document: {file_path}")
                texts, metadatas = process_single_file(file_path)
                all_texts.extend(texts)
                all_metadatas.extend(metadatas)
            except Exception as e:
                print(f"⚠️ Failed to process {file_path.name}: {e}")
    return all_texts, all_metadatas
