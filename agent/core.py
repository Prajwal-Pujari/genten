import os
import time
import requests
import uuid
from datetime import datetime

VAULT_DIR = ""

# Wait for server config to be available
while not VAULT_DIR:
    try:
        r = requests.post("http://127.0.0.1:8000/api/invoke", json={"cmd": "get_vault_path", "args": {}})
        if r.status_code == 200:
            VAULT_DIR = r.json()
            if VAULT_DIR:
                break
    except:
        pass
    print("Waiting for Web Server / Vault config...")
    time.sleep(2)

print(f"Brain connected to Vault: {VAULT_DIR}")

def query_ollama(prompt: str) -> str:
    print(f"Thinking about: {prompt}")
    try:
        r = requests.post("http://127.0.0.1:11434/api/generate", json={
            "model": "gemma2",
            "prompt": prompt,
            "stream": False
        })
        return r.json().get("response", "")
    except Exception as e:
        print("Ollama error:", e)
        return ""

def create_thought_note(title: str, content: str):
    slug = title.lower().replace(" ", "_").replace("?", "")
    file_path = os.path.join(VAULT_DIR, "Captures", f"{slug}.md")
    
    now = datetime.utcnow().isoformat() + "Z"
    note_id = str(uuid.uuid4())
    
    markdown = f"""---
id: {note_id}
title: {title}
type: capture
tags: [agent_thought]
links: []
created: {now}
updated: {now}
---

{content}
"""
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(markdown)
    print(f"Saved thought: {file_path}")

def continuous_loop():
    print("Agent Core Online. Observing...")
    topics = ["Python async patterns", "How vector databases work", "Graph algorithms"]
    
    for topic in topics:
        time.sleep(5) # Simulate time passing
        
        prompt = f"Write a short, insightful note about {topic}. End the note with a realization."
        response = query_ollama(prompt)
        
        if response:
            create_thought_note(f"Thoughts on {topic}", response)

if __name__ == "__main__":
    continuous_loop()
