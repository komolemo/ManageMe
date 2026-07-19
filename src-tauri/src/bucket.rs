use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Bucket {
    pub bucket_id: String,
    pub workspace_id: String,
    pub name: String,
    pub status_type: i64,
    pub display_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBucket {
    pub bucket_id: String,
    pub workspace_id: String,
    pub name: String,
    pub status_type: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBucket {
    pub name: String,
    pub status_type: i64,
}

const SELECT_COLUMNS: &str = "b.bucket_id, b.workspace_id, b.name, b.status_type, \
     o.display_order, b.created_at, b.updated_at";

fn map_bucket(row: &rusqlite::Row<'_>) -> rusqlite::Result<Bucket> {
    Ok(Bucket {
        bucket_id: row.get(0)?,
        workspace_id: row.get(1)?,
        name: row.get(2)?,
        status_type: row.get(3)?,
        display_order: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}

fn validate_name(name: &str) -> Result<&str, String> {
    let name = name.trim();
    if name.is_empty() {
        Err("name is required".into())
    } else {
        Ok(name)
    }
}

fn validate_status(status_type: i64) -> Result<(), String> {
    if [0, 50, 100].contains(&status_type) {
        Ok(())
    } else {
        Err("statusType must be 0, 50, or 100".into())
    }
}

fn duplicate_name(
    connection: &Connection,
    workspace_id: &str,
    name: &str,
    ignored_id: Option<&str>,
) -> Result<bool, String> {
    connection
        .query_row(
            "SELECT EXISTS(
               SELECT 1 FROM BUCKETS
               WHERE workspace_id = ?1
                 AND name = ?2 COLLATE NOCASE
                 AND (?3 IS NULL OR bucket_id <> ?3)
             )",
            params![workspace_id, name, ignored_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())
}

fn find_by_id(connection: &Connection, id: &str) -> Result<Option<Bucket>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS}
                 FROM BUCKETS b
                 JOIN BUCKET_ORDER o
                   ON o.workspace_id = b.workspace_id
                  AND o.bucket_id = b.bucket_id
                 WHERE b.bucket_id = ?1"
            ),
            [id],
            map_bucket,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create(connection: &mut Connection, input: CreateBucket) -> Result<Bucket, String> {
    let name = validate_name(&input.name)?;
    validate_status(input.status_type)?;
    if input.bucket_id.trim().is_empty() || input.workspace_id.trim().is_empty() {
        return Err("bucketId and workspaceId are required".into());
    }
    if duplicate_name(connection, &input.workspace_id, name, None)? {
        return Err("A Bucket with the same name already exists".into());
    }

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    let display_order: i64 = transaction
        .query_row(
            "SELECT COALESCE(MAX(display_order), -1) + 1
             FROM BUCKET_ORDER WHERE workspace_id = ?1",
            [&input.workspace_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO BUCKETS (
               bucket_id, workspace_id, name, status_type, display_order
             ) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                input.bucket_id,
                input.workspace_id,
                name,
                input.status_type,
                display_order
            ],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO BUCKET_ORDER (
               workspace_id, bucket_id, display_order
             ) VALUES (?1, ?2, ?3)",
            params![input.workspace_id, input.bucket_id, display_order],
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    find_by_id(connection, &input.bucket_id)?
        .ok_or_else(|| "The created Bucket could not be retrieved".into())
}

pub fn list(connection: &Connection, workspace_id: &str) -> Result<Vec<Bucket>, String> {
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS}
             FROM BUCKETS b
             JOIN BUCKET_ORDER o
               ON o.workspace_id = b.workspace_id
              AND o.bucket_id = b.bucket_id
             WHERE b.workspace_id = ?1
             ORDER BY o.display_order, b.bucket_id"
        ))
        .map_err(|error| error.to_string())?;
    let buckets = statement
        .query_map([workspace_id], map_bucket)
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(buckets)
}

pub fn update(
    connection: &Connection,
    bucket_id: &str,
    input: UpdateBucket,
) -> Result<Option<Bucket>, String> {
    let name = validate_name(&input.name)?;
    validate_status(input.status_type)?;
    let workspace_id: Option<String> = connection
        .query_row(
            "SELECT workspace_id FROM BUCKETS WHERE bucket_id = ?1",
            [bucket_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some(workspace_id) = workspace_id else {
        return Ok(None);
    };
    if duplicate_name(connection, &workspace_id, name, Some(bucket_id))? {
        return Err("A Bucket with the same name already exists".into());
    }
    connection
        .execute(
            "UPDATE BUCKETS
             SET name = ?1, status_type = ?2,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE bucket_id = ?3",
            params![name, input.status_type, bucket_id],
        )
        .map_err(|error| error.to_string())?;
    find_by_id(connection, bucket_id)
}

fn set_order(
    transaction: &Transaction<'_>,
    workspace_id: &str,
    bucket_ids: &[String],
) -> Result<(), String> {
    let temporary_base: i64 = transaction
        .query_row(
            "SELECT COALESCE(MAX(display_order), -1) + 1
             FROM BUCKET_ORDER WHERE workspace_id = ?1",
            [workspace_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    for (index, bucket_id) in bucket_ids.iter().enumerate() {
        let temporary_order = temporary_base + index as i64;
        transaction
            .execute(
                "UPDATE BUCKET_ORDER SET display_order = ?1
                 WHERE workspace_id = ?2 AND bucket_id = ?3",
                params![temporary_order, workspace_id, bucket_id],
            )
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "UPDATE BUCKETS SET display_order = ?1
                 WHERE workspace_id = ?2 AND bucket_id = ?3",
                params![temporary_order, workspace_id, bucket_id],
            )
            .map_err(|error| error.to_string())?;
    }
    for (index, bucket_id) in bucket_ids.iter().enumerate() {
        transaction
            .execute(
                "UPDATE BUCKET_ORDER
                 SET display_order = ?1,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE workspace_id = ?2 AND bucket_id = ?3",
                params![index as i64, workspace_id, bucket_id],
            )
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "UPDATE BUCKETS
                 SET display_order = ?1,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE workspace_id = ?2 AND bucket_id = ?3",
                params![index as i64, workspace_id, bucket_id],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn reorder(
    connection: &mut Connection,
    workspace_id: &str,
    bucket_ids: Vec<String>,
) -> Result<Vec<Bucket>, String> {
    let existing_ids: HashSet<_> = list(connection, workspace_id)?
        .into_iter()
        .map(|item| item.bucket_id)
        .collect();
    let supplied_ids: HashSet<_> = bucket_ids.iter().cloned().collect();
    if existing_ids != supplied_ids || supplied_ids.len() != bucket_ids.len() {
        return Err("bucketIds must contain every Bucket exactly once".into());
    }
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    set_order(&transaction, workspace_id, &bucket_ids)?;
    transaction.commit().map_err(|error| error.to_string())?;
    list(connection, workspace_id)
}

pub fn delete(connection: &mut Connection, bucket_id: &str) -> Result<bool, String> {
    let workspace_id: Option<String> = connection
        .query_row(
            "SELECT workspace_id FROM BUCKETS WHERE bucket_id = ?1",
            [bucket_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some(workspace_id) = workspace_id else {
        return Ok(false);
    };
    let fallback_id: Option<String> = connection
        .query_row(
            "SELECT b.bucket_id
             FROM BUCKETS b
             JOIN BUCKET_ORDER o
               ON o.workspace_id = b.workspace_id
              AND o.bucket_id = b.bucket_id
             WHERE b.workspace_id = ?1 AND b.bucket_id <> ?2
             ORDER BY o.display_order LIMIT 1",
            params![workspace_id, bucket_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some(fallback_id) = fallback_id else {
        return Err("Keep at least one Bucket".into());
    };

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "UPDATE TASKS SET bucket_id = ?1 WHERE bucket_id = ?2",
            params![fallback_id, bucket_id],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM BUCKETS WHERE bucket_id = ?1", [bucket_id])
        .map_err(|error| error.to_string())?;
    let remaining_ids = {
        let mut statement = transaction
            .prepare(
                "SELECT bucket_id FROM BUCKET_ORDER
                 WHERE workspace_id = ?1 ORDER BY display_order",
            )
            .map_err(|error| error.to_string())?;
        let ids = statement
            .query_map([&workspace_id], |row| row.get(0))
            .map_err(|error| error.to_string())?
            .collect::<rusqlite::Result<Vec<String>>>()
            .map_err(|error| error.to_string())?;
        ids
    };
    set_order(&transaction, &workspace_id, &remaining_ids)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(true)
}

fn with_connection<T>(
    database: &tauri::State<'_, Database>,
    operation: impl FnOnce(&mut Connection) -> Result<T, String>,
) -> Result<T, String> {
    let mut connection = database
        .0
        .lock()
        .map_err(|_| "Failed to acquire the database lock")?;
    operation(&mut connection)
}

#[tauri::command]
pub fn create_bucket(
    database: tauri::State<'_, Database>,
    input: CreateBucket,
) -> Result<Bucket, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn list_buckets(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<Bucket>, String> {
    with_connection(&database, |connection| list(connection, &workspace_id))
}

#[tauri::command]
pub fn update_bucket(
    database: tauri::State<'_, Database>,
    bucket_id: String,
    input: UpdateBucket,
) -> Result<Option<Bucket>, String> {
    with_connection(&database, |connection| {
        update(connection, &bucket_id, input)
    })
}

#[tauri::command]
pub fn reorder_buckets(
    database: tauri::State<'_, Database>,
    workspace_id: String,
    bucket_ids: Vec<String>,
) -> Result<Vec<Bucket>, String> {
    with_connection(&database, |connection| {
        reorder(connection, &workspace_id, bucket_ids)
    })
}

#[tauri::command]
pub fn delete_bucket(
    database: tauri::State<'_, Database>,
    bucket_id: String,
) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &bucket_id))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn connection() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(include_str!("../db/schema.sql"))
            .unwrap();
        connection
            .execute(
                "INSERT INTO WORKSPACE (
                   workspace_id, workspace_key, workspace_type, name
                 ) VALUES ('workspace-1', 'project-1', 0, 'Project')",
                [],
            )
            .unwrap();
        connection
    }

    #[test]
    fn bucket_crud_and_reorder_work() {
        let mut connection = connection();
        for (id, name, status) in [
            ("b-1", "Backlog", 0),
            ("b-2", "Review", 50),
            ("b-3", "Done", 100),
        ] {
            create(
                &mut connection,
                CreateBucket {
                    bucket_id: id.into(),
                    workspace_id: "workspace-1".into(),
                    name: name.into(),
                    status_type: status,
                },
            )
            .unwrap();
        }
        let updated = update(
            &connection,
            "b-1",
            UpdateBucket {
                name: "Todo".into(),
                status_type: 50,
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!((updated.name.as_str(), updated.status_type), ("Todo", 50));
        let reordered = reorder(
            &mut connection,
            "workspace-1",
            vec!["b-3".into(), "b-1".into(), "b-2".into()],
        )
        .unwrap();
        assert_eq!(reordered[0].bucket_id, "b-3");
        assert!(delete(&mut connection, "b-2").unwrap());
        assert_eq!(list(&connection, "workspace-1").unwrap().len(), 2);
    }

    #[test]
    fn rejects_invalid_bucket_input() {
        let mut connection = connection();
        assert!(create(
            &mut connection,
            CreateBucket {
                bucket_id: "b-1".into(),
                workspace_id: "workspace-1".into(),
                name: "Backlog".into(),
                status_type: 25,
            },
        )
        .is_err());
    }
}
