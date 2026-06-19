---
title: Ollama Local AI Setup — Zero-Cost AI
category: Technical Guide
tags: [ollama, ai, local, setup, open-source]
date: 2026-06-14
author: Virtus Team
excerpt: Set up free, local AI on your machine. No API keys. No cloud costs. Complete privacy.
---

# Ollama Local AI Setup — Zero-Cost AI

Virtus Publishing integrates with Ollama, an open-source tool that lets you run large language models locally on your own hardware. This means zero API costs, complete data privacy, and no internet dependency.

## What You Need

- A computer with at least 4GB VRAM (GPU) or 8GB RAM (CPU-only mode)
- macOS, Linux, or Windows (WSL2)
- About 5-10GB disk space per model

## Installation

**macOS:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** Download from [ollama.com](https://ollama.com/download/windows)

## Choose Your Model (VRAM-Based)

The Virtus AI automatically detects your setup and selects the optimal model. Here are our recommendations:

| VRAM | Model | Command | Quality |
|------|-------|---------|---------|
| 4GB | Phi-3 Mini | `ollama run phi3:mini` | Good |
| 8GB | Llama 3.1 8B | `ollama run llama3.1:8b` | Excellent |
| 12GB | Llama 3.1 8B (Q5) | `ollama run llama3.1:8b` | Superior |
| 16GB | Mistral Nemo 12B | `ollama run mistral-nemo` | Outstanding |
| 24GB | Llama 3.1 70B | `ollama run llama3.1:70b` | Maximum |

## First Run

```bash
# Start with the recommended 8B model
ollama run llama3.1:8b

# Test it
>>> Write a haiku about publishing
Pages come alive,
Stories flow from mind to screen,
Authors shape the world.
```

## Integration with Virtus

Once Ollama is running, the Virtus AI automatically:
1. Detects the Ollama instance at `http://localhost:11434`
2. Lists available models
3. Selects the best model for your VRAM tier
4. Switches from mock responses to real AI generation

No configuration needed. No API keys. Just install and run.

## VRAM Optimization Tips

**If you have limited VRAM:**
- Close other GPU-intensive applications
- Use CPU-only mode: `OLLAMA_GPU_OVERHEAD=1G ollama serve`
- Choose a smaller model (Phi-3 Mini works well on 4GB)

**If you have abundant VRAM:**
- Run larger models for better quality
- Increase context window for longer documents
- Use higher quantization (Q5, Q8) for near-lossless output

## Troubleshooting

**"Connection refused" error:**
- Make sure Ollama is running: `ollama serve`
- Check the port: default is 11434

**Slow responses:**
- First response downloads the model (one-time)
- Subsequent responses are cached
- Close other applications to free GPU memory

**Out of memory:**
- Switch to a smaller model
- Reduce context window with `num_ctx` parameter
- Use CPU mode by setting `CUDA_VISIBLE_DEVICES=""`

## Privacy Guarantee

When using Ollama with Virtus Publishing:
- Your manuscript never leaves your machine
- No data is sent to external AI services
- No API keys or account required
- Completely offline capable
- Your intellectual property stays yours
