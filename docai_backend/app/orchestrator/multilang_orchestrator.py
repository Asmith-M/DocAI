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
        Handle multilingual RAG queries with proper language workflow:
        1. Detect language
        2. Translate query to English if needed
        3. Process in English
        4. Verify answer in English
        5. Only translate verified answers back
        """
        log.info(f"🌐 Starting multilingual query processing for request {request_id}")
        
        try:
            # Step 1: Language Detection
            detected_lang = lang
            if lang == "auto_detect":
                try:
                    detected_lang = language_detect_agent.detect_lang(question)
                    log.info(f"Detected language '{detected_lang}' for question: {question[:50]}...")
                    log.info(f"🔍 Detected language: {detected_lang} for request {request_id}")
                except Exception as e:
                    log.error(f"❌ Language detection failed: {str(e)}")
                    detected_lang = 'en'  # Fallback to English on detection failure
            
            if stream:
                yield f"data: {json.dumps({'type': 'lang-detected', 'data': {
                    'lang': detected_lang,
                    'confidence': None  # Basic detection doesn't provide confidence scores
                }})}\n\n"
            
            # For English queries, bypass translation
            if detected_lang == 'en':
                log.info("✅ English query - proceeding without translation")
                translated_question = question
            else:
                try:
                    # Step 2: Translate query to English
                    log.info(f"📝 Translating query from {detected_lang} to English")
                    translated_question = await translator_agent.translate_to_english(question)
                    log.info(f"✅ Query translated: {translated_question[:100]}")
                    
                    if stream:
                        yield f"data: {json.dumps({'type': 'translation', 'data': {
                            'stage': 'query',
                            'from_lang': detected_lang,
                            'to_lang': 'en',
                            'original': question[:100],
                            'translated': translated_question[:100]
                        }})}\n\n"
                except Exception as e:
                    log.error(f"❌ Query translation failed: {str(e)}")
                    raise

            # Step 3: Process with base orchestrator (in English)
            # Step 3: Process with RAG in English
            log.info(f"🎯 Processing RAG query in English")
            async for event in self.base_orchestrator.handle_query(
                document_id=document_id,
                question=translated_question,
                top_k=top_k,
                return_top=return_top,
                stream=stream,
                request_id=request_id
            ):
                try:
                    # Parse event
                    event_text = event.replace('data: ', '').strip()
                    if not event_text:
                        continue
                        
                    event_data = json.loads(event_text)
                    event_type = event_data.get('type')
                    
                    # Handle different event types
                    if event_type == 'complete' and detected_lang != 'en':
                        # This is the final event with verified answer
                        if event_data.get('data', {}).get('verification', {}).get('passed', False):
                            try:
                                # Only translate verified answers
                                original_answer = event_data['data']['answer']
                                log.info(f"🔄 Translating verified answer to {detected_lang}")
                                translated_answer = await translator_agent.translate_from_english(
                                    original_answer, 
                                    detected_lang
                                )
                                
                                # Update event with translated content
                                event_data['data']['answer'] = translated_answer
                                event_data['data']['translation_info'] = {
                                    'original_lang': 'en',
                                    'target_lang': detected_lang,
                                    'translated': True
                                }
                                
                                # Emit translation event
                                yield f"data: {json.dumps({'type': 'translation', 'data': {
                                    'stage': 'answer',
                                    'from_lang': 'en',
                                    'to_lang': detected_lang,
                                    'verified': True
                                }})}\n\n"
                                
                            except Exception as e:
                                log.error(f"❌ Answer translation failed: {str(e)}")
                                # Keep original answer on translation failure
                                event_data['data']['translation_error'] = str(e)
                                
                        else:
                            log.warning("⚠️ Answer failed verification - skipping translation")
                            event_data['data']['translation_info'] = {
                                'translated': False,
                                'reason': 'Answer failed verification'
                            }
                            
                        yield f"data: {json.dumps(event_data)}\n\n"
                        
                    elif event_type == 'error':
                        # Pass through errors with added context
                        log.error(f"❌ Error in base processing: {event_data.get('data', {}).get('error')}")
                        event_data['data']['lang_context'] = {
                            'original_lang': detected_lang,
                            'processing_lang': 'en'
                        }
                        yield f"data: {json.dumps(event_data)}\n\n"
                        
                    else:
                        # Pass through all other events unchanged
                        yield event
                        
                except json.JSONDecodeError as e:
                    log.error(f"❌ Failed to parse event: {str(e)}")
                    yield event  # Pass through unparseable events
                except Exception as e:
                    log.error(f"❌ Error processing event: {str(e)}")
                    yield f"data: {json.dumps({'type': 'error', 'data': {
                        'error': f'Event processing failed: {str(e)}',
                        'lang_context': {
                            'original_lang': detected_lang,
                            'processing_lang': 'en'
                        }
                    }})}\n\n"
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            log.error(f"❌ MultilangOrchestrator error: {error_type} - {error_msg}", exc_info=True)
            
            error_data = {
                'type': 'error',
                'data': {
                    'error': error_msg,
                    'error_type': error_type,
                    'stage': 'multilang_processing',
                    'lang_context': {
                        'original_lang': detected_lang if 'detected_lang' in locals() else 'unknown',
                        'processing_lang': 'en'
                    }
                }
            }
            
            if stream:
                yield f"data: {json.dumps(error_data)}\n\n"
            else:
                yield json.dumps(error_data)
