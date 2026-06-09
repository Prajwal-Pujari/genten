use tauri::{AppHandle, Emitter};
use reqwest::Client;

#[tauri::command]
pub async fn test_ollama_connection(endpoint: String) -> Result<Vec<String>, String> {
    let url = format!("{}/api/tags", endpoint.trim_end_matches('/'));
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }
    
    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let mut models = Vec::new();
    if let Some(models_arr) = json["models"].as_array() {
        for m in models_arr {
            if let Some(name) = m["name"].as_str() {
                models.push(name.to_string());
            }
        }
    }
    Ok(models)
}

#[tauri::command]
pub async fn analyze_vision_image(endpoint: String, model: String, image_base64: String) -> Result<String, String> {
    let url = format!("{}/api/generate", endpoint.trim_end_matches('/'));
    let client = Client::new();
    
    let mut body = serde_json::Map::new();
    body.insert("model".to_string(), serde_json::Value::String(model));
    body.insert("prompt".to_string(), serde_json::Value::String("You are an expert OCR and image analysis system. Extract all text, code, and explain what is in this image in extreme detail.".to_string()));
    body.insert("images".to_string(), serde_json::json!([image_base64]));
    body.insert("stream".to_string(), serde_json::Value::Bool(false));
    
    let response = client.post(&url).json(&body).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }
    
    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    Ok(json["response"].as_str().unwrap_or("").to_string())
}

#[tauri::command]
pub async fn generate_ollama_chat(
    app: AppHandle,
    endpoint: String,
    model: String,
    messages: serde_json::Value,
    req_id: String,
) -> Result<String, String> {
    let url = format!("{}/api/chat", endpoint.trim_end_matches('/'));
    let client = Client::new();
    
    let mut body = serde_json::Map::new();
    body.insert("model".to_string(), serde_json::Value::String(model));
    body.insert("messages".to_string(), messages);
    body.insert("stream".to_string(), serde_json::Value::Bool(true));
    
    let mut response = client.post(&url).json(&body).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }
    
    let mut full_response = String::new();
    
    while let Ok(Some(chunk)) = response.chunk().await {
        if let Ok(text) = String::from_utf8(chunk.to_vec()) {
            // Ollama chunks can contain multiple lines
            for line in text.lines() {
                if line.trim().is_empty() { continue; }
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                    if let Some(content) = json["message"]["content"].as_str() {
                        full_response.push_str(content);
                        // Emit the chunk back to the frontend
                        let event_name = format!("ollama-chunk-{}", req_id);
                        let _ = app.emit(&event_name, content);
                    }
                }
            }
        }
    }
    
    Ok(full_response)
}
