
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from llm_config import get_llm_client
import logging

# Disable logging for cleaner output
logging.disable(logging.CRITICAL)

def test_cerebras():
    print("=== Testing Cerebras AI API Connection ===")
    try:
        client = get_llm_client("cerebras")
        print(f"Client initialized with provider: {client.provider}")
        print(f"Model: {client.model}")
        
        print("\nSending test prompt: 'Say hello in 2 words'...")
        response = client.generate_completion(
            system_prompt="You are a helpful assistant.",
            user_prompt="Say hello in 2 words"
        )
        
        print(f"\nAPI Response: {response}")
        print("\n✅ Cerebras API is running and responding correctly.")
        
    except Exception as e:
        print(f"\n❌ Cerebras API test failed: {e}")
        if "401" in str(e) or "403" in str(e):
            print("Troubleshooting: Likely an invalid or unauthorized API key.")
        elif "429" in str(e):
            print("Troubleshooting: Quota exceeded or rate limited.")
        else:
            print("Troubleshooting: Check internet connection or API endpoint.")

if __name__ == "__main__":
    test_cerebras()
