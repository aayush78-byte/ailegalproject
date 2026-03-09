"""
LLM Configuration Module
Centralized configuration for multiple LLM providers (DeepSeek, OpenAI, Gemini)
"""
import os
import requests
import json
import time
import logging
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class LLMConfig:
    """Configuration for LLM providers"""
    
    # Provider settings
    PROVIDER = os.getenv("LLM_PROVIDER", "deepseek").lower()
    
    # API Keys
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
    
    # API Endpoints
    DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"
    # gemini-2.0-flash: fastest, cheapest, lowest latency Gemini model
    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"
    
    # Model mappings
    MODELS = {
        "deepseek": "deepseek-chat",
        "openai": "gpt-4o-mini",
        "gemini": "gemini-2.0-flash",
        "cerebras": "llama3.1-8b"
    }
    
    # Request settings
    TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
    MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "500"))
    TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))
    
    # Retry settings — keep at 1 to minimise API usage; fallback handles errors
    MAX_RETRIES = 1
    RETRY_DELAY = 1  # seconds
    
    @classmethod
    def get_api_key(cls, provider: Optional[str] = None) -> Optional[str]:
        """Get API key for specified provider"""
        provider = provider or cls.PROVIDER
        
        key_map = {
            "deepseek": cls.DEEPSEEK_API_KEY,
            "openai": cls.OPENAI_API_KEY,
            "gemini": cls.GEMINI_API_KEY,
            "cerebras": cls.CEREBRAS_API_KEY
        }
        
        return key_map.get(provider)
    
    @classmethod
    def get_model(cls, provider: Optional[str] = None) -> str:
        """Get model name for specified provider"""
        provider = provider or cls.PROVIDER
        return cls.MODELS.get(provider, cls.MODELS["deepseek"])
    
    @classmethod
    def is_configured(cls, provider: Optional[str] = None) -> bool:
        """Check if provider is properly configured"""
        provider = provider or cls.PROVIDER
        api_key = cls.get_api_key(provider)
        return api_key is not None and api_key.strip() != ""
    
    @classmethod
    def get_available_providers(cls) -> List[str]:
        """Get list of configured providers"""
        providers = []
        for provider in cls.MODELS.keys():
            if cls.is_configured(provider):
                providers.append(provider)
        return providers


class LLMClient:
    """Universal LLM client supporting multiple providers"""
    
    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or LLMConfig.PROVIDER
        self.api_key = LLMConfig.get_api_key(self.provider)
        self.model = LLMConfig.get_model(self.provider)
        
        if not self.api_key:
            raise ValueError(f"API key not configured for provider: {self.provider}")
    
    def generate_completion(self, 
                          system_prompt: str,
                          user_prompt: str,
                          temperature: Optional[float] = None,
                          max_tokens: Optional[int] = None,
                          json_mode: bool = False) -> str:
        """
        Generate completion from LLM
        
        Args:
            system_prompt: System instruction
            user_prompt: User message
            temperature: Sampling temperature
            max_tokens: Max output tokens
            json_mode: Whether to request JSON output
        
        Returns:
            Generated text
        """
        temperature = temperature or LLMConfig.TEMPERATURE
        max_tokens = max_tokens or LLMConfig.MAX_TOKENS
        
        for attempt in range(LLMConfig.MAX_RETRIES):
            try:
                if self.provider == "deepseek":
                    return self._call_deepseek(system_prompt, user_prompt, temperature, max_tokens, json_mode)
                elif self.provider == "openai":
                    return self._call_openai(system_prompt, user_prompt, temperature, max_tokens, json_mode)
                elif self.provider == "gemini":
                    return self._call_gemini(system_prompt, user_prompt, temperature, max_tokens)
                elif self.provider == "cerebras":
                    return self._call_cerebras(system_prompt, user_prompt, temperature, max_tokens, json_mode)
                else:
                    raise ValueError(f"Unsupported provider: {self.provider}")
            
            except Exception as e:
                logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
                if attempt < LLMConfig.MAX_RETRIES - 1:
                    time.sleep(LLMConfig.RETRY_DELAY * (attempt + 1))
                else:
                    raise
    
    def _call_deepseek(self, system_prompt: str, user_prompt: str, 
                      temperature: float, max_tokens: int, json_mode: bool) -> str:
        """Call DeepSeek API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        response = requests.post(
            LLMConfig.DEEPSEEK_URL,
            headers=headers,
            json=payload,
            timeout=LLMConfig.TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    def _call_openai(self, system_prompt: str, user_prompt: str,
                    temperature: float, max_tokens: int, json_mode: bool) -> str:
        """Call OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        response = requests.post(
            LLMConfig.OPENAI_URL,
            headers=headers,
            json=payload,
            timeout=LLMConfig.TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    def _call_gemini(self, system_prompt: str, user_prompt: str,
                    temperature: float, max_tokens: int) -> str:
        """Call Google Gemini API (gemini-2.0-flash)"""
        url = f"{LLMConfig.GEMINI_URL}?key={self.api_key}"
        
        # Gemini v1beta: system instruction is a separate field, keeps token usage low
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [{
                "role": "user",
                "parts": [{"text": user_prompt}]
            }],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json"
            }
        }
        
        response = requests.post(
            url,
            json=payload,
            timeout=LLMConfig.TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]

    def _call_cerebras(self, system_prompt: str, user_prompt: str,
                       temperature: float, max_tokens: int, json_mode: bool) -> str:
        """Call Cerebras API (OpenAI Compatible)"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # Cerebras supports json mode similar to OpenAI
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        response = requests.post(
            LLMConfig.CEREBRAS_URL,
            headers=headers,
            json=payload,
            timeout=LLMConfig.TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]


def get_llm_client(provider: Optional[str] = None) -> LLMClient:
    """Factory function to get LLM client"""
    return LLMClient(provider)
