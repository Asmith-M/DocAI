import asyncio
import json
from app.orchestrator.multilang_orchestrator import MultilangOrchestrator
from app.orchestrator.rag_orchestrator import RAGOrchestrator

async def test_hindi_query():
    orchestrator = MultilangOrchestrator(RAGOrchestrator())
    query = "परियोजना के उद्देश्य क्या हैं?"
    request_id = "test-request-001"

    print(f"Testing Hindi query: {query}")

    # Collect streamed events
    response_events = []
    async for event in orchestrator.handle_query(
        document_id="test-doc-001",
        question=query,
        top_k=5,
        return_top=3,
        stream=True,
        request_id=request_id,
        lang="auto_detect"
    ):
        print(f"Event: {event}")
        response_events.append(event)

    # Extract final answer from last 'complete' event
    final_answer = None
    for event in reversed(response_events):
        if event.startswith("data: "):
            data_json = event[len("data: "):]
            try:
                data = json.loads(data_json)
                if data.get("type") == "complete":
                    final_answer = data.get("data", {}).get("answer")
                    break
            except Exception:
                continue

    if final_answer:
        print(f"\nFinal Answer:\n{final_answer}")
        # Check if answer contains Hindi characters (basic check)
        if any("\u0900" <= c <= "\u097F" for c in final_answer):
            print("✅ Response is in Hindi as expected.")
        else:
            print("⚠️ Response does not appear to be in Hindi.")
    else:
        print("❌ No final answer found in response events.")

if __name__ == "__main__":
    asyncio.run(test_hindi_query())
