"""
TTS Service wrapper for Coqui TTS
Handles model loading, voice cloning, and embedding extraction
"""

import os
import torch
from TTS.api import TTS
from typing import Optional, Tuple
import numpy as np
import soundfile as sf


class TTSService:
    """Wrapper for Coqui TTS models"""

    def __init__(self, device: Optional[str] = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.models = {}
        self.default_model = "tts_models/multilingual/multi-dataset/xtts_v2"

    def get_model(self, model_name: Optional[str] = None) -> TTS:
        """Get or load TTS model"""
        model_name = model_name or self.default_model

        if model_name not in self.models:
            print(f"Loading TTS model: {model_name} on {self.device}")
            self.models[model_name] = TTS(model_name).to(self.device)
            print(f"Model loaded successfully")

        return self.models[model_name]

    def clone_voice(
        self,
        text: str,
        speaker_wav_path: str,
        language: str = "en",
        model_name: Optional[str] = None,
        emotion: Optional[str] = None,
        style: Optional[str] = None,
    ) -> Tuple[np.ndarray, int]:
        """
        Clone voice from reference audio and generate speech

        Args:
            text: Text to synthesize
            speaker_wav_path: Path to reference audio file
            language: Language code (e.g., "en", "es", "fa")
            model_name: TTS model to use (default: XTTS v2)
            emotion: Emotion style (if supported by model)
            style: Style parameter (if supported by model)

        Returns:
            Tuple of (audio_array, sample_rate)
        """
        tts = self.get_model(model_name)

        # Generate speech
        wav = tts.tts(
            text=text,
            speaker_wav=speaker_wav_path,
            language=language,
        )

        # Get sample rate from model
        sample_rate = tts.synthesizer.output_sample_rate

        return wav, sample_rate

    def extract_voice_embedding(
        self, speaker_wav_path: str, model_name: Optional[str] = None
    ) -> Optional[np.ndarray]:
        """
        Extract voice embedding from reference audio for reuse

        Args:
            speaker_wav_path: Path to reference audio file
            model_name: TTS model to use

        Returns:
            Voice embedding vector or None if not supported
        """
        try:
            tts = self.get_model(model_name)

            # XTTS models support speaker embedding extraction
            if hasattr(tts, "synthesizer") and hasattr(
                tts.synthesizer, "speaker_manager"
            ):
                # This is model-specific - adjust based on actual TTS API
                # For XTTS, we can use the speaker encoder
                if hasattr(tts, "speaker_encoder"):
                    embedding = tts.speaker_encoder.compute_embedding(speaker_wav_path)
                    return embedding

            return None
        except Exception as e:
            print(f"Could not extract voice embedding: {e}")
            return None

    def list_available_models(self) -> list:
        """List available TTS models"""
        try:
            tts = TTS()
            return tts.list_models()
        except Exception as e:
            print(f"Error listing models: {e}")
            return []

    def save_audio(self, wav: np.ndarray, sample_rate: int, output_path: str):
        """Save audio array to file"""
        sf.write(output_path, wav, sample_rate)

