import logging
import re
from typing import List, Dict, Any
from app.services.embedding_service import embedding_service
from app.agents.translator_agent import translator_agent
import asyncio

log = logging.getLogger(__name__)

class VerifierAgent:
    """
    Agent responsible for verifying and validating RAG responses.
    Performs deterministic checks on generated answers.
    """

    def __init__(self):
        self.fact_patterns = [
            r'\b\d{1,4}(?:\.\d+)?\b',  # Numbers
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Proper nouns
            r'\b\d{4}\b',  # Years
            r'\$\d+(?:\.\d{2})?',  # Currency
            r'\d+(?:\.\d+)?%',  # Percentages
        ]

    async def verify_answer(
        self,
        query: str,
        answer: str,
        context_chunks: List[Dict[str, Any]],
        lang: str = 'en'
    ) -> Dict[str, Any]:
        """
        Verify the generated answer against the context asynchronously.

        Args:
            query: Original user query
            answer: Generated answer to verify
            context_chunks: Context chunks used for generation

        Returns:
            Verification results with confidence score and issues
        """
        try:
            log.info(f"🔍 VerifierAgent: Starting verification")
            log.info(f"📝 Query: {query}")
            log.info(f"📄 Answer length: {len(answer)} characters")
            log.info(f"📊 Context chunks: {len(context_chunks)}")

            # Validate inputs
            if not query or not answer:
                log.warning(f"⚠️ VerifierAgent: Empty query or answer provided")
                return {
                    'confidence_score': 0.0,
                    'confidence_level': 'low',
                    'issues': ['Empty query or answer provided'],
                    'hallucination_risk': 'high'
                }

            if not context_chunks:
                log.warning(f"⚠️ VerifierAgent: No context chunks provided")
                return {
                    'confidence_score': 0.0,
                    'confidence_level': 'low',
                    'issues': ['No context chunks provided'],
                    'hallucination_risk': 'high'
                }

            # Translate to English for verification if needed
            if lang != 'en':
                log.info(f"Translating answer and context from {lang} to en for verification")
                translated_answer = await asyncio.to_thread(translator_agent.translate, answer, lang, 'en')
                translated_context = []
                for chunk in context_chunks:
                    translated_text = await asyncio.to_thread(translator_agent.translate, chunk.get('text', ''), lang, 'en')
                    translated_chunk = dict(chunk)
                    translated_chunk['text'] = translated_text
                    translated_context.append(translated_chunk)
                # Also translate query if it's not in English
                translated_query = await asyncio.to_thread(translator_agent.translate, query, lang, 'en')
            else:
                translated_answer = answer
                translated_context = context_chunks
                translated_query = query

            verification_results = {
                'confidence_score': 0.0,
                'issues': [],
                'fact_checks': [],
                'context_coverage': 0.0,
                'hallucination_risk': 'low'
            }

            # Check 1: Context coverage
            log.info(f"🔍 Step 1: Checking context coverage")
            context_coverage = await asyncio.to_thread(self._check_context_coverage, translated_answer, translated_context)
            verification_results['context_coverage'] = context_coverage
            log.info(f"✅ Context coverage: {context_coverage:.2f}")

            # Check 2: Fact verification
            log.info(f"🔍 Step 2: Verifying facts")
            fact_checks = await asyncio.to_thread(self._verify_facts, translated_answer, translated_context)
            verification_results['fact_checks'] = fact_checks
            verified_count = sum(1 for check in fact_checks if check['verified'])
            log.info(f"✅ Fact checks: {verified_count}/{len(fact_checks)} verified")

            # Check 3: Answer relevance
            log.info(f"🔍 Step 3: Checking relevance")
            relevance_score = await asyncio.to_thread(self._check_relevance, translated_query, translated_answer)
            verification_results['relevance_score'] = relevance_score
            log.info(f"✅ Relevance score: {relevance_score:.2f}")

            # Check 4: Hallucination detection
            log.info(f"🔍 Step 4: Detecting hallucinations")
            hallucination_risk = await asyncio.to_thread(self._detect_hallucinations, translated_answer, translated_context)
            verification_results['hallucination_risk'] = hallucination_risk
            log.info(f"✅ Hallucination risk: {hallucination_risk}")

            # Calculate overall confidence score
            confidence_score = await asyncio.to_thread(
                self._calculate_confidence_score,
                context_coverage, fact_checks, relevance_score, hallucination_risk
            )
            verification_results['confidence_score'] = confidence_score
            log.info(f"🎯 Final confidence score: {confidence_score:.2f}")

            # Determine confidence level
            if confidence_score >= 0.8:
                verification_results['confidence_level'] = 'high'
            elif confidence_score >= 0.6:
                verification_results['confidence_level'] = 'medium'
            else:
                verification_results['confidence_level'] = 'low'

            log.info(f"🏆 Confidence level: {verification_results['confidence_level']}")
            return verification_results

        except Exception as e:
            log.error(f"❌ Error in VerifierAgent.verify_answer: {e}")
            log.error(f"❌ Error type: {type(e).__name__}")
            return {
                'confidence_score': 0.0,
                'confidence_level': 'low',
                'issues': [f'Verification failed: {str(e)}'],
                'hallucination_risk': 'high'
            }

    def _check_context_coverage(self, answer: str, context_chunks: List[Dict[str, Any]]) -> float:
        """Check how much of the answer is covered by the context."""
        if not context_chunks:
            return 0.0

        # Combine all context text
        context_text = ' '.join([chunk.get('text', '') for chunk in context_chunks])
        context_words = set(context_text.lower().split())

        # Extract key phrases from answer
        answer_sentences = re.split(r'[.!?]+', answer)
        covered_sentences = 0

        for sentence in answer_sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            sentence_words = set(sentence.lower().split())
            # Check if significant portion of sentence words are in context
            overlap = len(sentence_words.intersection(context_words))
            coverage_ratio = overlap / len(sentence_words) if sentence_words else 0

            if coverage_ratio > 0.5:  # More than 50% word overlap
                covered_sentences += 1

        coverage = covered_sentences / len(answer_sentences) if answer_sentences else 0
        return min(coverage, 1.0)  # Cap at 100%

    def _verify_facts(self, answer: str, context_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract and verify factual claims in the answer."""
        fact_checks = []

        # Extract potential facts from answer
        extracted_facts = self._extract_facts(answer)

        for fact in extracted_facts:
            # Check if fact appears in context
            found_in_context = False
            supporting_chunks = []

            for chunk in context_chunks:
                chunk_text = chunk.get('text', '').lower()
                if fact.lower() in chunk_text:
                    found_in_context = True
                    supporting_chunks.append({
                        'chunk_index': chunk.get('metadata', {}).get('chunk_index'),
                        'page': chunk.get('metadata', {}).get('page'),
                        'text': chunk.get('text', '')[:100] + '...'  # Truncate for brevity
                    })

            fact_checks.append({
                'fact': fact,
                'verified': found_in_context,
                'supporting_chunks': supporting_chunks
            })

        return fact_checks

    def _extract_facts(self, text: str) -> List[str]:
        """Extract potential factual claims from text."""
        facts = []

        # Look for sentences with factual patterns
        sentences = re.split(r'[.!?]+', text)

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            # Check if sentence contains factual patterns
            has_fact_pattern = any(re.search(pattern, sentence) for pattern in self.fact_patterns)

            if has_fact_pattern:
                facts.append(sentence)

        return facts

    def _check_relevance(self, query: str, answer: str) -> float:
        """Check how relevant the answer is to the query."""
        try:
            # Simple relevance check based on word overlap
            query_words = set(query.lower().split())
            answer_words = set(answer.lower().split())

            overlap = len(query_words.intersection(answer_words))
            relevance = overlap / len(query_words) if query_words else 0

            return min(relevance, 1.0)
        except Exception:
            return 0.0

    def _detect_hallucinations(self, answer: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Detect potential hallucinations in the answer."""
        if not context_chunks:
            return 'high'

        context_text = ' '.join([chunk.get('text', '') for chunk in context_chunks])

        # Check for common hallucination indicators
        hallucination_indicators = [
            'i think', 'i believe', 'probably', 'maybe', 'perhaps',
            'it seems', 'i recall', 'as far as i know'
        ]

        answer_lower = answer.lower()
        has_uncertainty = any(indicator in answer_lower for indicator in hallucination_indicators)

        # Check context coverage
        coverage = self._check_context_coverage(answer, context_chunks)

        if coverage < 0.3:
            return 'high'
        elif coverage < 0.6 or has_uncertainty:
            return 'medium'
        else:
            return 'low'

    def _calculate_confidence_score(
        self,
        context_coverage: float,
        fact_checks: List[Dict[str, Any]],
        relevance_score: float,
        hallucination_risk: str
    ) -> float:
        """Calculate overall confidence score."""
        # Base score from context coverage
        score = context_coverage * 0.4

        # Add relevance score
        score += relevance_score * 0.3

        # Factor in fact verification
        if fact_checks:
            verified_facts = sum(1 for check in fact_checks if check['verified'])
            fact_accuracy = verified_facts / len(fact_checks)
            score += fact_accuracy * 0.2

        # Adjust for hallucination risk
        risk_penalty = {'low': 0, 'medium': 0.1, 'high': 0.3}
        score -= risk_penalty.get(hallucination_risk, 0.1)

        return max(0.0, min(1.0, score))

# Global instance
verifier_agent = VerifierAgent()
