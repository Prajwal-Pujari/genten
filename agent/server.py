import os
import json
import hashlib
from typing import Any, Dict, List, Optional
import uuid
import httpx
from datetime import datetime
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, Response
from pydantic import BaseModel

app = FastAPI(title="Genten Agent Brain")

# ---------------------------------------------------------
# REAL-TIME SYNC (SSE & WATCHDOG)
# ---------------------------------------------------------
sse_clients = set()
vault_observer = None

def broadcast_sse(event_data: str):
    for q in list(sse_clients):
        try:
            q.put_nowait(event_data)
        except Exception:
            pass

class VaultEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            broadcast_sse(json.dumps({"type": "FILE_CHANGED", "path": event.src_path}))
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            broadcast_sse(json.dumps({"type": "FILE_CHANGED", "path": event.src_path}))
    def on_deleted(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            broadcast_sse(json.dumps({"type": "FILE_DELETED", "path": event.src_path}))

def ensure_observer_running():
    global vault_observer
    vault_path = os.path.expanduser(load_config().get("vault_path", ""))
    if not vault_path or not os.path.exists(vault_path):
        return
        
    if vault_observer is None:
        event_handler = VaultEventHandler()
        vault_observer = Observer()
        vault_observer.schedule(event_handler, vault_path, recursive=True)
        vault_observer.start()
        print(f"Started file observer on {vault_path}")

@app.get("/api/events")
async def sse_events(request: Request):
    ensure_observer_running()
    q = asyncio.Queue()
    sse_clients.add(q)
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {data}\n\n"
        finally:
            sse_clients.discard(q)
    return StreamingResponse(event_generator(), media_type="text/event-stream")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvokeRequest(BaseModel):
    cmd: str
    args: Dict[str, Any] = {}

def get_config_path() -> str:
    if os.name == 'nt':
        base = os.environ.get("APPDATA", ".")
    else:
        base = os.path.join(os.environ.get("HOME", "."), ".config")
    return os.path.join(base, "genten", "config.json")

def load_config() -> dict:
    path = get_config_path()
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "vault_path": "",
        "file_format": "md",
        "db_path": "",
        "appearance": {
            "editor_font": "lora",
            "code_font": "geist-mono",
            "editor_width": "comfortable"
        }
    }

def scan_directory(path: str, base: str) -> List[dict]:
    entries = []
    try:
        for entry in os.scandir(path):
            name = entry.name
            if name.startswith('.') and name != '.genten':
                continue
            if name in ['genten.db', 'genten.db-journal', 'genten.db-wal']:
                continue
            
            is_dir = entry.is_dir()
            children = scan_directory(entry.path, base) if is_dir else None
            
            entries.append({
                "name": name,
                "path": entry.path.replace('\\', '/'),
                "is_dir": is_dir,
                "children": children
            })
    except PermissionError:
        pass
    
    # Sort: Directories first, then alphabetical
    entries.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
    return entries

@app.post("/api/invoke")
async def handle_invoke(req: InvokeRequest):
    cmd = req.cmd
    args = req.args
    
    if cmd == "get_vault_path":
        return load_config().get("vault_path", "")
        
    elif cmd == "get_config":
        return load_config()
        
    elif cmd == "save_config":
        config = args.get("config", {})
        path = get_config_path()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4)
        return True
        
    elif cmd == "scan_vault":
        vault_path = os.path.expanduser(args.get("vaultPath", ""))
        if not vault_path or not os.path.exists(vault_path):
            return []
        return scan_directory(vault_path, vault_path)
        
    elif cmd == "read_note_file":
        path = os.path.expanduser(args.get("path", ""))
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
            
    elif cmd == "write_note_file":
        path = os.path.expanduser(args.get("path", ""))
        content = args.get("content", "")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return None
        
    elif cmd == "delete_note_file":
        path = os.path.expanduser(args.get("path", ""))
        if os.path.exists(path):
            os.remove(path)
        return None
        
    elif cmd == "compute_content_hash":
        content = args.get("content", "")
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
        
    elif cmd == "ping_server":
        return True
        
    else:
        raise HTTPException(status_code=400, detail=f"Unknown command: {cmd}")

# Fallback asset server for images
@app.get("/api/asset")
async def serve_asset(path: str):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)

# ---------------------------------------------------------
# OLLAMA PROXY (VS Code Integration)
# ---------------------------------------------------------
OLLAMA_URL = "http://localhost:11434"

def save_captured_conversation(endpoint: str, body_bytes: bytes, full_response: str):
    try:
        body = json.loads(body_bytes)
        vault_path = os.path.expanduser(load_config().get("vault_path", ""))
        if not vault_path:
            return
            
        prompt = ""
        if endpoint == "chat":
            messages = body.get("messages", [])
            if messages:
                prompt = messages[-1].get("content", "")
        elif endpoint == "generate":
            prompt = body.get("prompt", "")
            
        if not prompt or not full_response:
            return
            
        slug = prompt[:30].lower().replace(" ", "_").replace("\n", "")
        slug = "".join(c for c in slug if c.isalnum() or c == "_")
        if not slug:
            slug = "conversation"
            
        file_path = os.path.join(vault_path, f"{slug}_{uuid.uuid4().hex[:8]}.md")
        
        now = datetime.utcnow().isoformat() + "Z"
        note_id = str(uuid.uuid4())
        
        markdown = f"---\nid: {note_id}\ntitle: Captured Chat\ntype: capture\ntags: [vscode, chat]\nlinks: []\ncreated: {now}\nupdated: {now}\n---\n\n### Prompt\n{prompt}\n\n### Response\n{full_response}\n"
        
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(markdown)
        print(f"Captured conversation saved to {file_path}")
    except Exception as e:
        print(f"Error saving conversation: {e}")

async def proxy_ollama_request(endpoint: str, request: Request):
    body_bytes = await request.body()
    
    async def streamer():
        full_response = ""
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    method=request.method,
                    url=f"{OLLAMA_URL}/api/{endpoint}",
                    content=body_bytes
                ) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
                        try:
                            text = chunk.decode('utf-8')
                            for line in text.strip().split('\n'):
                                if line:
                                    data = json.loads(line)
                                    if endpoint == "chat":
                                        full_response += data.get("message", {}).get("content", "")
                                    else:
                                        full_response += data.get("response", "")
                        except Exception:
                            pass
            # After stream finishes, save the conversation
            save_captured_conversation(endpoint, body_bytes, full_response)
        except Exception as e:
            print(f"Proxy error: {e}")
            
    return StreamingResponse(streamer(), media_type="application/x-ndjson")

@app.post("/api/chat")
async def proxy_chat(request: Request):
    return await proxy_ollama_request("chat", request)

@app.post("/api/generate")
async def proxy_generate(request: Request):
    return await proxy_ollama_request("generate", request)

@app.get("/api/tags")
async def proxy_tags(request: Request):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{OLLAMA_URL}/api/tags")
        return Response(content=r.content, media_type=r.headers.get("content-type"))

# Serve the compiled React UI (Vite dist)
dist_dir = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="ui")
else:
    @app.get("/")
    async def no_ui():
        return {"error": "UI not built. Run 'npm run build' in the genten root directory first!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
