---
title: Writing with AI — Advanced Techniques
category: Author Resources
tags: [ai, writing, editing, outline]
date: 2026-06-14
author: Virtus Team
excerpt: Master the Virtus AI assistant to create compelling eBooks faster and better.
---

# Writing with AI — Advanced Techniques

The Virtus AI assistant is your collaborative writing partner. This guide covers advanced techniques to maximize your output quality and speed.

## Prompt Engineering for Authors

The quality of AI output depends on the quality of your input. Here are proven prompt patterns:

**For Outlines:**
- "Create a 6-chapter outline for a business book about remote team management"
- "Structure a self-help book on productivity for college students"

**For Chapter Content:**
- "Write Chapter 3 about conflict resolution in fantasy fiction, 1000 words"
- "Draft an introduction that hooks readers interested in plant-based nutrition"

**For Editing:**
- "Enhance this paragraph for professional tone: [paste text]"
- "Make this section more engaging for young adult readers"

## The Iterative Workflow

1. **Outline First** — Generate a chapter structure before writing any prose
2. **Draft in Sections** — Write 500-800 word chunks rather than full chapters
3. **Edit Immediately** — Enhance each section right after drafting
4. **Review as Whole** — Read the complete chapter for flow and consistency

## Working with Local AI (Ollama)

For the best experience, install Ollama on your machine:

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Run a model (choose based on your VRAM)
ollama run llama3.1:8b    # 8GB VRAM
ollama run phi3:mini       # 4GB VRAM
ollama run mistral:7b      # 8GB VRAM, excellent reasoning
```

The Virtus AI automatically detects your Ollama setup and switches from mock responses to real AI generation. Your data never leaves your machine.

## Temperature and Tone Control

When using local models, you can adjust the creative temperature:
- **0.3-0.5** — Factual, technical writing (academic, business)
- **0.6-0.8** — Balanced creative (fiction, general non-fiction)
- **0.9-1.2** — Highly creative (poetry, experimental prose)

## Common Pitfalls

- Do not rely on AI for fact-checking — always verify dates, statistics, and claims
- AI can hallucinate citations — create your own reference list
- First drafts from AI need human editing — never publish raw AI output
- Use AI as a collaborator, not a replacement — your voice matters most
