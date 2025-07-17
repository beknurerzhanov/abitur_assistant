import os
from dotenv import load_dotenv
from langchain.memory import ConversationSummaryMemory
from langchain_openai import OpenAI

load_dotenv()

def build_memory():
    llm = OpenAI(
        temperature=float(os.getenv("MEMORY_LL_TEMPERATURE", 0)),
        max_tokens=1500  # ✅ устанавливаем лимит на длину ответа
    )
    return ConversationSummaryMemory(
        llm=llm,
        memory_key="memory",
        input_key="question",
        output_key="answer"
    )


memory = build_memory()
