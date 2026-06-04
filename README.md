# Genten

Genten is a modern, privacy-first, local-only markdown note-taking application powered by local LLMs (Large Language Models). It provides a seamless, lightning-fast knowledge base entirely stored on your own device, guaranteeing absolute privacy and zero telemetry.

## Overview

Designed for speed, focus, and minimalism, Genten acts as your personal brain. It integrates seamlessly with Ollama to provide an inline, interactive AI assistant named TARS, giving you the power of advanced language models right where you write, without sending your data to the cloud.

## Features

- **Local-First Architecture:** All your notes, attachments, and configurations are stored securely on your local file system as plain markdown and standard files.
- **TARS Inline Assistant:** An intelligent assistant integrated directly into the editor. Use `@tars` followed by your prompt, and TARS will stream its response inline, acting as a pair-thinker and writer.
- **Vision Model Integration:** Drag and drop images directly into the editor. Genten automatically analyzes images using local vision models (e.g., Llama 3.2 Vision) and embeds the context into your TARS conversations.
- **CodeMirror 6 Editor:** A highly customized, lightweight editor experience with wikilink support, smooth horizontal scroll prevention, and typewriter-style AI streaming.
- **Complete Privacy:** Zero cloud dependency. No analytics, no tracking, and no external API calls required (unless you configure custom sync services).
- **Fast and Responsive:** Built with Tauri, React, and TypeScript, resulting in a tiny memory footprint and native performance.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, CodeMirror 6, Tailwind CSS
- **Backend:** Rust, Tauri
- **AI Integration:** Ollama (Local REST API)
- **State Management:** Zustand
- **Database:** SQLite (managed securely in local AppData)

## Prerequisites

To run Genten locally, you need the following dependencies:

1.  **Node.js** (v18 or newer)
2.  **Rust** (latest stable version)
3.  **Tauri CLI**
4.  **Ollama** (Required for TARS AI functionality)

For the best experience, we recommend downloading and installing models like `llama3:8b` (for general writing) and `qwen2.5:14b` (for coding) within Ollama.

## Installation and Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Prajwal-Pujari/genten.git
    cd genten
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run in Development Mode**
    ```bash
    npm run tauri dev
    ```

4.  **Build for Production**
    ```bash
    npm run tauri build
    ```

## Usage and Configuration

Upon launching Genten for the first time, you will be guided through a Setup Wizard to configure your preferences:

1.  **Vault Storage:** Select a secure, dedicated directory on your local filesystem to store all your notes and attachments.
2.  **AI Configuration:** Enter your local Ollama endpoint (default: `http://localhost:11434`) and select your preferred text, code, and vision models.

Once configured, simply start typing. To invoke TARS, type `@tars` followed by your instruction and press `Enter`. TARS will process your request and stream the output directly into your document.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
