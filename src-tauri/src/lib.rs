mod bucket;
mod database_migrations;
mod dictionary_word;
mod document;
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
            database_migrations::add_dictionary_word_deleted_at(&database)
                .expect("failed to add Dictionary word logical deletion");
            database_migrations::add_document_metadata_columns(&database)
                .expect("failed to add Document metadata columns");
            database_migrations::migrate_documents_workspace_fk(&mut database)
                .expect("failed to migrate the Document workspace foreign key");
            database
                .execute_batch(include_str!("../db/schema.sql"))
                .expect("failed to apply the database schema");
            #[cfg(debug_assertions)]
            database
                .execute_batch(include_str!("../db/seed_document_test_data.sql"))
                .expect("failed to seed Document test data");
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
            dictionary_word::create_dictionary_word,
            dictionary_word::get_dictionary_word_by_id,
            dictionary_word::list_dictionary_words,
            dictionary_word::search_dictionary_words,
            dictionary_word::update_dictionary_word,
            dictionary_word::delete_dictionary_word,
            document::create_document,
            document::get_document_by_id,
            document::list_documents,
            document::update_document_title,
            document::update_document_content,
            document::update_document,
            document::update_document_icon,
            document::delete_document,
            document::restore_document,
            document::create_task_document,
            document::list_document_tree,
            document::move_document,
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
