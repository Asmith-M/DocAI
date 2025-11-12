import re
import time
from typing import List, Dict, Any
from loguru import logger
from app.services.embedding_service import embedding_service

# Ensure embedding service is available
try:
    # Test embedding service availability
    embedding_service.get_embedding_status("test")
    logger.info("✅ VerifierAgent: Embedding service initialized successfully")
except Exception as e:
    logger.warning(f"⚠️ VerifierAgent: Embedding service not available: {e}")

from app.utils.agent_timer import log_time

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

    @log_time
    def verify_answer(
        self,
        query: str,
        answer: str,
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verify the generated answer against the context.

        Args:
            query: Original user query
            answer: Generated answer to verify
            context_chunks: Context chunks used for generation

        Returns:
            Verification results with confidence score and issues
        """
        try:
            verification_start = time.time()
            logger.info(f"🔍 VerifierAgent: Starting verification")
            logger.info(f"- Query: {query}")
            logger.info(f"- Answer length: {len(answer)} characters")
            logger.info(f"- Context chunks: {len(context_chunks)}")

            # Validate inputs
            if not query or not answer:
                logger.warning(f"⚠️ VerifierAgent: Empty query or answer provided")
                return {
                    'confidence_score': 0.0,
                    'confidence_level': 'low',
                    'issues': ['Empty query or answer provided'],
                    'hallucination_risk': 'high'
                }

            if not context_chunks:
                logger.warning(f"⚠️ VerifierAgent: No context chunks provided")
                return {
                    'confidence_score': 0.0,
                    'confidence_level': 'low',
                    'issues': ['No context chunks provided'],
                    'hallucination_risk': 'high'
                }

            verification_results = {
                'confidence_score': 0.0,
                'issues': [],
                'fact_checks': [],
                'context_coverage': 0.0,
                'hallucination_risk': 'low'
            }

            # Check 1: Context coverage
            logger.info(f"🔍 Step 1: Checking context coverage")
            context_coverage = self._check_context_coverage(answer, context_chunks)
            verification_results['context_coverage'] = context_coverage
            logger.info(f"- Context coverage: {context_coverage:.2f}")

            # Check 2: Fact verification
            logger.info(f"🔍 Step 2: Verifying facts")
            fact_checks = self._verify_facts(answer, context_chunks)
            verification_results['fact_checks'] = fact_checks
            verified_count = sum(1 for check in fact_checks if check['verified'])
            logger.info(f"- Fact checks: {verified_count}/{len(fact_checks)} verified")

            # Check 3: Answer relevance
            logger.info(f"🔍 Step 3: Checking relevance")
            relevance_score = self._check_relevance(query, answer)
            verification_results['relevance_score'] = relevance_score
            logger.info(f"- Relevance score: {relevance_score:.2f}")

            # Check 4: Hallucination detection
            logger.info(f"🔍 Step 4: Detecting hallucinations")
            hallucination_risk = self._detect_hallucinations(answer, context_chunks)
            verification_results['hallucination_risk'] = hallucination_risk
            logger.info(f"- Hallucination risk: {hallucination_risk}")

            # Calculate overall confidence score
            confidence_score = self._calculate_confidence_score(
                context_coverage, fact_checks, relevance_score, hallucination_risk
            )
            verification_results['confidence_score'] = confidence_score
            logger.info(f"- Final confidence score: {confidence_score:.2f}")

            # Calculate hallucination percentage (inverse of confidence, adjusted for risk factors)
            hallucination_percentage = self._calculate_hallucination_percentage(
                confidence_score, hallucination_risk, context_coverage, fact_checks
            )
            verification_results['hallucination_percentage'] = hallucination_percentage
            logger.info(f"- Hallucination percentage: {hallucination_percentage:.1f}%")

            # Determine confidence level
            if confidence_score >= 0.8:
                verification_results['confidence_level'] = 'high'
            elif confidence_score >= 0.6:
                verification_results['confidence_level'] = 'medium'
            else:
                verification_results['confidence_level'] = 'low'

            logger.info(f"🏆 Confidence level: {verification_results['confidence_level']}")
            return verification_results

        except Exception as e:
            total_verification_time = (time.time() - verification_start) * 1000
            logger.error(f"❌ Error in VerifierAgent.verify_answer: {e}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            logger.error(f"❌ Verification failed after {total_verification_time:.0f}ms")
            return {
                'confidence_score': 0.0,
                'confidence_level': 'low',
                'issues': [f'Verification failed: {str(e)}'],
                'hallucination_risk': 'high',
                'timings_ms': {'total': total_verification_time}
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

            # Relax threshold to 40% to account for paraphrasing and stopword differences
            if coverage_ratio > 0.4:  # More than 40% word overlap
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

            fact_low = fact.lower()
            fact_words = set(fact_low.split())

            for chunk in context_chunks:
                chunk_text = chunk.get('text', '').lower()

                # First try exact substring match
                if fact_low in chunk_text:
                    found_in_context = True
                else:
                    # Fallback: token overlap (at least 50% of fact tokens present)
                    if fact_words:
                        chunk_words = set(chunk_text.split())
                        overlap = len(fact_words.intersection(chunk_words))
                        if overlap / len(fact_words) >= 0.5:
                            found_in_context = True

                if found_in_context:
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

    def _calculate_hallucination_percentage(
        self,
        confidence_score: float,
        hallucination_risk: str,
        context_coverage: float,
        fact_checks: List[Dict[str, Any]]
    ) -> float:
        """Calculate hallucination percentage (0-100%) based on verification metrics."""
        # Base percentage is inverse of confidence score
        base_percentage = (1.0 - confidence_score) * 100.0
        logger.info(f"- Base hallucination: {base_percentage:.1f}% (from confidence score)")

        # Adjust based on hallucination risk level
        risk_multiplier = {'low': 0.8, 'medium': 1.0, 'high': 1.2}
        risk_adjustment = risk_multiplier.get(hallucination_risk, 1.0)
        logger.info(f"- Risk adjustment: {risk_adjustment}x ({hallucination_risk} risk)")

        # Factor in fact verification accuracy
        fact_penalty = 0.0
        if fact_checks:
            verified_facts = sum(1 for check in fact_checks if check['verified'])
            fact_accuracy = verified_facts / len(fact_checks)
            # Reduce hallucination percentage if facts are verified
            fact_penalty = (1.0 - fact_accuracy) * 20.0
            logger.info(f"- Fact penalty: +{fact_penalty:.1f}% ({verified_facts}/{len(fact_checks)} verified)")

        # Factor in context coverage (lower coverage = higher hallucination)
        coverage_penalty = (1.0 - context_coverage) * 15.0
        logger.info(f"- Coverage penalty: +{coverage_penalty:.1f}% ({context_coverage:.2f} coverage)")

        # Calculate final percentage
        hallucination_percentage = base_percentage * risk_adjustment + fact_penalty + coverage_penalty

        # Ensure percentage is between 0 and 100
        final_percentage = max(0.0, min(100.0, hallucination_percentage))
        logger.info(f"- Raw percentage: {hallucination_percentage:.1f}%, Final capped: {final_percentage:.1f}%")
        return final_percentage

# Global instance
verifier_agent = VerifierAgent()
