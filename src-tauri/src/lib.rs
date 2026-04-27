// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod completion;
// use tauri::menu::MenuBuilder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_prevent_default::debug())
        .invoke_handler(tauri::generate_handler![
            completion::stream_chat,
            completion::balance,
            completion::title_generation,
        ])
        // .setup(|app| {
        //     let menu = MenuBuilder::new(app)
        //         .text("file", "File")
        //         .text("about", "About")
        //         .build()?;
        //     app.set_menu(menu)?;
        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
