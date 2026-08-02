mod bucket;
mod database_migrations;
mod dictionary_word;
mod document;
mod milestone;
mod search_log;
mod tag;
mod tag_bind;
mod task;
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
            database_migrations::add_task_description(&database)
                .expect("failed to add the Task description");
            database_migrations::add_dictionary_word_deleted_at(&database)
                .expect("failed to add Dictionary word logical deletion");
            database_migrations::add_document_metadata_columns(&database)
                .expect("failed to add Document metadata columns");
            database_migrations::migrate_documents_workspace_fk(&mut database)
                .expect("failed to migrate the Document workspace foreign key");
            database_migrations::migrate_tasks_to_independent_entities(&mut database)
                .expect("failed to migrate Tasks to independent entities");
            database_migrations::remove_task_statuses(&database)
                .expect("failed to remove the deprecated Task statuses");
            database_migrations::migrate_order_tables(&mut database)
                .expect("failed to migrate ORDER tables to order_hint");
            database_migrations::add_search_log_timestamps(&database)
                .expect("failed to add search log timestamps");
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
            document::list_document_tree,
            document::move_document,
            milestone::create_milestone,
            milestone::list_milestones,
            milestone::update_milestone,
            milestone::reorder_milestones,
            milestone::delete_milestone,
            search_log::create_search_word_log,
            search_log::create_search_document_log,
            search_log::create_search_task_log,
            search_log::list_recent_search_words,
            search_log::list_recent_search_documents,
            search_log::list_recent_search_tasks,
            search_log::list_search_suggestions,
            search_log::touch_search_word_log,
            search_log::touch_search_document_log,
            search_log::touch_search_task_log,
            search_log::delete_search_word_log,
            search_log::delete_search_document_log,
            search_log::delete_search_task_log,
            search_log::clear_search_word_logs,
            search_log::clear_search_document_logs,
            search_log::clear_search_task_logs,
            search_log::prune_search_logs,
            tag::create_tag,
            tag::get_tag_by_id,
            tag::list_tags,
            tag::search_tags,
            tag::update_tag,
            tag::delete_tag,
            tag::touch_tag_last_used,
            tag_bind::bind_tag_to_task,
            tag_bind::bind_tag_to_document,
            tag_bind::list_tags_by_task,
            tag_bind::list_tags_by_document,
            tag_bind::list_tasks_by_tag,
            tag_bind::list_documents_by_tag,
            tag_bind::replace_task_tags,
            tag_bind::replace_document_tags,
            tag_bind::unbind_tag_from_task,
            tag_bind::unbind_tag_from_document,
            tag_bind::unbind_all_tags_from_task,
            tag_bind::unbind_all_tags_from_document,
            task::create_task,
            task::get_task_by_id,
            task::list_tasks,
            task::search_tasks,
            task::update_task,
            task::update_task_bucket,
            task::update_task_status,
            task::update_task_completion,
            task::delete_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    #[test]
    fn development_seed_contains_all_project_tasks() {
        let database = Connection::open_in_memory().expect("open in-memory database");
        database
            .execute_batch("PRAGMA foreign_keys = ON;")
            .expect("enable foreign keys");
        database
            .execute_batch(include_str!("../db/schema.sql"))
            .expect("apply schema");
        database
            .execute_batch(include_str!("../db/seed_document_test_data.sql"))
            .expect("apply development seed");

        let task_count: i64 = database
            .query_row(
                "SELECT COUNT(*) FROM TASKS WHERE workspace_id = 'test-project-workspace'",
                [],
                |row| row.get(0),
            )
            .expect("count seeded Tasks");
        assert_eq!(task_count, 29);

        let bucket_count: i64 = database
            .query_row(
                "SELECT COUNT(*) FROM BUCKETS WHERE workspace_id = 'test-project-workspace'",
                [],
                |row| row.get(0),
            )
            .expect("count seeded Buckets");
        assert_eq!(bucket_count, 5);

        let task_tag_count: i64 = database
            .query_row(
                "SELECT COUNT(*) FROM TASK_TAG_BIND bind
                 JOIN TASKS task ON task.task_id = bind.task_id
                 WHERE task.workspace_id = 'test-project-workspace'",
                [],
                |row| row.get(0),
            )
            .expect("count seeded Task tags");
        assert_eq!(task_tag_count, 86);

        let relationship_count: i64 = database
            .query_row("SELECT COUNT(*) FROM TASK_RELATIVE_BIND", [], |row| {
                row.get(0)
            })
            .expect("count seeded Task relationships");
        assert_eq!(relationship_count, 5);

        for (table, expected_count) in [
            ("LOG_SEARCH_WORD", 4_i64),
            ("LOG_SEARCH_DOCUMENT", 3_i64),
            ("LOG_SEARCH_TASK", 3_i64),
        ] {
            let count: i64 = database
                .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
                    row.get(0)
                })
                .expect("count seeded search logs");
            assert_eq!(count, expected_count);
        }

        let child = crate::task::find_by_id(&database, "104", false)
            .expect("retrieve child Task")
            .expect("child Task exists");
        assert_eq!(child.parent_task_id.as_deref(), Some("103"));
    }
}
