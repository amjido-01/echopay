# Voice Feature Research & Planning

This document summarizes the evaluation of speech technologies for the EchoPay voice experience.

## Speech-to-Text Options

### Web Speech API
- Built into most modern browsers, requires no server calls.
- Inconsistent browser support and limited language availability.

### Google Cloud Speech-to-Text
- High accuracy with streaming support and many languages.
- Adds network latency and ongoing cost.

### OpenAI Whisper API
- Good accuracy across languages and simple to call from the server.
- Network dependent and incurs usage cost.

**Decision:** Use **OpenAI Whisper** as the primary STT engine. The existing API key and credit make it easy to integrate. While the Web Speech API can be leveraged as a lightweight fallback when available, Whisper offers more reliable accuracy across devices and languages.

## Text-to-Speech Options

### OpenAI Text-to-Speech
- Natural-sounding voices and already used in the project.
- Paid service requiring network access.

### Google Cloud Text-to-Speech
- Large library of voices and languages, highly configurable.
- Additional setup complexity and cost.

### Browser SpeechSynthesis
- No cost and can work offline.
- Voice quality varies significantly by browser.

**Decision:** Standardize on **OpenAI TTS**. The quality is consistently high and we already maintain credentials. Browser SpeechSynthesis can serve as a backup when network access is unavailable.

## Browser & Device Requirements
- Users must grant microphone permission to capture audio.
- Browsers need support for MediaRecorder and Web Audio APIs (Chrome, Firefox, Safari, Edge).
- A stable network connection is required for server-based STT/TTS.
- Headphones or good speakers recommended for clear playback.
