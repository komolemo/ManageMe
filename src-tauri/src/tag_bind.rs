use crate::{
    document::{self, Document},
    tag::{self, Tag},
    task::{self, Task},
    workspace::Database,
};
use rusqlite::{params, params_from_iter, Connection};
use std::collections::HashSet;

fn required(value: &str, field: &str) -> Result<String, String> {
    let value = value.trim();
    if value.is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(value.to_owned())
    }
}

fn bind(
    connection: &Connection,
    table: &str,
    owner_column: &str,
    owner_id: &str,
    tag_id: &str,
) -> Result<bool, String> {
    let owner_id = required(owner_id, owner_column)?;
    let tag_id = required(tag_id, "tagId")?;
    connection
        .execute(
            &format!(
                "INSERT OR IGNORE INTO {table} ({owner_column}, tag_id)
                 VALUES (?1, ?2)"
            ),
            params![owner_id, tag_id],
        )
        .map(|changed| changed > 0)
        .map_err(|error| error.to_string())
}

pub fn bind_task(connection: &Connection, task_id: &str, tag_id: &str) -> Result<bool, String> {
    bind(connection, "TASK_TAG_BIND", "task_id", task_id, tag_id)
}

pub fn bind_document(
    connection: &Connection,
    document_id: &str,
    tag_id: &str,
) -> Result<bool, String> {
    bind(
        connection,
        "DOCUMENT_TAG_BIND",
        "document_id",
        document_id,
        tag_id,
    )
}

fn list_bound_tags(
    connection: &Connection,
    table: &str,
    owner_column: &str,
    owner_id: &str,
) -> Result<Vec<Tag>, String> {
    let mut statement = connection
        .prepare(&format!(
            "SELECT tag.tag_id
             FROM TAGS tag
             JOIN {table} bind ON bind.tag_id = tag.tag_id
             WHERE bind.{owner_column} = ?1
             ORDER BY tag.name COLLATE NOCASE, tag.tag_id"
        ))
        .map_err(|error| error.to_string())?;
    let ids = statement
        .query_map([owner_id], |row| row.get::<_, String>(0))
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    ids.into_iter()
        .map(|id| {
            tag::find_by_id(connection, &id)?.ok_or_else(|| format!("Tag {id} was not found"))
        })
        .collect()
}

pub fn list_tags_for_task(connection: &Connection, task_id: &str) -> Result<Vec<Tag>, String> {
    list_bound_tags(connection, "TASK_TAG_BIND", "task_id", task_id)
}

pub fn list_tags_for_document(
    connection: &Connection,
    document_id: &str,
) -> Result<Vec<Tag>, String> {
    list_bound_tags(connection, "DOCUMENT_TAG_BIND", "document_id", document_id)
}

pub fn list_tasks_for_tag(connection: &Connection, tag_id: &str) -> Result<Vec<Task>, String> {
    let mut statement = connection
        .prepare(
            "SELECT task_id FROM TASK_TAG_BIND
             WHERE tag_id = ?1 ORDER BY task_id",
        )
        .map_err(|error| error.to_string())?;
    let ids = statement
        .query_map([tag_id], |row| row.get::<_, String>(0))
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    ids.into_iter()
        .filter_map(|id| match task::find_by_id(connection, &id, false) {
            Ok(Some(task)) => Some(Ok(task)),
            Ok(None) => None,
            Err(error) => Some(Err(error)),
        })
        .collect()
}

pub fn list_documents_for_tag(
    connection: &Connection,
    tag_id: &str,
) -> Result<Vec<Document>, String> {
    let mut statement = connection
        .prepare(
            "SELECT document_id FROM DOCUMENT_TAG_BIND
             WHERE tag_id = ?1 ORDER BY document_id",
        )
        .map_err(|error| error.to_string())?;
    let ids = statement
        .query_map([tag_id], |row| row.get::<_, String>(0))
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    ids.into_iter()
        .filter_map(|id| match document::find_by_id(connection, &id, false) {
            Ok(Some(document)) => Some(Ok(document)),
            Ok(None) => None,
            Err(error) => Some(Err(error)),
        })
        .collect()
}

fn replace(
    connection: &mut Connection,
    table: &str,
    owner_column: &str,
    owner_id: &str,
    tag_ids: Vec<String>,
) -> Result<(), String> {
    let owner_id = required(owner_id, owner_column)?;
    let mut unique = HashSet::new();
    let tag_ids = tag_ids
        .into_iter()
        .map(|id| required(&id, "tagId"))
        .collect::<Result<Vec<_>, _>>()?
        .into_iter()
        .filter(|id| unique.insert(id.clone()))
        .collect::<Vec<_>>();
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            &format!("DELETE FROM {table} WHERE {owner_column} = ?1"),
            [&owner_id],
        )
        .map_err(|error| error.to_string())?;
    for tag_id in tag_ids {
        transaction
            .execute(
                &format!("INSERT INTO {table} ({owner_column}, tag_id) VALUES (?1, ?2)"),
                params![owner_id, tag_id],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())
}

pub fn replace_task(
    connection: &mut Connection,
    task_id: &str,
    tag_ids: Vec<String>,
) -> Result<Vec<Tag>, String> {
    replace(connection, "TASK_TAG_BIND", "task_id", task_id, tag_ids)?;
    list_tags_for_task(connection, task_id)
}

pub fn replace_document(
    connection: &mut Connection,
    document_id: &str,
    tag_ids: Vec<String>,
) -> Result<Vec<Tag>, String> {
    replace(
        connection,
        "DOCUMENT_TAG_BIND",
        "document_id",
        document_id,
        tag_ids,
    )?;
    list_tags_for_document(connection, document_id)
}

fn unbind(
    connection: &Connection,
    table: &str,
    owner_column: &str,
    owner_id: &str,
    tag_id: Option<&str>,
) -> Result<usize, String> {
    let (sql, values) = match tag_id {
        Some(tag_id) => (
            format!("DELETE FROM {table} WHERE {owner_column} = ?1 AND tag_id = ?2"),
            vec![owner_id, tag_id],
        ),
        None => (
            format!("DELETE FROM {table} WHERE {owner_column} = ?1"),
            vec![owner_id],
        ),
    };
    connection
        .execute(&sql, params_from_iter(values))
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn bind_tag_to_task(
    database: tauri::State<'_, Database>,
    task_id: String,
    tag_id: String,
) -> Result<bool, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    bind_task(&connection, &task_id, &tag_id)
}

#[tauri::command]
pub fn bind_tag_to_document(
    database: tauri::State<'_, Database>,
    document_id: String,
    tag_id: String,
) -> Result<bool, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    bind_document(&connection, &document_id, &tag_id)
}

macro_rules! read_command {
    ($name:ident, $id:ident, $return_type:ty, $operation:ident) => {
        #[tauri::command]
        pub fn $name(
            database: tauri::State<'_, Database>,
            $id: String,
        ) -> Result<$return_type, String> {
            let connection = database
                .0
                .lock()
                .map_err(|_| "Failed to acquire the database lock")?;
            $operation(&connection, &$id)
        }
    };
}

read_command!(list_tags_by_task, task_id, Vec<Tag>, list_tags_for_task);
read_command!(
    list_tags_by_document,
    document_id,
    Vec<Tag>,
    list_tags_for_document
);
read_command!(list_tasks_by_tag, tag_id, Vec<Task>, list_tasks_for_tag);
read_command!(
    list_documents_by_tag,
    tag_id,
    Vec<Document>,
    list_documents_for_tag
);

#[tauri::command]
pub fn replace_task_tags(
    database: tauri::State<'_, Database>,
    task_id: String,
    tag_ids: Vec<String>,
) -> Result<Vec<Tag>, String> {
    let mut connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    replace_task(&mut connection, &task_id, tag_ids)
}

#[tauri::command]
pub fn replace_document_tags(
    database: tauri::State<'_, Database>,
    document_id: String,
    tag_ids: Vec<String>,
) -> Result<Vec<Tag>, String> {
    let mut connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    replace_document(&mut connection, &document_id, tag_ids)
}

#[tauri::command]
pub fn unbind_tag_from_task(
    database: tauri::State<'_, Database>,
    task_id: String,
    tag_id: String,
) -> Result<usize, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    unbind(
        &connection,
        "TASK_TAG_BIND",
        "task_id",
        &task_id,
        Some(&tag_id),
    )
}

#[tauri::command]
pub fn unbind_tag_from_document(
    database: tauri::State<'_, Database>,
    document_id: String,
    tag_id: String,
) -> Result<usize, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    unbind(
        &connection,
        "DOCUMENT_TAG_BIND",
        "document_id",
        &document_id,
        Some(&tag_id),
    )
}

#[tauri::command]
pub fn unbind_all_tags_from_task(
    database: tauri::State<'_, Database>,
    task_id: String,
) -> Result<usize, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    unbind(&connection, "TASK_TAG_BIND", "task_id", &task_id, None)
}

#[tauri::command]
pub fn unbind_all_tags_from_document(
    database: tauri::State<'_, Database>,
    document_id: String,
) -> Result<usize, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    unbind(
        &connection,
        "DOCUMENT_TAG_BIND",
        "document_id",
        &document_id,
        None,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn connection() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = ON;
                 CREATE TABLE TAGS (
                   tag_id TEXT PRIMARY KEY,
                   name TEXT NOT NULL UNIQUE,
                   color_id INTEGER,
                   description TEXT,
                   last_used_at TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                 );
                 CREATE TABLE TASKS (
                   task_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   title TEXT NOT NULL,
                   description TEXT NOT NULL DEFAULT '',
                   start_date TEXT,
                   due_date TEXT,
                   status_id INTEGER NOT NULL,
                   priority_id INTEGER NOT NULL DEFAULT 0,
                   complete_percentage INTEGER NOT NULL DEFAULT 0,
                   milestone_id TEXT NOT NULL,
                   bucket_id TEXT NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   deleted_at TEXT
                 );
                 CREATE TABLE DOCUMENTS (
                   document_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   document_type TEXT NOT NULL,
                   title TEXT NOT NULL,
                   content TEXT,
                   icon_id TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   deleted_at TEXT
                 );
                 CREATE TABLE TASK_RELATIVE_BIND (
                   parent_task_id TEXT,
                   child_task_id TEXT
                 );
                 CREATE TABLE TASK_TAG_BIND (
                   task_id TEXT NOT NULL,
                   tag_id TEXT NOT NULL,
                   PRIMARY KEY (task_id, tag_id),
                   FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
                   FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
                 );
                 CREATE TABLE DOCUMENT_TAG_BIND (
                   document_id TEXT NOT NULL,
                   tag_id TEXT NOT NULL,
                   PRIMARY KEY (document_id, tag_id),
                   FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
                   FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
                 );
                 INSERT INTO TAGS (tag_id, name) VALUES
                   ('tag-1', 'Backend'), ('tag-2', 'Frontend');
                 INSERT INTO TASKS (
                   task_id, workspace_id, title, status_id, milestone_id, bucket_id
                 ) VALUES ('task-1', 'workspace-1', 'Task', 0, 'milestone-1', 'bucket-1');
                 INSERT INTO DOCUMENTS (
                   document_id, workspace_id, document_type, title
                 ) VALUES ('document-1', 'workspace-1', 'document', 'Document');",
            )
            .unwrap();
        connection
    }

    #[test]
    fn task_bind_crud_works_and_replace_rolls_back() {
        let mut connection = connection();
        assert!(bind_task(&connection, "task-1", "tag-1").unwrap());
        assert!(!bind_task(&connection, "task-1", "tag-1").unwrap());
        assert_eq!(list_tags_for_task(&connection, "task-1").unwrap().len(), 1);
        assert_eq!(list_tasks_for_tag(&connection, "tag-1").unwrap().len(), 1);

        let tags = replace_task(
            &mut connection,
            "task-1",
            vec!["tag-2".into(), "tag-2".into()],
        )
        .unwrap();
        assert_eq!(tags.len(), 1);
        assert_eq!(tags[0].tag_id, "tag-2");

        assert!(replace_task(&mut connection, "task-1", vec!["missing".into()]).is_err());
        assert_eq!(
            list_tags_for_task(&connection, "task-1").unwrap()[0].tag_id,
            "tag-2"
        );
        assert_eq!(
            unbind(
                &connection,
                "TASK_TAG_BIND",
                "task_id",
                "task-1",
                Some("tag-2")
            )
            .unwrap(),
            1
        );
        assert!(list_tags_for_task(&connection, "task-1")
            .unwrap()
            .is_empty());
    }

    #[test]
    fn document_bind_crud_works() {
        let mut connection = connection();
        assert!(bind_document(&connection, "document-1", "tag-1").unwrap());
        assert_eq!(
            list_tags_for_document(&connection, "document-1")
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            list_documents_for_tag(&connection, "tag-1").unwrap().len(),
            1
        );
        assert_eq!(
            replace_document(
                &mut connection,
                "document-1",
                vec!["tag-1".into(), "tag-2".into()]
            )
            .unwrap()
            .len(),
            2
        );
        assert_eq!(
            unbind(
                &connection,
                "DOCUMENT_TAG_BIND",
                "document_id",
                "document-1",
                None
            )
            .unwrap(),
            2
        );
    }
}
