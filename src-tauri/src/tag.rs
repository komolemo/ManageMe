use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub tag_id: String,
    pub name: String,
    pub color_id: Option<i64>,
    pub description: String,
    pub last_used_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub task_count: i64,
    pub document_count: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTag {
    pub tag_id: String,
    pub name: String,
    pub color_id: Option<i64>,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTag {
    pub name: String,
    pub color_id: Option<i64>,
    pub description: String,
}

const SELECT_COLUMNS: &str = "tag_id, name, color_id, COALESCE(description, ''), last_used_at, \
     created_at, updated_at, \
     (SELECT COUNT(*) FROM TASK_TAG_BIND task_bind WHERE task_bind.tag_id = TAGS.tag_id), \
     (SELECT COUNT(*) FROM DOCUMENT_TAG_BIND document_bind WHERE document_bind.tag_id = TAGS.tag_id)";

fn validate_required(label: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{label} is required"))
    } else {
        Ok(())
    }
}

fn validate_color_id(color_id: Option<i64>) -> Result<(), String> {
    if color_id.is_some_and(|id| !(1..=14).contains(&id)) {
        Err("colorId must be between 1 and 14".into())
    } else {
        Ok(())
    }
}

fn map_tag(row: &rusqlite::Row<'_>) -> rusqlite::Result<Tag> {
    Ok(Tag {
        tag_id: row.get(0)?,
        name: row.get(1)?,
        color_id: row.get(2)?,
        description: row.get(3)?,
        last_used_at: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
        task_count: row.get(7)?,
        document_count: row.get(8)?,
    })
}

pub fn create(connection: &Connection, input: CreateTag) -> Result<Tag, String> {
    validate_required("tagId", &input.tag_id)?;
    validate_required("name", &input.name)?;
    validate_color_id(input.color_id)?;
    connection
        .execute(
            "INSERT INTO TAGS (tag_id, name, color_id, description)
             VALUES (?1, ?2, ?3, ?4)",
            params![
                input.tag_id,
                input.name.trim(),
                input.color_id,
                input.description
            ],
        )
        .map_err(|error| error.to_string())?;
    find_by_id(connection, &input.tag_id)?
        .ok_or_else(|| "The created Tag could not be retrieved".into())
}

pub fn find_by_id(connection: &Connection, id: &str) -> Result<Option<Tag>, String> {
    connection
        .query_row(
            &format!("SELECT {SELECT_COLUMNS} FROM TAGS WHERE tag_id = ?1"),
            [id],
            map_tag,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn list(connection: &Connection) -> Result<Vec<Tag>, String> {
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM TAGS
             ORDER BY name COLLATE NOCASE, tag_id"
        ))
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], map_tag)
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

fn escape_like(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

pub fn search(connection: &Connection, query: &str, limit: u32) -> Result<Vec<Tag>, String> {
    let query = query.trim();
    if query.is_empty() || limit == 0 {
        return Ok(Vec::new());
    }
    let pattern = format!("{}%", escape_like(query));
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM TAGS
             WHERE name LIKE ?1 ESCAPE '\\' COLLATE NOCASE
             ORDER BY
               CASE WHEN name = ?2 COLLATE NOCASE THEN 0 ELSE 1 END,
               name COLLATE NOCASE, tag_id
             LIMIT ?3"
        ))
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(params![pattern, query, i64::from(limit)], map_tag)
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

pub fn update(connection: &Connection, id: &str, input: UpdateTag) -> Result<Option<Tag>, String> {
    validate_required("name", &input.name)?;
    validate_color_id(input.color_id)?;
    let changed = connection
        .execute(
            "UPDATE TAGS
             SET name = ?1, color_id = ?2, description = ?3,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE tag_id = ?4",
            params![input.name.trim(), input.color_id, input.description, id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, id)
}

pub fn touch_last_used(connection: &Connection, id: &str) -> Result<Option<Tag>, String> {
    let changed = connection
        .execute(
            "UPDATE TAGS
             SET last_used_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE tag_id = ?1",
            [id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, id)
}

pub fn delete(connection: &Connection, id: &str) -> Result<bool, String> {
    connection
        .execute("DELETE FROM TAGS WHERE tag_id = ?1", [id])
        .map(|changed| changed > 0)
        .map_err(|error| error.to_string())
}

fn with_connection<T>(
    database: &tauri::State<'_, Database>,
    operation: impl FnOnce(&Connection) -> Result<T, String>,
) -> Result<T, String> {
    let connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    operation(&connection)
}

#[tauri::command]
pub fn create_tag(database: tauri::State<'_, Database>, input: CreateTag) -> Result<Tag, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn get_tag_by_id(
    database: tauri::State<'_, Database>,
    tag_id: String,
) -> Result<Option<Tag>, String> {
    with_connection(&database, |connection| find_by_id(connection, &tag_id))
}

#[tauri::command]
pub fn list_tags(database: tauri::State<'_, Database>) -> Result<Vec<Tag>, String> {
    with_connection(&database, list)
}

#[tauri::command]
pub fn search_tags(
    database: tauri::State<'_, Database>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<Tag>, String> {
    with_connection(&database, |connection| {
        search(connection, &query, limit.unwrap_or(5).min(100))
    })
}

#[tauri::command]
pub fn update_tag(
    database: tauri::State<'_, Database>,
    tag_id: String,
    input: UpdateTag,
) -> Result<Option<Tag>, String> {
    with_connection(&database, |connection| update(connection, &tag_id, input))
}

#[tauri::command]
pub fn delete_tag(database: tauri::State<'_, Database>, tag_id: String) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &tag_id))
}

#[tauri::command]
pub fn touch_tag_last_used(
    database: tauri::State<'_, Database>,
    tag_id: String,
) -> Result<Option<Tag>, String> {
    with_connection(&database, |connection| touch_last_used(connection, &tag_id))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn connection() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE TAGS (
                   tag_id TEXT PRIMARY KEY,
                   name TEXT NOT NULL UNIQUE,
                   color_id INTEGER,
                   description TEXT,
                   last_used_at TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                 );
                 CREATE TABLE TASK_TAG_BIND (
                   task_id TEXT NOT NULL,
                   tag_id TEXT NOT NULL,
                   PRIMARY KEY (task_id, tag_id)
                 );
                 CREATE TABLE DOCUMENT_TAG_BIND (
                   document_id TEXT NOT NULL,
                   tag_id TEXT NOT NULL,
                   PRIMARY KEY (document_id, tag_id)
                 );",
            )
            .unwrap();
        connection
    }

    #[test]
    fn tag_operations_work() {
        let connection = connection();
        let created = create(
            &connection,
            CreateTag {
                tag_id: "tag-1".into(),
                name: "Backend".into(),
                color_id: Some(7),
                description: "Server-side work".into(),
            },
        )
        .unwrap();
        assert_eq!(created.name, "Backend");
        assert_eq!(find_by_id(&connection, "tag-1").unwrap(), Some(created));
        assert_eq!(list(&connection).unwrap().len(), 1);
        assert_eq!(search(&connection, "back", 5).unwrap().len(), 1);
        assert!(search(&connection, "front", 5).unwrap().is_empty());

        let updated = update(
            &connection,
            "tag-1",
            UpdateTag {
                name: "API".into(),
                color_id: Some(8),
                description: "API work".into(),
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(updated.name, "API");
        assert_eq!(updated.color_id, Some(8));
        assert_eq!(updated.description, "API work");

        connection
            .execute(
                "INSERT INTO TASK_TAG_BIND (task_id, tag_id) VALUES ('task-1', 'tag-1')",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO DOCUMENT_TAG_BIND (document_id, tag_id) VALUES ('document-1', 'tag-1')",
                [],
            )
            .unwrap();
        let counted = find_by_id(&connection, "tag-1").unwrap().unwrap();
        assert_eq!(counted.task_count, 1);
        assert_eq!(counted.document_count, 1);

        let touched = touch_last_used(&connection, "tag-1").unwrap().unwrap();
        assert!(touched.last_used_at.is_some());
        assert!(delete(&connection, "tag-1").unwrap());
        assert!(find_by_id(&connection, "tag-1").unwrap().is_none());
        assert!(!delete(&connection, "tag-1").unwrap());
        assert!(find_by_id(&connection, "missing").unwrap().is_none());
        assert!(update(
            &connection,
            "missing",
            UpdateTag {
                name: "Missing".into(),
                color_id: None,
                description: String::new(),
            }
        )
        .unwrap()
        .is_none());
        assert!(touch_last_used(&connection, "missing").unwrap().is_none());
    }

    #[test]
    fn rejects_invalid_input_and_escapes_search_wildcards() {
        let connection = connection();
        assert!(create(
            &connection,
            CreateTag {
                tag_id: "tag-1".into(),
                name: " ".into(),
                color_id: Some(7),
                description: String::new(),
            }
        )
        .is_err());
        assert!(create(
            &connection,
            CreateTag {
                tag_id: "tag-2".into(),
                name: "Percent".into(),
                color_id: Some(99),
                description: String::new(),
            }
        )
        .is_err());
        create(
            &connection,
            CreateTag {
                tag_id: "tag-3".into(),
                name: "100%".into(),
                color_id: None,
                description: String::new(),
            },
        )
        .unwrap();
        create(
            &connection,
            CreateTag {
                tag_id: "tag-4".into(),
                name: "Backend".into(),
                color_id: None,
                description: String::new(),
            },
        )
        .unwrap();
        assert_eq!(search(&connection, "100%", 5).unwrap().len(), 1);
        assert!(search(&connection, "_", 5).unwrap().is_empty());
        assert_eq!(search(&connection, "back", 5).unwrap().len(), 1);
        assert!(search(&connection, "end", 5).unwrap().is_empty());
    }
}
