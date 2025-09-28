import asyncio
import json
import logging
from typing import AsyncGenerator, Optional
from app.orchestrator.rag_orchestrator import RAGOrchestrator
from app.agents.language_detect_agent import language_detect_agent
from app.agents.translator_agent import translator_agent
from app.core.config import settings

log = logging.getLogger(__name__)

class MultilangOrchestrator:
    def __init__(self, base_orchestrator: RAGOrchestrator):
        self.base_orchestrator = base_orchestrator

    async def handle_query(
        self,
        document_id: str,
        question: str,
        top_k: int = 10,
        return_top: int = 5,
        stream: bool = True,
        request_id: str = "",
        lang: str = "auto_detect"
    ) -> AsyncGenerator[str, None]:
        """
        Handle multilingual RAG query with detection and translation.
        Yields SSE events including new lang-detected and translation events.
        """
        # Step 1: Detect language
        detected_lang = lang if lang != "auto_detect" else language_detect_agent.detect_lang(question)
        log.info(f"Detected language: {detected_lang} for request {request_id}")

        # Yield lang-detected event
        if stream:
            yield f"data: {json.dumps({'type': 'lang-detected', 'data': {'lang': detected_lang}})}\n\n"

        # Step 2: Translate query if needed
        translated_question = question
        if detected_lang != 'en' and settings.ENABLE_TRANSLATION:
            log.info(f"Translating query from {detected_lang} to en for request {request_id}")
            translated_question = translator_agent.translate(question, detected_lang, 'en')
            if stream:
                yield f"data: {json.dumps({'type': 'translation', 'data': {'direction': 'query-to-en', 'original': question[:50], 'translated': translated_question[:50]}})}\n\n"

        # Step 3: Process with base orchestrator (in English)
        async for event in self.base_orchestrator.handle_query(
            document_id=document_id,
            question=translated_question,
            top_k=top_k,
            return_top=return_top,
            stream=stream,
            request_id=request_id,
            lang=detected_lang  # Pass detected lang for retrieval filtering
        ):
            if stream:
                # Check if it's the final answer event
                try:
                    event_data = json.loads(event.replace('data: ', '').replace('\n\n', ''))
                    if event_data.get('type') == 'answer' and detected_lang != 'en' and settings.ENABLE_TRANSLATION:
                        # Translate answer back to detected language
                        original_answer = event_data['data']['answer']
                        translated_answer = translator_agent.translate(original_answer, 'en', detected_lang)
                        event_data['data']['answer'] = translated_answer
                        event_data['data']['original_lang'] = 'en'
                        event_data['data']['translated_lang'] = detected_lang
                        yield f"data: {json.dumps(event_data)}\n\n"
                        # Yield translation event
                        yield f"data: {json.dumps({'type': 'translation', 'data': {'direction': 'answer-to-' + detected_lang, 'original': original_answer[:50], 'translated': translated_answer[:50]}})}\n\n"
                    else:
                        yield event
                except json.JSONDecodeError:
                    # Not a JSON event, yield as-is
                    yield event
            else:
                # For non-streaming, yield the final result (already handled in base)
                yield event
