use tauri_plugin_deep_link::DeepLinkExt;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
          println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
          // when defining deep link schemes at runtime, you must also check `argv` here
        }));
    }



    builder
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // Note that get_current's return value will also get updated every time on_open_url gets triggered.
            let start_urls = app.deep_link().get_current()?;
            if let Some(urls) = start_urls {
                // app was likely started by a deep link
                println!("deep link URLs: {:?}", urls);
            }

            app.deep_link().on_open_url(|event| {
                println!("deep link URLs: {:?}", event.urls());
            });

            #[cfg(desktop)]
            app.deep_link().register("org.collintl.app")?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
