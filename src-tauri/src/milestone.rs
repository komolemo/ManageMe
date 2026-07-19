use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Milestone {
    pub milestone_id: String,
    pub workspace_id: String,
    pub name: String,
    pub display_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMilestone {
    pub milestone_id: String,
    pub workspace_id: String,
    pub name: String,
}

const SELECT_COLUMNS: &str =
    "m.milestone_id, m.workspace_id, m.name, o.display_order, m.created_at, m.updated_at";

fn map_milestone(row: &rusqlite::Row<'_>) -> rusqlite::Result<Milestone> {
    Ok(Milestone {
        milestone_id: row.get(0)?,
        workspace_id: row.get(1)?,
        name: row.get(2)?,
        display_order: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
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

fn duplicate_name(
    connection: &Connection,
    workspace_id: &str,
    name: &str,
    ignored_id: Option<&str>,
) -> Result<bool, String> {
    connection
        .query_row(
            "SELECT EXISTS(
               SELECT 1 FROM MILESTONES
               WHERE workspace_id = ?1
                 AND name = ?2 COLLATE NOCASE
                 AND (?3 IS NULL OR milestone_id <> ?3)
             )",
            params![workspace_id, name, ignored_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())
}

fn find_by_id(connection: &Connection, id: &str) -> Result<Option<Milestone>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS}
                 FROM MILESTONES m
                 JOIN MILESTONE_ORDER o
                   ON o.workspace_id = m.workspace_id
                  AND o.milestone_id = m.milestone_id
                 WHERE m.milestone_id = ?1"
            ),
            [id],
            map_milestone,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create(connection: &mut Connection, input: CreateMilestone) -> Result<Milestone, String> {
    let name = validate_name(&input.name)?;
    if input.milestone_id.trim().is_empty() || input.workspace_id.trim().is_empty() {
        return Err("milestoneId and workspaceId are required".into());
    }
    if duplicate_name(connection, &input.workspace_id, name, None)? {
        return Err("A Milestone with the same name already exists".into());
    }

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    let display_order: i64 = transaction
        .query_row(
            "SELECT COALESCE(MAX(display_order), -1) + 1
             FROM MILESTONE_ORDER WHERE workspace_id = ?1",
            [&input.workspace_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO MILESTONES (
               milestone_id, workspace_id, name, display_order
             ) VALUES (?1, ?2, ?3, ?4)",
            params![input.milestone_id, input.workspace_id, name, display_order],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO MILESTONE_ORDER (
               workspace_id, milestone_id, display_order
             ) VALUES (?1, ?2, ?3)",
            params![input.workspace_id, input.milestone_id, display_order],
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    find_by_id(connection, &input.milestone_id)?
        .ok_or_else(|| "The created Milestone could not be retrieved".into())
}

pub fn list(connection: &Connection, workspace_id: &str) -> Result<Vec<Milestone>, String> {
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS}
             FROM MILESTONES m
             JOIN MILESTONE_ORDER o
               ON o.workspace_id = m.workspace_id
              AND o.milestone_id = m.milestone_id
             WHERE m.workspace_id = ?1
             ORDER BY o.display_order, m.milestone_id"
        ))
        .map_err(|error| error.to_string())?;
    let milestones = statement
        .query_map([workspace_id], map_milestone)
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(milestones)
}

pub fn update(
    connection: &Connection,
    milestone_id: &str,
    name: &str,
) -> Result<Option<Milestone>, String> {
    let name = validate_name(name)?;
    let workspace_id: Option<String> = connection
        .query_row(
            "SELECT workspace_id FROM MILESTONES WHERE milestone_id = ?1",
            [milestone_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some(workspace_id) = workspace_id else {
        return Ok(None);
    };
    if duplicate_name(connection, &workspace_id, name, Some(milestone_id))? {
        return Err("A Milestone with the same name already exists".into());
    }
    connection
        .execute(
            "UPDATE MILESTONES
             SET name = ?1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE milestone_id = ?2",
            params![name, milestone_id],
        )
        .map_err(|error| error.to_string())?;
    find_by_id(connection, milestone_id)
}

fn set_order(
    transaction: &Transaction<'_>,
    workspace_id: &str,
    milestone_ids: &[String],
) -> Result<(), String> {
    let temporary_base: i64 = transaction
        .query_row(
            "SELECT COALESCE(MAX(display_order), -1) + 1
             FROM MILESTONE_ORDER WHERE workspace_id = ?1",
            [workspace_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    for (index, milestone_id) in milestone_ids.iter().enumerate() {
        let temporary_order = temporary_base + index as i64;
        transaction
            .execute(
                "UPDATE MILESTONE_ORDER
                 SET display_order = ?1,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE workspace_id = ?2 AND milestone_id = ?3",
                params![temporary_order, workspace_id, milestone_id],
            )
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "UPDATE MILESTONES
                 SET display_order = ?1
                 WHERE workspace_id = ?2 AND milestone_id = ?3",
                params![temporary_order, workspace_id, milestone_id],
            )
            .map_err(|error| error.to_string())?;
    }
    for (index, milestone_id) in milestone_ids.iter().enumerate() {
        transaction
            .execute(
                "UPDATE MILESTONE_ORDER
                 SET display_order = ?1,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE workspace_id = ?2 AND milestone_id = ?3",
                params![index as i64, workspace_id, milestone_id],
            )
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "UPDATE MILESTONES
                 SET display_order = ?1,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE workspace_id = ?2 AND milestone_id = ?3",
                params![index as i64, workspace_id, milestone_id],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn reorder(
    connection: &mut Connection,
    workspace_id: &str,
    milestone_ids: Vec<String>,
) -> Result<Vec<Milestone>, String> {
    let existing = list(connection, workspace_id)?;
    let existing_ids: HashSet<_> = existing
        .iter()
        .map(|item| item.milestone_id.clone())
        .collect();
    let supplied_ids: HashSet<_> = milestone_ids.iter().cloned().collect();
    if existing_ids != supplied_ids || supplied_ids.len() != milestone_ids.len() {
        return Err("milestoneIds must contain every Milestone exactly once".into());
    }
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    set_order(&transaction, workspace_id, &milestone_ids)?;
    transaction.commit().map_err(|error| error.to_string())?;
    list(connection, workspace_id)
}

pub fn delete(connection: &mut Connection, milestone_id: &str) -> Result<bool, String> {
    let milestone: Option<(String, String)> = connection
        .query_row(
            "SELECT workspace_id, name
             FROM MILESTONES WHERE milestone_id = ?1",
            [milestone_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some((workspace_id, _)) = milestone else {
        return Ok(false);
    };
    let fallback_id: Option<String> = connection
        .query_row(
            "SELECT m.milestone_id
             FROM MILESTONES m
             JOIN MILESTONE_ORDER o
               ON o.workspace_id = m.workspace_id
              AND o.milestone_id = m.milestone_id
             WHERE m.workspace_id = ?1 AND m.milestone_id <> ?2
             ORDER BY o.display_order
             LIMIT 1",
            params![workspace_id, milestone_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let Some(fallback_id) = fallback_id else {
        return Err("Keep at least one Milestone".into());
    };

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "UPDATE TASKS SET milestone_id = ?1 WHERE milestone_id = ?2",
            params![fallback_id, milestone_id],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "DELETE FROM MILESTONES WHERE milestone_id = ?1",
            [milestone_id],
        )
        .map_err(|error| error.to_string())?;
    let remaining_ids = {
        let mut statement = transaction
            .prepare(
                "SELECT milestone_id FROM MILESTONE_ORDER
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
pub fn create_milestone(
    database: tauri::State<'_, Database>,
    input: CreateMilestone,
) -> Result<Milestone, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn list_milestones(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<Milestone>, String> {
    with_connection(&database, |connection| list(connection, &workspace_id))
}

#[tauri::command]
pub fn update_milestone(
    database: tauri::State<'_, Database>,
    milestone_id: String,
    name: String,
) -> Result<Option<Milestone>, String> {
    with_connection(&database, |connection| {
        update(connection, &milestone_id, &name)
    })
}

#[tauri::command]
pub fn reorder_milestones(
    database: tauri::State<'_, Database>,
    workspace_id: String,
    milestone_ids: Vec<String>,
) -> Result<Vec<Milestone>, String> {
    with_connection(&database, |connection| {
        reorder(connection, &workspace_id, milestone_ids)
    })
}

#[tauri::command]
pub fn delete_milestone(
    database: tauri::State<'_, Database>,
    milestone_id: String,
) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &milestone_id))
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
    fn milestone_crud_and_reorder_work() {
        let mut connection = connection();
        for (id, name) in [("m-1", "One"), ("m-2", "Two"), ("m-3", "Three")] {
            create(
                &mut connection,
                CreateMilestone {
                    milestone_id: id.into(),
                    workspace_id: "workspace-1".into(),
                    name: name.into(),
                },
            )
            .unwrap();
        }
        assert_eq!(
            list(&connection, "workspace-1").unwrap()[2].display_order,
            2
        );
        assert_eq!(
            update(&connection, "m-1", "First").unwrap().unwrap().name,
            "First"
        );
        let reordered = reorder(
            &mut connection,
            "workspace-1",
            vec!["m-3".into(), "m-1".into(), "m-2".into()],
        )
        .unwrap();
        assert_eq!(reordered[0].milestone_id, "m-3");
        assert!(delete(&mut connection, "m-2").unwrap());
        assert_eq!(list(&connection, "workspace-1").unwrap().len(), 2);
    }

    #[test]
    fn rejects_duplicate_names_and_incomplete_order() {
        let mut connection = connection();
        create(
            &mut connection,
            CreateMilestone {
                milestone_id: "m-1".into(),
                workspace_id: "workspace-1".into(),
                name: "Phase".into(),
            },
        )
        .unwrap();
        assert!(create(
            &mut connection,
            CreateMilestone {
                milestone_id: "m-2".into(),
                workspace_id: "workspace-1".into(),
                name: "phase".into(),
            },
        )
        .is_err());
        assert!(reorder(&mut connection, "workspace-1", vec![]).is_err());
    }
}
