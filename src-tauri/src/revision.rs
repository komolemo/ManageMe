use crate::workspace::Database;
use rusqlite::Connection;
use serde::Serialize;

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Revision {
    pub id: String,
    pub kind: String,
    pub title: String,
    pub updated_at: String,
}

pub fn list(connection: &Connection, limit: i64) -> Result<Vec<Revision>, String> {
    if !(1..=100).contains(&limit) {
        return Err("limit must be between 1 and 100".into());
    }

    let mut statement = connection
        .prepare(
            "SELECT id, kind, title, updated_at FROM (
               SELECT task_id AS id, 'task' AS kind, title, updated_at
               FROM TASKS WHERE deleted_at IS NULL
               UNION ALL
               SELECT document_id AS id, 'document' AS kind, title, updated_at
               FROM DOCUMENTS WHERE deleted_at IS NULL
             )
             ORDER BY updated_at DESC, kind, id
             LIMIT ?1",
        )
        .map_err(|error| error.to_string())?;

    let revisions = statement
        .query_map([limit], |row| {
            Ok(Revision {
                id: row.get(0)?,
                kind: row.get(1)?,
                title: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(revisions)
}

#[tauri::command]
pub fn list_recent_revisions(
    database: tauri::State<'_, Database>,
    limit: Option<i64>,
) -> Result<Vec<Revision>, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    list(&connection, limit.unwrap_or(10))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lists_tasks_and_documents_by_most_recent_update() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE TASKS (
                   task_id TEXT PRIMARY KEY, title TEXT NOT NULL,
                   updated_at TEXT NOT NULL, deleted_at TEXT
                 );
                 CREATE TABLE DOCUMENTS (
                   document_id TEXT PRIMARY KEY, title TEXT NOT NULL,
                   updated_at TEXT NOT NULL, deleted_at TEXT
                 );
                 INSERT INTO TASKS VALUES
                   ('task-old', 'Old task', '2026-08-01T00:00:00Z', NULL),
                   ('task-new', 'New task', '2026-08-03T00:00:00Z', NULL);
                 INSERT INTO DOCUMENTS VALUES
                   ('document-middle', 'Middle document', '2026-08-02T00:00:00Z', NULL),
                   ('document-deleted', 'Deleted', '2026-08-04T00:00:00Z', '2026-08-04');",
            )
            .unwrap();

        let revisions = list(&connection, 3).unwrap();
        assert_eq!(
            revisions
                .iter()
                .map(|revision| (revision.kind.as_str(), revision.id.as_str()))
                .collect::<Vec<_>>(),
            vec![
                ("task", "task-new"),
                ("document", "document-middle"),
                ("task", "task-old"),
            ]
        );
    }
}
