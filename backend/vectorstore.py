import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma  # ✅ Новый импорт
from uuid import uuid4
load_dotenv()

PROJECT_ROOT = Path(__file__).parent.resolve()
INDEX_DIR = PROJECT_ROOT / os.getenv("INDEX_DIR", "indexes")

MAIN_INDEX = INDEX_DIR / "main_index"
TEMP_INDEX = INDEX_DIR / "last_uploaded"

# Ensure index directories exist
MAIN_INDEX.mkdir(parents=True, exist_ok=True)
TEMP_INDEX.mkdir(parents=True, exist_ok=True)
def load_vectorstore_temp(temp_path: Path):
    return Chroma(
        persist_directory=str(temp_path),
        embedding_function=get_embeddings()
    )

def get_embeddings():
    return OpenAIEmbeddings()

def load_vectorstore_main():
    """
    Загружает векторное хранилище всех документов (основной индекс)
    """
    return Chroma(
        persist_directory=str(MAIN_INDEX),
        embedding_function=get_embeddings()
    )

def load_vectorstore_temp(temp_path: Path):
    """
    Загружает временное хранилище (например, для одного загруженного файла)
    """
    return Chroma(
        persist_directory=str(temp_path),
        embedding_function=get_embeddings()
    )

def create_temp_vectorstore(texts, metadatas) -> Path:
    """
    Создаёт уникальное временное хранилище, возвращает путь
    """
    temp_dir = TEMP_INDEX / str(uuid4())
    temp_dir.mkdir(parents=True, exist_ok=True)

    vstore = Chroma.from_texts(
        texts, embedding=get_embeddings(), metadatas=metadatas,
        persist_directory=str(temp_dir)
    )
    vstore.persist()
    vstore._persist_client._client.close()
    return temp_dir

def clear_vectorstore_path(path: Path):
    """
    Удаляет векторное хранилище по пути (если не занят)
    """
    if path.exists():
        try:
            shutil.rmtree(path)
        except PermissionError as e:
            print(f"❌ Не удалось удалить {path}: {e}")
