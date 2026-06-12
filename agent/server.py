import os
import json
import hashlib
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Genten Agent Brain")

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
