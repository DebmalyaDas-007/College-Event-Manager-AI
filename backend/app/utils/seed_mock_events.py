import os
import chromadb
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

# Initialize your verified embeddings engine
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

def seed_mock_campus_events():
    """Seeds rich contextual text data into the 'campus_events' vector collection."""
    print("Initializing local ChromaDB connection client...")
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    
    # Target your chatbot's primary campus events namespace
    collection = chroma_client.get_or_create_collection(name="campus_events")
    
    # 1. High-fidelity semantic strings simulating real campus records
    mock_events = [
        "Event Title: Hack-Nexus 2026. Organized by: SAEINDIA Collegiate Club at NIT Durgapur. Venue: Lords Amphitheatre. Description: A flagship 36-hour hackathon focused on building production-ready Generative AI pipelines and scalable backend applications using Python and FastAPI. Tech Stack Required: Python, FastAPI, Tailwind CSS, LangChain, and MongoDB. Rules: Teams must consist of 2 to 4 members. Use of pre-built open-source code is allowed, but AI feature logic must be developed completely during the hacking window.",
        
        "Event Title: Design Sprint 7.0 (SDV). Organized by: Innovation and Prototype Cell. Venue: Mechanical Engineering Lab Workshop. Description: An intensive UI/UX and hardware prototyping competition challenge. Teams are tasked with engineering sustainable mobility vehicle drafts and accompanying interactive system monitoring screens. Tech Stack Covered: Tailwind CSS layout designs, dashboard wireframing frameworks, Figma components, and functional interactive components.",
        
        "Event Title: Aarohan Tech Fest Keynote. Organized by: Core Student Organizing Committee. Venue: Netaji Auditorium. Description: The opening global panel discussion featuring developers discussing the future of Large Language Models and engineering patterns for Autonomous AI systems."
    ]
    
    ids = [f"mock_evt_{i}" for i in range(len(mock_events))]
    metadatas = [{"source": "mock_seeding", "event_index": i} for i in range(len(mock_events))]
    
    print(f"Generating embeddings for {len(mock_events)} mock event records...")
    # Calculate embeddings sequentially to stay safe from standard library batch errors
    raw_embeddings = [embeddings.embed_query(evt) for evt in mock_events]
    
    # Clear out any matching old IDs if re-running
    existing = collection.get(ids=ids)
    if existing["ids"]:
        collection.delete(ids=existing["ids"])
        print("Flushed old matching mock data slots cleanly.")
        
    # Write directly into local persistent disk files
    collection.add(
        documents=mock_events,
        embeddings=raw_embeddings,
        metadatas=metadatas,
        ids=ids
    )
    print("Successfully populated and verified 'campus_events' index workspace! 🎉")

if __name__ == "__main__":
    seed_mock_campus_events()