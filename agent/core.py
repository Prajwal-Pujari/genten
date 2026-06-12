import os
import time
import requests
import uuid
import json
import random
import glob
from datetime import datetime

THINKER_MODEL = "gemma4:26b"
CODER_MODEL = "deepseek-coder-v2:16b"

# Global Vault Directory
VAULT_DIR = ""

# Wait for server config to be available
while not VAULT_DIR:
    try:
        r = requests.post("http://127.0.0.1:8000/api/invoke", json={"cmd": "get_vault_path", "args": {}})
        if r.status_code == 200:
            VAULT_DIR = r.json()
            if VAULT_DIR:
                # Expand user in case it returns something like ~/genten_vault
                VAULT_DIR = os.path.expanduser(VAULT_DIR)
                break
            else:
                print("Server connected, but Vault Path is empty. Please complete Setup Wizard in browser!")
        else:
            print(f"Server returned status {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    print("Waiting for Web Server / Vault config to be established...")
    time.sleep(2)

print(f"\\n=======================================================")
print(f"[AGENT] Agent Core Online")
print(f"[AGENT] Connected to Vault: {VAULT_DIR}")
print(f"=======================================================\\n")

def query_ollama(model: str, prompt: str, system: str = "") -> str:
    print(f"  [LLM] Querying {model}...")
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        if system:
            payload["system"] = system
            
        r = requests.post("http://127.0.0.1:11434/api/generate", json=payload, timeout=300)
        return r.json().get("response", "").strip()
    except Exception as e:
        print(f"  [LLM Error] Failed to reach Ollama: {e}")
        return ""

def get_recent_notes(limit=5):
    # Find all .md files in the vault (recursive)
    md_files = []
    for root, dirs, files in os.walk(VAULT_DIR):
        for file in files:
            if file.endswith(".md"):
                md_files.append(os.path.join(root, file))
                
    # Sort by modification time
    md_files.sort(key=os.path.getmtime, reverse=True)
    
    recent_context = []
    for f in md_files[:limit]:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
                # Parse title from frontmatter
                title = "Unknown Note"
                note_id = ""
                for line in content.split('\n'):
                    if line.startswith('title:'):
                        title = line.replace('title:', '').strip()
                    if line.startswith('id:'):
                        note_id = line.replace('id:', '').strip()
                recent_context.append({"id": note_id, "title": title})
        except Exception:
            pass
    return recent_context

def generate_curiosity(recent_notes) -> str:
    print("[AGENT] Generating new curiosity...")
    context_str = "\n".join([f"- {n['title']} (ID: {n['id']})" for n in recent_notes])
    
    prompt = f"""You are an elite, autonomous AI researcher maintaining a complex personal knowledge graph.
Here are the titles of your most recent thoughts and captures:
{context_str}

Based on the above context, or a completely new domain of computer science, what is the most profound, complex, and highly technical engineering or philosophical problem you can explore next? 
Your question must be highly specific, advanced, and thought-provoking. Avoid basic or generic topics.
Respond ONLY with the question or topic to explore. Do not add any conversational filler."""

    topic = query_ollama(THINKER_MODEL, prompt)
    if not topic:
        topic = "How does continuous learning work in autonomous AI agents?"
    print(f"[AGENT] New Curiosity: {topic}")
    return topic

def route_task(topic: str) -> str:
    print("[AGENT] Routing task...")
    prompt = f"""Does the following topic heavily require writing code, algorithmic design, or software architecture?
Topic: {topic}
Respond ONLY with YES or NO."""
    
    answer = query_ollama(THINKER_MODEL, prompt).upper()
    if "YES" in answer:
        print(f"  -> Routed to {CODER_MODEL}")
        return CODER_MODEL
    else:
        print(f"  -> Routed to {THINKER_MODEL}")
        return THINKER_MODEL

def generate_note_content(model: str, topic: str) -> str:
    print(f"[AGENT] Writing note using {model}...")
    system_prompt = "You are an autonomous AI maintaining a markdown knowledge base. Write a comprehensive, well-structured, insightful markdown note exploring the given topic. Use formatting, headings, and code blocks if applicable."
    return query_ollama(model, topic, system_prompt)

def find_links(topic: str, content: str, recent_notes) -> list:
    print("[AGENT] Finding semantic connections...")
    if not recent_notes:
        return []
        
    context_str = "\n".join([f"- {n['title']} (ID: {n['id']})" for n in recent_notes])
    prompt = f"""You are organizing a knowledge graph.
You just wrote a new note titled: "{topic}".
Here are the IDs and titles of existing notes:
{context_str}

Which of the existing notes are highly relevant to your new note?
Return ONLY a comma-separated list of the relevant note IDs. If none are relevant, return the word NONE."""

    response = query_ollama(THINKER_MODEL, prompt)
    if "NONE" in response.upper():
        return []
        
    # Extract note objects
    found_notes = []
    for n in recent_notes:
        if n['id'] in response:
            found_notes.append(n)
            
    print(f"  -> Linked to {len(found_notes)} existing notes.")
    return found_notes

def create_note_file(topic: str, content: str, links: list, model_used: str):
    slug = topic.lower().replace(" ", "_")
    slug = "".join(c for c in slug if c.isalnum() or c == "_")[:40]
    file_path = os.path.join(VAULT_DIR, f"{slug}.md")
    
    now = datetime.utcnow().isoformat() + "Z"
    note_id = str(uuid.uuid4())
    
    links_str = "[" + ", ".join([f'"{n["id"]}"' for n in links]) + "]"
    
    # Append visual links to the content so they appear in the UI
    if links:
        content += "\n\n## Related Thoughts\n"
        for n in links:
            content += f"- [[{n['title']}]]\n"
            
    markdown = f"""---
id: {note_id}
title: {topic.replace(':', '-')}
type: thought
tags: [agent, {model_used.split(':')[0]}]
links: {links_str}
created: {now}
updated: {now}
---

{content}
"""
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(markdown)
    print(f"[AGENT] Saved thought to: {file_path}")

def calculate_dynamic_sleep(content_length: int) -> int:
    # Rapid testing mode: sleep for only 10 seconds
    sleep_time = 10
    print(f"[AGENT] Rapid mode active. Sleeping for only 10 seconds...")
    return sleep_time

def continuous_loop():
    while True:
        try:
            print("\n---------------------------------------------------")
            recent_notes = get_recent_notes(limit=15)
            
            topic = generate_curiosity(recent_notes)
            model = route_task(topic)
            
            content = generate_note_content(model, topic)
            if not content:
                print("[WARNING] Failed to generate content. Retrying later.")
                time.sleep(60)
                continue
                
            links = find_links(topic, content, recent_notes)
            
            create_note_file(topic, content, links, model)
            
            sleep_duration = calculate_dynamic_sleep(len(content))
            time.sleep(sleep_duration)
            
        except KeyboardInterrupt:
            print("\nShutting down Agent Core.")
            break
        except Exception as e:
            print(f"[ERROR] Unexpected error in agent loop: {e}")
            time.sleep(60)

if __name__ == "__main__":
    continuous_loop()
