<div id="open-design-ide-logo" align="center">
    <br />
    <h1>Open Design IDE 🖌️💻</h1>
    <h3>The world’s first fully open, community-trained, limitless design-to-code IDE</h3>
</div>

<div id="badges" align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)

</div>

We are building the entire product from absolute zero — no off-the-shelf tools, no paid APIs, no existing platforms. Everything is built in-house from scratch.

## Project Overview

**Open Design IDE** combines the design capabilities of Penpot (the open-source Figma alternative) with the coding power of VS Code into a single, seamless dual-pane browser IDE (visual canvas on the left ↔ live code on the right). 

I have successfully rebranded VS Code and integrated the initial foundations. Our ongoing work involves rendering Penpot directly within the IDE via iframe and building out a powerful, self-hosted AI engine that converts designs into perfect React 19 + Tailwind code.

### 🌟 CORE PRODUCT TRUTH (Never forget this)

- **Dual-pane browser IDE** (visual canvas left ↔ live code right) – built from scratch.
- **14-day unlimited trial** – zero tokens, zero credits, zero paywalls during trial.
- **Signature superpower:** Drag any image / GIF / video → instantly get perfect React 19 + Tailwind code.
- **Community uploads** [design + code] → directly trains our own model every week.
- **We own the full stack:** editor, backend, AI model, training pipeline, datasets, inference servers.

---

## 🔬 AI RESEARCH MANDATE (2025 – Build from Scratch)

> **IMPORTANT CONSTRAINT:** We are NOT allowed to rely on V0, Dora, Anima, Windsurf, Builder.io, Lovable, or any third-party design-to-code service. We must research and build everything ourselves.

### 1. Model Architecture (From Scratch Research)
- Find or create the best possible open-source multimodal + code model combination in 2025.
- **Primary candidates:** Qwen2-VL-72B, InternVL2-76B, NVLM-D-72B, LLaVA-OneVision, Phi-4-Vision.
- **Pair with:** DeepSeek-Coder-V2-236B, Qwen2-72B-Coder, or train our own 34B–70B coder.
- **Goal:** Beat every existing commercial tool in accuracy and animation understanding.

### 2. Dataset Creation (From Scratch)
- Build the largest open design-to-code dataset ever: **target 500,000+ high-quality pairs**.
- **Sources we will create ourselves:**
  - 200k synthetic UIs using Flux.1 Pro + SD3 + custom prompts.
  - 50k real Dribbble/Behance shots (legally scraped + human-coded).
  - 100k community submissions (post-launch).
  - 10k animation videos (scroll, hover, parallax) recorded and coded by us.
- *Note: We will NOT use any paid or private dataset.*

### 3. Training Pipeline (From Scratch)
- Full fine-tuning + weekly LoRA merging system.
- QLoRA + Axolotl + Unsloth for efficiency.
- **Continuous learning loop:** user upload → moderation → auto-train → deploy new weights.
- Strict requirement: No catastrophic forgetting.

### 4. Inference System (From Scratch)
- Self-hosted vLLM + TensorRT-LLM cluster.
- 8×H100 minimum for launch.
- **Latency target:** <6 seconds per generation.

### 5. Evaluation (From Scratch)
- Create **OpenDesign-Bench-5000** – our own public benchmark.
- **Metrics:** DesignBLEU, PixelMatch, AnimationF1, Human Elo.
- **Goal:** Maintain a monthly leaderboard showing we beat every competitor.

---

## Contributing and Current Status
Currently combining two open-source giants: **VS Code** + **Penpot**.
- VS Code has been fully rebranded.
- We are actively developing the Penpot integration (rendering Penpot in VS Code via iframe) and establishing the connection between the visual canvas and the live code editor.
