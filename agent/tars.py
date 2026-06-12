import os
import json
import time
import uuid
import requests
from datetime import datetime

# Models
ORCHESTRATOR_MODEL = "gemma4:26b"
CODER_MODEL = "deepseek-coder-v2:16b"
OLLAMA_URL = "http://localhost:11434/api/generate"

CONFIG_FILE = os.path.expanduser("~/.genten/config.json")

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {}

config = load_config()
VAULT_DIR = os.path.expanduser(config.get("vaultPath", ""))
TARS_CHAT_FILE = os.path.join(VAULT_DIR, ".genten", "tars_chat.json")
TARS_GOAL_FILE = os.path.join(VAULT_DIR, ".genten", "tars_goal.json")

def query_ollama(model: str, prompt: str, system: str = "") -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 1024
        }
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
        return f"Error: {response.text}"
    except Exception as e:
        return f"Error: {str(e)}"

def handle_chat():
    if not os.path.exists(TARS_CHAT_FILE):
        return
        
    with open(TARS_CHAT_FILE, "r", encoding="utf-8") as f:
        try:
            chat = json.load(f)
        except json.JSONDecodeError:
            return
            
    if not chat or chat[-1].get("role") != "user":
        return
        
    print("[TARS] Received new user message. Thinking...")
    user_msg = chat[-1].get("content", "")
    
    # Simple context window
    context = "\n".join([f"{m['role']}: {m['content']}" for m in chat[-5:]])
    
    system_prompt = "You are TARS, a highly intelligent autonomous multi-agent orchestrator. You are conversing with the user to lock in a technical or educational goal. Ask clarifying questions until you fully understand the requirements. Keep responses concise and focused."
    prompt = f"Chat History:\n{context}\n\nRespond as TARS to the user's latest message:"
    
    reply = query_ollama(ORCHESTRATOR_MODEL, prompt, system_prompt)
    
    chat.append({"role": "tars", "content": reply})
    with open(TARS_CHAT_FILE, "w", encoding="utf-8") as f:
        json.dump(chat, f, indent=2)
    print(f"[TARS] Replied: {reply}")

def handle_goals():
    if not os.path.exists(TARS_GOAL_FILE):
        return
        
    with open(TARS_GOAL_FILE, "r", encoding="utf-8") as f:
        try:
            goal = json.load(f)
        except json.JSONDecodeError:
            return
            
    if goal.get("status") == "initializing":
        print(f"[TARS] Initializing new goal: {goal.get('project_name')}")
        # Build Syllabus
        prompt = f"The user has launched a goal/project named '{goal.get('project_name')}'. Break this down into 3 specific technical sub-tasks/notes that need to be generated to fulfill this goal. Return ONLY a JSON list of strings, representing the sub-tasks."
        syllabus_str = query_ollama(ORCHESTRATOR_MODEL, prompt)
        
        try:
            # Try to extract JSON list
            start = syllabus_str.find("[")
            end = syllabus_str.rfind("]") + 1
            if start >= 0 and end > start:
                tasks = json.loads(syllabus_str[start:end])
            else:
                tasks = ["Setup Environment", "Core Architecture", "Implementation Details"]
        except:
            tasks = ["Setup Environment", "Core Architecture", "Implementation Details"]
            
        goal["status"] = "executing"
        goal["tasks"] = [{"title": t, "completed": False} for t in tasks]
        
        with open(TARS_GOAL_FILE, "w", encoding="utf-8") as f:
            json.dump(goal, f, indent=2)
            
    elif goal.get("status") == "executing":
        tasks = goal.get("tasks", [])
        pending = [t for t in tasks if not t.get("completed")]
        
        if not pending:
            print("[TARS] Goal Complete!")
            goal["status"] = "completed"
            with open(TARS_GOAL_FILE, "w", encoding="utf-8") as f:
                json.dump(goal, f, indent=2)
            return
            
        current_task = pending[0]
        print(f"[TARS] Executing Task: {current_task['title']}")
        
        # Determine model
        if "code" in current_task['title'].lower() or "implementation" in current_task['title'].lower():
            model = CODER_MODEL
        else:
            model = ORCHESTRATOR_MODEL
            
        print(f"  -> Dispatched to {model}")
        
        content = query_ollama(model, f"Write a comprehensive markdown note about: {current_task['title']}. Include relevant code examples and detailed explanations.")
        
        # Save to project folder
        proj_dir = os.path.join(VAULT_DIR, "TARS_Projects", goal.get('project_name', 'Untitled'))
        os.makedirs(proj_dir, exist_ok=True)
        
        note_id = str(uuid.uuid4())
        now = datetime.now().isoformat() + "Z"
        
        markdown = f"---\nid: {note_id}\ntitle: {current_task['title']}\ntype: thought\nproject: {goal.get('project_name')}\ntags: [tars, {model.split(':')[0]}]\nlinks: []\ncreated: {now}\nupdated: {now}\n---\n\n{content}\n"
        
        filename = f"{current_task['title'].lower().replace(' ', '_')}.md"
        with open(os.path.join(proj_dir, filename), "w", encoding="utf-8") as f:
            f.write(markdown)
            
        print(f"  -> Saved note: {filename}")
        
        # Mark complete
        current_task["completed"] = True
        with open(TARS_GOAL_FILE, "w", encoding="utf-8") as f:
            json.dump(goal, f, indent=2)
            
        # Optional sleep to prevent overheating
        time.sleep(5)

if __name__ == "__main__":
    print("=======================================================")
    print("[TARS] Multi-Agent Orchestrator Online")
    print(f"[TARS] Listening to Vault: {VAULT_DIR}")
    print("=======================================================")
    
    os.makedirs(os.path.join(VAULT_DIR, ".genten"), exist_ok=True)
    
    try:
        while True:
            handle_chat()
            handle_goals()
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nShutting down TARS.")
