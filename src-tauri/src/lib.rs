mod bucket;
mod database_migrations;
mod milestone;
mod tag;
mod workspace;

use rusqlite::Connection;
use tauri::Manager;
use workspace::Database;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve the application data directory");
            std::fs::create_dir_all(&app_data_dir)
                .expect("failed to create the application data directory");
            let mut database = Connection::open(app_data_dir.join("manageme.db"))
                .expect("failed to open the database");
            workspace::migrate(&database).expect("failed to migrate the Workspace table");
            database_migrations::remove_tag_colors_table(&mut database)
                .expect("failed to remove the Tag color master table");
            database_migrations::migrate_milestones_workspace_fk(&mut database)
                .expect("failed to migrate the Milestone workspace foreign key");
            database_migrations::migrate_buckets_workspace_fk(&mut database)
                .expect("failed to migrate the Bucket workspace foreign key");
            database_migrations::remove_task_priority_master(&mut database)
                .expect("failed to remove the Task priority master table");
            database
                .execute_batch(include_str!("../db/schema.sql"))
                .expect("failed to apply the database schema");
            app.manage(Database(std::sync::Mutex::new(database)));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            workspace::create_workspace,
            workspace::get_workspace_by_id,
            workspace::get_workspace_by_key,
            workspace::list_workspaces,
            workspace::update_workspace,
            workspace::delete_workspace,
            bucket::create_bucket,
            bucket::list_buckets,
            bucket::update_bucket,
            bucket::reorder_buckets,
            bucket::delete_bucket,
            milestone::create_milestone,
            milestone::list_milestones,
            milestone::update_milestone,
            milestone::reorder_milestones,
            milestone::delete_milestone,
            tag::create_tag,
            tag::get_tag_by_id,
            tag::list_tags,
            tag::search_tags,
            tag::update_tag,
            tag::delete_tag,
            tag::touch_tag_last_used
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
