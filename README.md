# Lexi – The Neurodiverse Learning Coach

**A fully accessible, multimodal learning platform for students with Dyslexia, ADHD, and other learning differences.**

**Demo Video:** https://youtu.be/WBUIakMCIl0  
**Public AI Studio App:** https://ai.studio/apps/drive/1vEyn_bwhbdFoCUuyqOFPy5h6jzRdK8Pw?fullscreenApplet=true  
**Official Website:** https://lexi-learning.vercel.app/

## Overview

**Lexi** is an AI-powered education platform designed to remove barriers for neurodiverse learners.  
Traditional education systems often rely on dense text, rigid layouts, and one-size-fits-all instruction—approaches that systematically disadvantage students with Dyslexia, ADHD, and Dyscalculia.

Lexi uses **Gemini 3 Pro** to adapt learning materials to the learner’s cognitive needs, not the other way around.

Instead of summarizing content, Lexi **restructures information** into visual, step-based, and voice-enabled formats that align with how neurodiverse students process information.


## Core Features

### Homework Transformer
- Uses **Gemini Vision** to scan uploaded worksheets or photos
- Removes visual clutter and decorative noise
- Regenerates content into:
  - Simplified language
  - Clear step-by-step scaffolding
  - Key concepts only

Designed for students who struggle with reading load and visual overload.


### Visual Math Playground
- Students draw math problems freely on a canvas
- Canvas state is captured as a base64 image and sent to Gemini
- Gemini’s **multimodal spatial reasoning**:
  - Interprets shapes, symbols, and equations
  - Returns structured JSON actions (e.g. `drawRect`, `writeText`)
  - Visually annotates the canvas in real time

This removes the need to decode abstract symbols through text alone.


### Visual Learning Lab
- Transforms dense paragraphs into:
  - Interactive **Mind Maps**
  - Step Flows and hierarchical concept trees
- Abstract concepts are converted into nodes and relationships
- Learners can *see* how ideas connect instead of decoding long text blocks


## Accessibility-First Design

Accessibility is not a feature toggle—it is the foundation.

We implemented a centralized **AccessibilityContext** that controls the entire DOM, allowing users to instantly switch between modes:

- **OpenDyslexic Font** – global typography replacement
- **High Contrast Mode** – strict yellow-on-black Tailwind themes
- **Focus Mode** – reduced container width and increased line spacing to lower cognitive load

All UI decisions were guided by neurodiverse-friendly design principles.


## Technical Architecture

### Frontend
- **React**
- **Tailwind CSS**
- Interactive diagram rendering (React Flow–style)
- Canvas-based drawing input

### AI & Reasoning (Gemini 3 Pro)
Different Gemini capabilities were used intentionally per module:

| Module | Gemini Capability |
|------|------------------|
| Homework Transformer | Vision + Structured Output |
| Math Playground | Multimodal Spatial Reasoning |
| Visual Learning Lab | Long-context Reasoning & Hierarchical Structuring |

We enforced **strict JSON schemas** via system instructions to ensure reliable downstream rendering.


## Voice & Interaction

To support users with dysgraphia or typing difficulties, Lexi integrates:

- **Web Speech API** for speech-to-text
- Gemini-generated responses read back via text-to-speech

This creates a fluid **Voice → AI → Voice** learning loop, minimizing reliance on reading and typing.

## Why It Matters

> **1 in 5 students has a learning or attention difference.**

The barrier is not intelligence—it’s the interface of education.

Lexi acts as a real-time translator between curriculum content and the neurodiverse brain:

- **Dyslexia:** Text → Mind Maps
- **ADHD:** Overwhelming tasks → 5-minute micro-steps
- **Dyscalculia:** Abstract numbers → visual representations

By leveraging Gemini 3 Pro’s reasoning and multimodality, Lexi demonstrates how AI can create **immediate, tangible equity in education**.



## Acknowledgements

Built entirely using **Google AI Studio** and **Gemini 3 Pro**, demonstrating the power of multimodal reasoning for accessibility-first applications.
