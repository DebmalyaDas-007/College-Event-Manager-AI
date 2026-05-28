import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from pydantic import BaseModel, Field
from typing import List

# 1. Automatically load keys from your local .env file
load_dotenv()

# Set up tracing if your LangSmith keys are present in your environment
if os.getenv("LANGSMITH_API_KEY"):
    os.environ["LANGSMITH_TRACING"] = "true"

# 2. Initialize Gemini LLM (For structured feed generation)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2
)

# 3. Initialize Embeddings using your doc's model choice
# Note: LangChain automatically checks for "GOOGLE_API_KEY" or "GEMINI_API_KEY"
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

# 4. Connect to your Persistent local ChromaDB collection
vectorstore = Chroma(
    collection_name="campus_events",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})


# =======================================================
# 5. DEFINE STRUCTURED FEED & SYSTEM ACTIONS
# ======================================================

class EventRecommendation(BaseModel):
    event_id: str = Field(description="The unique identifier of the event matching database entries")
    event_title: str = Field(description="Name of the campus event")
    fomo_score: int = Field(description="An urgency score from 1 to 100 based on interest fit and deadlines")
    personalized_reason: str = Field(description="A short, catchy hook explaining why they shouldn't miss this")

class PersonalizedFeedSchema(BaseModel):
    feed: List[EventRecommendation]

structured_recommendation_llm = llm.with_structured_output(PersonalizedFeedSchema)

def get_personalized_recommendations(student_profile: str) -> dict:
    """Queries ChromaDB, then leverages Gemini to score the final output."""
    matched_docs = retriever.invoke(student_profile)
    
    context_data = ""
    for doc in matched_docs:
        event_id = doc.metadata.get("event_id", "unknown")
        context_data += f"\n[ID: {event_id}] Event Context: {doc.page_content}\n---"
    
    if not context_data.strip():
        return {"feed": []}

    recommendation_prompt = f"""
    You are the personalization engine of Nexus AI. Analyze the events against the student profile.
    
    Student Profile Context: "{student_profile}"
    Available Campus Events Context: {context_data}
    """
    
    structured_response = structured_recommendation_llm.invoke(recommendation_prompt)
    return structured_response.dict()


# Replace your seed function in app/services/ai_engine.py with this:

# Replace your seed function in app/services/ai_engine.py with this:

def seed_mock_events():
    """
    Safely seed vectors using the native chromadb SDK client, 
    completely bypassing the buggy langchain-chroma indexing loop.
    """
    import chromadb

    mock_texts = [
        "Event: Hack-Nexus 2026. A 24-hour hackathon focused on building Generative AI pipelines and LLM apps using FastAPI. Organized by Tech Club.",
        "Event: Design Sprint 7.0. UI/UX design competition covering Tailwind CSS layouts, dashboard wires, and interactive systems. Organized by SAEINDIA.",
        "Event: Algorithmic Crackdown. A C++ competitive programming marathon evaluating advanced tree, graph, and matrix structures."
    ]
    
    mock_metadatas = [
        {"event_id": "evt_ai_101"},
        {"event_id": "evt_ux_202"},
        {"event_id": "evt_cpp_303"}
    ]
    
    ids = ["id_1", "id_2", "id_3"]
    
    print("Clearing out old ephemeral database items...")
    
    # 1. Embed each text individually to guarantee exactly 3 flat vectors
    raw_embeddings = [embeddings.embed_query(text) for text in mock_texts]
    
    # Sanity check — catches wrapping bugs early
    assert len(raw_embeddings) == len(mock_texts), (
        f"Embedding count mismatch: got {len(raw_embeddings)}, expected {len(mock_texts)}"
    )
    
    # 2. Use the native chromadb client to safely construct and fill the folder
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    
    # Get or create the exact collection namespace your app reads from
    collection = chroma_client.get_or_create_collection(name="campus_events")
    
    # 3. Delete any existing docs with the same IDs to allow clean re-seeding
    existing = collection.get(ids=ids)
    if existing["ids"]:
        collection.delete(ids=existing["ids"])
        print(f"Removed {len(existing['ids'])} stale entries before re-seeding...")
    
    # 4. Add the elements directly into the database files safely
    collection.add(
        documents=mock_texts,
        embeddings=raw_embeddings,
        metadatas=mock_metadatas,
        ids=ids
    )
    
    print("Successfully injected mock campus events into ChromaDB folder via native engine!")