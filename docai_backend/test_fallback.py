#!/usr/bin/env python3
"""
Test script for model fallback functionality.
This script tests the fallback mechanism by simulating OOM conditions.
"""

import asyncio
import logging
from unittest.mock import patch, MagicMock
from app.agents.generator_agent import GeneratorAgent
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_normal_operation():
    """Test normal operation with primary model."""
    logger.info("=== Testing Normal Operation ===")

    agent = GeneratorAgent()
    agent.using_fallback = False  # Reset fallback state

    # Mock successful response
    mock_response = {"response": "This is a test response from the primary model."}

    with patch.object(agent.client, 'generate_async', return_value=mock_response):
        try:
            result = await agent._generate_sync_with_fallback("Test prompt", "test-123")
            logger.info(f"✓ Normal operation successful: {result}")
            logger.info(f"✓ Using primary model: {not agent.using_fallback}")
            return True
        except Exception as e:
            logger.error(f"✗ Normal operation failed: {e}")
            return False

async def test_oom_fallback():
    """Test fallback when primary model encounters OOM."""
    logger.info("=== Testing OOM Fallback ===")

    agent = GeneratorAgent()
    agent.using_fallback = False  # Reset fallback state

    # Mock OOM error for primary model
    oom_error = Exception("CUDA out of memory")

    # Mock successful fallback response
    fallback_response = {"response": "This is a test response from the fallback model."}

    call_count = 0
    async def mock_generate_async(prompt, **kwargs):
        nonlocal call_count
        call_count += 1

        if call_count == 1:
            # First call (primary model) fails with OOM
            raise oom_error
        else:
            # Second call (fallback model) succeeds
            return fallback_response

    with patch.object(agent.client, 'generate_async', side_effect=mock_generate_async):
        try:
            result = await agent._generate_sync_with_fallback("Test prompt", "test-456")
            logger.info(f"✓ Fallback operation successful: {result}")
            logger.info(f"✓ Using fallback model: {agent.using_fallback}")
            logger.info(f"✓ Total calls made: {call_count}")
            return True
        except Exception as e:
            logger.error(f"✗ Fallback operation failed: {e}")
            return False

async def test_fallback_failure():
    """Test behavior when both primary and fallback models fail."""
    logger.info("=== Testing Fallback Failure ===")

    agent = GeneratorAgent()
    agent.using_fallback = False  # Reset fallback state

    # Mock errors for both models
    error = Exception("Model not available")

    with patch.object(agent.client, 'generate_async', side_effect=error):
        try:
            result = await agent._generate_sync_with_fallback("Test prompt", "test-789")
            logger.error("✗ Expected failure but got success")
            return False
        except Exception as e:
            logger.info(f"✓ Both models failed as expected: {e}")
            logger.info(f"✓ Using fallback model: {agent.using_fallback}")
            return True

async def test_streaming_fallback():
    """Test fallback functionality with streaming."""
    logger.info("=== Testing Streaming Fallback ===")

    agent = GeneratorAgent()
    agent.using_fallback = False  # Reset fallback state

    # Mock OOM error for primary model
    oom_error = Exception("CUDA out of memory")

    # Mock successful streaming fallback response
    async def mock_stream_success(prompt, **kwargs):
        yield "This "
        yield "is "
        yield "a "
        yield "streaming "
        yield "response "
        yield "from "
        yield "fallback "
        yield "model."

    call_count = 0
    async def mock_stream_generate(prompt, **kwargs):
        nonlocal call_count
        call_count += 1

        if call_count == 1:
            # First call (primary model) fails with OOM
            raise oom_error
        else:
            # Second call (fallback model) succeeds
            async for token in mock_stream_success(prompt, **kwargs):
                yield token

    with patch.object(agent.client, 'generate_stream_async', side_effect=mock_stream_generate):
        try:
            result = []
            async for token in agent._stream_generate_with_fallback("Test prompt", "test-stream"):
                result.append(token)

            full_response = "".join(result)
            logger.info(f"✓ Streaming fallback successful: {full_response}")
            logger.info(f"✓ Using fallback model: {agent.using_fallback}")
            logger.info(f"✓ Total calls made: {call_count}")
            return True
        except Exception as e:
            logger.error(f"✗ Streaming fallback failed: {e}")
            return False

async def main():
    """Run all tests."""
    logger.info("Starting Model Fallback Tests")
    logger.info(f"Primary Model: {settings.OLLAMA_MODEL}")
    logger.info(f"Fallback Model: {settings.OLLAMA_MODEL_FALLBACK}")
    logger.info("-" * 50)

    tests = [
        test_normal_operation,
        test_oom_fallback,
        test_fallback_failure,
        test_streaming_fallback
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if await test():
                passed += 1
            logger.info("-" * 30)
        except Exception as e:
            logger.error(f"Test failed with exception: {e}")
            logger.info("-" * 30)

    logger.info(f"Test Results: {passed}/{total} passed")

    if passed == total:
        logger.info("🎉 All tests passed!")
        return True
    else:
        logger.error("❌ Some tests failed!")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
