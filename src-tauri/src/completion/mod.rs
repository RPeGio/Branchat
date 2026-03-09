// use std::path::PathBuf;
// use std::env;
use futures::StreamExt;
use serde;
use serde_json;
use tauri::{AppHandle, Emitter};

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct MessageContext {
    pub content: String,
    pub role: String,
}

#[tauri::command]
pub async fn stream_chat(app: AppHandle, key: String, contexts: Vec<MessageContext>) -> Result<(), String> {
// pub async fn stream_chat(app: AppHandle, key: String) -> Result<(), String> {
    // let project_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
    //     .parent()
    //     .unwrap()
    //     .parent()
    //     .unwrap()
    //     .to_path_buf();
    
    // let env_path = project_root.join(".env");
    // println!("Looking for .env at: {:?}", env_path);
    
    // if env_path.exists() {
    //     println!(".env file found, loading...");
    //     dotenv::from_path(&env_path).ok();
    // } else {
    //     println!(".env file not found at {:?}, trying default location", env_path);
    //     dotenv::dotenv().ok();
    // }
    
    // // 打印所有环境变量用于调试
    // println!("Available env vars: {:?}", env::vars().collect::<Vec<_>>());
    
    // let auth = match env::var("API_KEY") {
    //     Ok(key) => {
    //         println!("API_KEY loaded successfully (first 10 chars): {}...", &key[..10.min(key.len())]);
    //         key
    //     },
    //     Err(_) => {
    //         let error_msg = format!("API_KEY not found. .env path: {:?}", env_path);
    //         println!("{}", error_msg);
    //         return Err(error_msg);
    //     }
    // };
    let client = reqwest::Client::new();
    
    println!("Sending request to DeepSeek API...");
    
    let response = client
        .post("https://api.deepseek.com/chat/completions")
        .header("Authorization", format!("Bearer {}", key))
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
            "messages": &contexts
                .iter()
                .map(|ctx| {
                    serde_json::json!({
                        "content": ctx.content,
                        "role": ctx.role,
                    })
                }).collect::<Vec<_>>(),
            "model": "deepseek-chat",
            "stream": true,
            "max_tokens": 2000,
            "temperature": 0.7
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    app.emit("completion-status", response.status().to_string()).unwrap();

    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        // 将二进制chunk转换为字符串（SSE格式）
        if let Ok(text) = String::from_utf8(chunk.to_vec()) {
            // 解析 SSE 数据 (data: {...}\n\n)
            for line in text.lines() {
                if line.starts_with("data: ") {
                    let data = &line[6..];
                    if data == "[DONE]" {
                        println!("Stream completed");
                        app.emit("completion-end", "Stream completed").unwrap();
                        break;
                    } else {
                        let parsed_data: serde_json::Value = serde_json::from_str(data).unwrap();
                        if let Some(content) = parsed_data["choices"][0]["delta"]["content"].as_str() {
                            if !content.is_empty() {
                                // print!("{}", content);
                                // std::io::stdout().flush().unwrap();
                                app.emit("completion-chunk", content.to_string()).unwrap();
                            }
                        }
                    }
                }
            }
        }
    }
    Ok(())
}
