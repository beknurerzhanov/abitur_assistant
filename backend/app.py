import os
import shutil
import traceback
from pathlib import Path
from uuid import uuid4
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from langchain_openai import OpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain_chroma import Chroma

from chat_memory import memory, build_memory
from vectorstore import (
    get_embeddings,
    load_vectorstore_main,
    load_vectorstore_temp,
    clear_vectorstore_path
)
from ingest import process_single_file, load_all_documents
from prompt_template import PROMPT

# 🔧 Настройки
load_dotenv()
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = (BASE_DIR / os.getenv("DATA_DIR", "data")).resolve()
INDEX_DIR = (BASE_DIR / os.getenv("INDEX_DIR", "indexes")).resolve()
MAIN_INDEX = INDEX_DIR / "main_index"
TEMP_INDEX = INDEX_DIR / "last_uploaded"

DATA_DIR.mkdir(parents=True, exist_ok=True)
MAIN_INDEX.mkdir(parents=True, exist_ok=True)
TEMP_INDEX.mkdir(parents=True, exist_ok=True)

# 🧠 Инициализация FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📄 Модели для чата
class ChatHistoryPair(BaseModel):
    question: str
    answer: str

class ChatRequest(BaseModel):
    question: str
    history: list[ChatHistoryPair] = []

class ChatResponse(BaseModel):
    answer: str
    source_documents: list[dict]

# 🤖 Глобальный Chain
chain = None

@app.on_event("startup")
def startup_event():
    global chain
    try:
        texts, metadatas = load_all_documents(DATA_DIR)
        if not texts:
            print("⚠️ No documents found.")
            return

        vstore = Chroma.from_texts(
            texts, embedding=get_embeddings(), metadatas=metadatas,
            persist_directory=str(MAIN_INDEX)
        )

        retriever = vstore.as_retriever(search_kwargs={"k": 3})
        chain = ConversationalRetrievalChain.from_llm(
            llm=OpenAI(temperature=float(os.getenv("TEMPERATURE", 0.2))),
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": PROMPT}
        )
        print("✅ Chain initialized from existing documents.")
    except Exception as e:
        print("❌ Startup failed:")
        traceback.print_exc()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global chain, memory

    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx", ".pptx", ".txt"]:
        return JSONResponse(status_code=400, content={"error": "Недопустимый тип файла"})

    filename = f"{uuid4().hex}{ext}"
    save_path = (DATA_DIR / filename).resolve()

    try:
        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ⬇️ обрабатываем файл и добавляем в хранилище
        file_texts, file_meta = process_single_file(save_path)

        main_vstore = load_vectorstore_main()
        main_vstore.add_texts(file_texts, metadatas=file_meta)

        # ⬇️ пересобираем chain с новым хранилищем
        retriever = main_vstore.as_retriever(search_kwargs={"k": 3})
        memory = build_memory()
        chain = ConversationalRetrievalChain.from_llm(
            llm=OpenAI(temperature=float(os.getenv("TEMPERATURE", 0.2))),
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": PROMPT}
        )

        # Временный chain — только для автоответа на вопрос «о чём документ»
        temp_chain = ConversationalRetrievalChain.from_llm(
            llm=OpenAI(temperature=float(os.getenv("TEMPERATURE", 0.2))),
            retriever=Chroma.from_texts(
                file_texts, embedding=get_embeddings(), metadatas=file_meta
            ).as_retriever(),
            memory=build_memory(),
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": PROMPT}
        )

        auto_question = "О чём этот документ?"
        result = temp_chain.invoke({"question": auto_question, "chat_history": []})

        return {
            "message": f"✅ Файл '{file.filename}' добавлен.",
            "auto_question": auto_question,
            "auto_answer": result.get("answer", ""),
            "source_documents": [
                {"source": doc.metadata.get("source"), "chunk_id": doc.metadata.get("chunk_id")}
                for doc in result.get("source_documents", [])
            ]
        }

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    global chain
    if not chain:
        raise HTTPException(500, "Chain not initialized")

    try:
        result = chain.invoke({
            "question": req.question.strip(),
            "chat_history": [(item.question, item.answer) for item in req.history]
        })

        answer = result.get("answer", "").strip()
        sources = [
            {"source": doc.metadata.get("source"), "chunk_id": doc.metadata.get("chunk_id")}
            for doc in result.get("source_documents", [])
        ]

        return ChatResponse(answer=answer, source_documents=sources)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Internal error: {str(e)}")

@app.post("/clear")
def clear_chat():
    global chain, memory
    memory = build_memory()

    # 🔹 Файлы, которые НЕ нужно удалять
    base_files = {"doc.docx"}

    for file in DATA_DIR.glob("*"):
        if file.name not in base_files:
            try:
                file.unlink()
                print(f"🗑️ Удалён: {file.name}")
            except Exception as e:
                print(f"⚠️ Не удалось удалить {file.name}: {e}")

    clear_vectorstore_path(MAIN_INDEX)
    clear_vectorstore_path(TEMP_INDEX)
    chain = None
    return {"message": "🧹 Чат очищен. Базовые файлы сохранены."}

