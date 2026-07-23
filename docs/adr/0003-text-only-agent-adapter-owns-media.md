# Text-only Agent; Telegram Adapter owns media

The Agent must only ever see text Messages. Voice Transcription and Receipt Extraction run in the Telegram Adapter so media is normalized (or hard-failed) before the Agent is invoked. Alternatives were a multimodal Agent or a separate intake component; we kept the Adapter as the single Telegram boundary and avoided raw image/audio in the Agent process.
