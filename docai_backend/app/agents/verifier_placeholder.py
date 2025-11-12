from typing import Dict, Any, List
from loguru import logger
from app.utils.agent_timer import log_time

class VerifierAgent:
    def __init__(self):
        pass

    @log_time
    def placeholder_verify(self, answer: str, sources: List[Dict[str, Any]], context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Placeholder verification: Perform deterministic substring checks.
        """
        logger.info("VerifierAgent: Running placeholder verification")

        # Simple substring matching
        verification_flag = "verified"
        per_source_results = []

        for i, source in enumerate(sources):
            source_text = source.get("text", "").lower()
            answer_lower = answer.lower()

            # Check if key phrases from answer appear in source
            matches = []
            words = answer_lower.split()
            for word in words:
                if len(word) > 3 and word in source_text:
                    matches.append(word)

            confidence = len(matches) / len(words) if words else 0.0

            per_source_results.append({
                "source_id": source.get("id", f"source_{i}"),
                "confidence": confidence,
                "matches": matches
            })

        # If no matches found, mark as unverified
        if not any(r["matches"] for r in per_source_results):
            verification_flag = "unverified"

        logger.info(f"VerifierAgent: Verification result: {verification_flag}")

        return {
            "verification_flag": verification_flag,
            "per_source_verifier_results": per_source_results
        }
