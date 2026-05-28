import os
import json
from dotenv import load_dotenv
from redis import Redis
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, messages_from_dict, messages_to_dict
from langchain_core.output_parsers import StrOutputParser

# Load environment keys from your local root .env file
load_dotenv()

# =======================================================
# 1. CORE AI ENGINES & EMBEDDINGS SETUP
# =======================================================
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

# =======================================================
# 2. VECTORSTORE RETRIEVERS CONFIGURATION
# =======================================================
# Primary collection: Tracks local campus hackathons, design sprints, etc.
events_vectorstore = Chroma(
    collection_name="campus_events",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
events_retriever = events_vectorstore.as_retriever(search_kwargs={"k": 2})

# Secondary collection: Tracks the scraped AI Agent technical knowledge documents from your documentation
agent_vectorstore = Chroma(
    collection_name="agent_knowledge",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
agent_retriever = agent_vectorstore.as_retriever(search_kwargs={"k": 2})

# =======================================================
# 3. REDIS CONNECTION INITIALIZATION
# =======================================================
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = Redis.from_url(redis_url, decode_responses=True)

# =======================================================
# 4. CONVERSATIONAL RAG PROMPT ARCHITECTURE
# =======================================================
system_prompt = (
    "You are Nexus AI, a highly capable student assistant managing campus events and "
    "technical domain knowledge. Use the provided sections of retrieved context to "
    "accurately answer the user's question.\n\n"
    "If you do not know the answer or if the context does not explicitly contain "
    "the information, inform the user clearly that you cannot find that specific detail "
    "in your current knowledge bank. Do not make up facts or generate hallucinations.\n\n"
    "Retrieved System Context:\n{context}"
)

contextual_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
])

# 5. Modern LCEL Replacement Chain
# Combines your prompt rules, streams it through Gemini, and cleanly outputs string text
rag_chain = contextual_prompt | llm | StrOutputParser()


# =======================================================
# 6. REDIS SESSION STORAGE UTILITIES
# =======================================================

def _get_redis_chat_history(session_id: str) -> list:
    """Fetches and restores serialized LangChain message structures out of Redis cache."""
    redis_key = f"nexus_chat:{session_id}"
    saved_data = redis_client.get(redis_key)
    
    if not saved_data:
        return []
    
    try:
        dict_messages = json.loads(saved_data)
        return messages_from_dict(dict_messages)
    except Exception:
        return []


def _save_redis_chat_history(session_id: str, history: list):
    """Serializes conversation objects back into Redis with a rolling 24-hour expiration."""
    redis_key = f"nexus_chat:{session_id}"
    
    # Cap memory context at the last 10 messages to prevent buffer window inflation
    if len(history) > 10:
        history = history[-10:]
        
    dict_messages = messages_to_dict(history)
    redis_client.set(redis_key, json.dumps(dict_messages), ex=86400)


# =======================================================
# 7. CORE INTEGRATED ASSISTANT ENGINE ENTRYPOINT
# =======================================================

def get_chatbot_response(session_id: str, user_message: str) -> str:
    """
    Coordinates session state management through Redis, pools contexts 
    across multiple vector collection layers manually, and returns an optimized reply.
    """
    # 1. Pull message histories from Redis cache state
    history = _get_redis_chat_history(session_id)
    
    # 2. Dynamic Knowledge Pooling: Query both context vectors concurrently
    event_docs = events_retriever.invoke(user_message)
    agent_docs = agent_retriever.invoke(user_message)
    
    # Blend combined results cleanly into a consolidated text block
    combined_docs = ""
    for doc in event_docs:
        combined_docs += f"\n[Source: Campus Events] Context: {doc.page_content}\n"
    for doc in agent_docs:
        combined_docs += f"\n[Source: Agent Tech Docs] Context: {doc.page_content}\n"

    # 3. Direct execution over our modern LCEL stream pipeline
    ai_answer = rag_chain.invoke({
        "input": user_message,
        "chat_history": history,
        "context": combined_docs
    })
    
    # 4. Append message tracking turns to sustain interaction state
    history.append(HumanMessage(content=user_message))
    history.append(AIMessage(content=ai_answer))
    
    # 5. Push the serializations back out to your active cache node
    _save_redis_chat_history(session_id, history)
    
    return ai_answer