use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub task_id: String,
    pub workspace_id: String,
    pub title: String,
    pub description: String,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub status_id: i64,
    pub priority_id: i64,
    pub complete_percentage: i64,
    pub milestone_id: String,
    pub bucket_id: String,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
    pub parent_task_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTask {
    pub task_id: String,
    pub workspace_id: String,
    pub title: String,
    #[serde(default)]
    pub description: String,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub status_id: Option<i64>,
    #[serde(default)]
    pub priority_id: i64,
    #[serde(default)]
    pub complete_percentage: i64,
    pub milestone_id: String,
    pub bucket_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTask {
    pub title: Option<String>,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub priority_id: Option<i64>,
    pub milestone_id: Option<String>,
    pub expected_updated_at: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchTasks {
    pub workspace_id: String,
    pub query: Option<String>,
    pub status_id: Option<i64>,
    pub priority_id: Option<i64>,
    pub milestone_id: Option<String>,
    pub bucket_id: Option<String>,
    pub complete_percentage: Option<i64>,
    pub start_date_from: Option<String>,
    pub due_date_to: Option<String>,
    pub include_deleted: Option<bool>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

const SELECT_COLUMNS: &str = "task_id, workspace_id, title, description, start_date, \
    due_date, status_id, priority_id, complete_percentage, milestone_id, bucket_id, \
    created_at, updated_at, deleted_at, (SELECT relation.parent_task_id \
    FROM TASK_RELATIVE_BIND relation WHERE relation.child_task_id = TASKS.task_id)";

fn map_task(row: &rusqlite::Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        task_id: row.get(0)?,
        workspace_id: row.get(1)?,
        title: row.get(2)?,
        description: row.get(3)?,
        start_date: row.get(4)?,
        due_date: row.get(5)?,
        status_id: row.get(6)?,
        priority_id: row.get(7)?,
        complete_percentage: row.get(8)?,
        milestone_id: row.get(9)?,
        bucket_id: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
        deleted_at: row.get(13)?,
        parent_task_id: row.get(14)?,
    })
}

fn required(value: &str, field: &str) -> Result<String, String> {
    let value = value.trim();
    if value.is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(value.to_owned())
    }
}

fn validate_status(status_id: i64) -> Result<(), String> {
    if [0, 50, 100].contains(&status_id) {
        Ok(())
    } else {
        Err("statusId must be 0, 50, or 100".into())
    }
}

fn validate_priority(priority_id: i64) -> Result<(), String> {
    if (0..=3).contains(&priority_id) {
        Ok(())
    } else {
        Err("priorityId must be between 0 and 3".into())
    }
}

fn validate_completion(complete_percentage: i64) -> Result<(), String> {
    if (0..=100).contains(&complete_percentage) {
        Ok(())
    } else {
        Err("completePercentage must be between 0 and 100".into())
    }
}

fn validate_dates(start_date: Option<&str>, due_date: Option<&str>) -> Result<(), String> {
    if let (Some(start), Some(due)) = (start_date, due_date) {
        if !start.is_empty() && !due.is_empty() && start > due {
            return Err("startDate must not be later than dueDate".into());
        }
    }
    Ok(())
}

fn find_bucket(
    connection: &Connection,
    workspace_id: &str,
    bucket_id: &str,
) -> Result<Option<i64>, String> {
    connection
        .query_row(
            "SELECT status_type FROM BUCKETS
             WHERE workspace_id = ?1 AND bucket_id = ?2",
            params![workspace_id, bucket_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())
}

fn first_bucket_for_status(
    connection: &Connection,
    workspace_id: &str,
    status_id: i64,
) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT bucket.bucket_id
             FROM BUCKETS bucket
             JOIN BUCKET_ORDER bucket_order
               ON bucket_order.workspace_id = bucket.workspace_id
              AND bucket_order.bucket_id = bucket.bucket_id
             WHERE bucket.workspace_id = ?1 AND bucket.status_type = ?2
             ORDER BY bucket_order.order_hint COLLATE BINARY, bucket.bucket_id
             LIMIT 1",
            params![workspace_id, status_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())
}

fn validate_milestone(
    connection: &Connection,
    workspace_id: &str,
    milestone_id: &str,
) -> Result<(), String> {
    let exists: bool = connection
        .query_row(
            "SELECT EXISTS(
               SELECT 1 FROM MILESTONES
               WHERE workspace_id = ?1 AND milestone_id = ?2
             )",
            params![workspace_id, milestone_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    if exists {
        Ok(())
    } else {
        Err("Milestone was not found in the Task Workspace".into())
    }
}

pub fn find_by_id(
    connection: &Connection,
    task_id: &str,
    include_deleted: bool,
) -> Result<Option<Task>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS} FROM TASKS
                 WHERE task_id = ?1 AND (?2 OR deleted_at IS NULL)"
            ),
            params![task_id, include_deleted],
            map_task,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create(connection: &mut Connection, input: CreateTask) -> Result<Task, String> {
    let task_id = required(&input.task_id, "taskId")?;
    let workspace_id = required(&input.workspace_id, "workspaceId")?;
    let title = required(&input.title, "title")?;
    let milestone_id = required(&input.milestone_id, "milestoneId")?;
    validate_priority(input.priority_id)?;
    validate_completion(input.complete_percentage)?;
    validate_dates(input.start_date.as_deref(), input.due_date.as_deref())?;

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    validate_milestone(&transaction, &workspace_id, &milestone_id)?;
    let (bucket_id, status_id) = match (input.bucket_id.as_deref(), input.status_id) {
        (Some(bucket_id), requested_status) => {
            let status = find_bucket(&transaction, &workspace_id, bucket_id)?
                .ok_or_else(|| "Bucket was not found in the Task Workspace".to_string())?;
            if requested_status.is_some_and(|value| value != status) {
                return Err("statusId does not match the Bucket statusType".into());
            }
            (bucket_id.to_owned(), status)
        }
        (None, Some(status)) => {
            validate_status(status)?;
            let bucket = first_bucket_for_status(&transaction, &workspace_id, status)?
                .ok_or_else(|| "No Bucket exists for statusId in the Task Workspace".to_string())?;
            (bucket, status)
        }
        (None, None) => {
            let bucket: Option<(String, i64)> = transaction
                .query_row(
                    "SELECT bucket.bucket_id, bucket.status_type
                     FROM BUCKETS bucket
                     JOIN BUCKET_ORDER bucket_order
                       ON bucket_order.workspace_id = bucket.workspace_id
                      AND bucket_order.bucket_id = bucket.bucket_id
                     WHERE bucket.workspace_id = ?1
                     ORDER BY bucket_order.order_hint COLLATE BINARY, bucket.bucket_id
                     LIMIT 1",
                    [&workspace_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()
                .map_err(|error| error.to_string())?;
            bucket.ok_or_else(|| "The Task Workspace has no Bucket".to_string())?
        }
    };

    transaction
        .execute(
            "INSERT INTO TASKS (
               task_id, workspace_id, title, description, start_date, due_date,
               status_id, priority_id, complete_percentage, milestone_id, bucket_id
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                task_id,
                workspace_id,
                title,
                input.description,
                input.start_date,
                input.due_date,
                status_id,
                input.priority_id,
                input.complete_percentage,
                milestone_id,
                bucket_id
            ],
        )
        .map_err(|error| error.to_string())?;
    let task = find_by_id(&transaction, &task_id, false)?
        .ok_or_else(|| "The created Task could not be retrieved".to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(task)
}

pub fn search(connection: &Connection, input: SearchTasks) -> Result<Vec<Task>, String> {
    let workspace_id = required(&input.workspace_id, "workspaceId")?;
    if let Some(value) = input.status_id {
        validate_status(value)?;
    }
    if let Some(value) = input.priority_id {
        validate_priority(value)?;
    }
    if let Some(value) = input.complete_percentage {
        validate_completion(value)?;
    }
    let escaped_query = input.query.map(|value| {
        format!(
            "%{}%",
            value
                .replace('\\', "\\\\")
                .replace('%', "\\%")
                .replace('_', "\\_")
        )
    });
    let limit = input.limit.unwrap_or(100);
    let offset = input.offset.unwrap_or(0);
    if !(1..=500).contains(&limit) || offset < 0 {
        return Err("limit must be 1-500 and offset must be zero or greater".into());
    }

    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM TASKS
             WHERE workspace_id = ?1
               AND (?2 IS NULL OR title LIKE ?2 ESCAPE '\\' COLLATE NOCASE
                 OR description LIKE ?2 ESCAPE '\\' COLLATE NOCASE)
               AND (?3 IS NULL OR status_id = ?3)
               AND (?4 IS NULL OR priority_id = ?4)
               AND (?5 IS NULL OR milestone_id = ?5)
               AND (?6 IS NULL OR bucket_id = ?6)
               AND (?7 IS NULL OR complete_percentage = ?7)
               AND (?8 IS NULL OR start_date >= ?8)
               AND (?9 IS NULL OR due_date <= ?9)
               AND (?10 OR deleted_at IS NULL)
             ORDER BY updated_at DESC, task_id
             LIMIT ?11 OFFSET ?12"
        ))
        .map_err(|error| error.to_string())?;
    let tasks = statement
        .query_map(
            params![
                workspace_id,
                escaped_query,
                input.status_id,
                input.priority_id,
                input.milestone_id,
                input.bucket_id,
                input.complete_percentage,
                input.start_date_from,
                input.due_date_to,
                input.include_deleted.unwrap_or(false),
                limit,
                offset
            ],
            map_task,
        )
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(tasks)
}

pub fn list(connection: &Connection, workspace_id: &str) -> Result<Vec<Task>, String> {
    search(
        connection,
        SearchTasks {
            workspace_id: workspace_id.to_owned(),
            ..SearchTasks::default()
        },
    )
}

pub fn update(
    connection: &Connection,
    task_id: &str,
    input: UpdateTask,
) -> Result<Option<Task>, String> {
    let current = match find_by_id(connection, task_id, false)? {
        Some(task) => task,
        None => return Ok(None),
    };
    let title = input
        .title
        .as_deref()
        .map(|value| required(value, "title"))
        .transpose()?;
    if let Some(value) = input.priority_id {
        validate_priority(value)?;
    }
    let milestone_id = input
        .milestone_id
        .as_deref()
        .unwrap_or(&current.milestone_id);
    validate_milestone(connection, &current.workspace_id, milestone_id)?;
    validate_dates(
        input
            .start_date
            .as_deref()
            .or(current.start_date.as_deref()),
        input.due_date.as_deref().or(current.due_date.as_deref()),
    )?;

    let changed = connection
        .execute(
            "UPDATE TASKS
             SET title = COALESCE(?1, title),
                 description = COALESCE(?2, description),
                 start_date = COALESCE(?3, start_date),
                 due_date = COALESCE(?4, due_date),
                 priority_id = COALESCE(?5, priority_id),
                 milestone_id = COALESCE(?6, milestone_id),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE task_id = ?7 AND deleted_at IS NULL
               AND (?8 IS NULL OR updated_at = ?8)",
            params![
                title,
                input.description,
                input.start_date,
                input.due_date,
                input.priority_id,
                input.milestone_id,
                task_id,
                input.expected_updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 && input.expected_updated_at.is_some() {
        return Err("Task update conflict".into());
    }
    find_by_id(connection, task_id, false)
}

pub fn update_bucket(
    connection: &mut Connection,
    task_id: &str,
    bucket_id: &str,
) -> Result<Option<Task>, String> {
    let task = match find_by_id(connection, task_id, false)? {
        Some(task) => task,
        None => return Ok(None),
    };
    let status_id = find_bucket(connection, &task.workspace_id, bucket_id)?
        .ok_or_else(|| "Bucket was not found in the Task Workspace".to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "UPDATE TASKS
             SET bucket_id = ?1, status_id = ?2,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE task_id = ?3 AND deleted_at IS NULL",
            params![bucket_id, status_id, task_id],
        )
        .map_err(|error| error.to_string())?;
    let updated = find_by_id(&transaction, task_id, false)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(updated)
}

pub fn update_status(
    connection: &mut Connection,
    task_id: &str,
    status_id: i64,
) -> Result<Option<Task>, String> {
    validate_status(status_id)?;
    let task = match find_by_id(connection, task_id, false)? {
        Some(task) => task,
        None => return Ok(None),
    };
    let bucket_id = first_bucket_for_status(connection, &task.workspace_id, status_id)?
        .ok_or_else(|| "No Bucket exists for statusId in the Task Workspace".to_string())?;
    update_bucket(connection, task_id, &bucket_id)
}

pub fn update_completion(
    connection: &Connection,
    task_id: &str,
    complete_percentage: i64,
) -> Result<Option<Task>, String> {
    validate_completion(complete_percentage)?;
    let changed = connection
        .execute(
            "UPDATE TASKS
             SET complete_percentage = ?1,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE task_id = ?2 AND deleted_at IS NULL",
            params![complete_percentage, task_id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, task_id, false)
}

pub fn delete(connection: &Connection, task_id: &str) -> Result<bool, String> {
    connection
        .execute("DELETE FROM TASKS WHERE task_id = ?1", [task_id])
        .map(|changed| changed > 0)
        .map_err(|error| error.to_string())
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
pub fn create_task(
    database: tauri::State<'_, Database>,
    input: CreateTask,
) -> Result<Task, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn get_task_by_id(
    database: tauri::State<'_, Database>,
    task_id: String,
    include_deleted: Option<bool>,
) -> Result<Option<Task>, String> {
    with_connection(&database, |connection| {
        find_by_id(connection, &task_id, include_deleted.unwrap_or(false))
    })
}

#[tauri::command]
pub fn list_tasks(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<Task>, String> {
    with_connection(&database, |connection| list(connection, &workspace_id))
}

#[tauri::command]
pub fn search_tasks(
    database: tauri::State<'_, Database>,
    input: SearchTasks,
) -> Result<Vec<Task>, String> {
    with_connection(&database, |connection| search(connection, input))
}

#[tauri::command]
pub fn update_task(
    database: tauri::State<'_, Database>,
    task_id: String,
    input: UpdateTask,
) -> Result<Option<Task>, String> {
    with_connection(&database, |connection| update(connection, &task_id, input))
}

#[tauri::command]
pub fn update_task_bucket(
    database: tauri::State<'_, Database>,
    task_id: String,
    bucket_id: String,
) -> Result<Option<Task>, String> {
    with_connection(&database, |connection| {
        update_bucket(connection, &task_id, &bucket_id)
    })
}

#[tauri::command]
pub fn update_task_status(
    database: tauri::State<'_, Database>,
    task_id: String,
    status_id: i64,
) -> Result<Option<Task>, String> {
    with_connection(&database, |connection| {
        update_status(connection, &task_id, status_id)
    })
}

#[tauri::command]
pub fn update_task_completion(
    database: tauri::State<'_, Database>,
    task_id: String,
    complete_percentage: i64,
) -> Result<Option<Task>, String> {
    with_connection(&database, |connection| {
        update_completion(connection, &task_id, complete_percentage)
    })
}

#[tauri::command]
pub fn delete_task(database: tauri::State<'_, Database>, task_id: String) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &task_id))
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
            .execute_batch(
                "INSERT INTO WORKSPACE (
                   workspace_id, workspace_key, workspace_type, name
                 ) VALUES ('workspace-1', 'project-1', 0, 'Project');
                 INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name, display_order
                 ) VALUES ('milestone-1', 'workspace-1', 'Milestone', 0);
                 INSERT INTO BUCKETS (
                   bucket_id, workspace_id, name, status_type, display_order
                 ) VALUES
                   ('bucket-todo', 'workspace-1', 'Todo', 0, 0),
                   ('bucket-progress-2', 'workspace-1', 'Review', 50, 1),
                   ('bucket-progress-1', 'workspace-1', 'Doing', 50, 2);
                 INSERT INTO BUCKET_ORDER (workspace_id, bucket_id, order_hint)
                 VALUES
                   ('workspace-1', 'bucket-todo', 'A'),
                   ('workspace-1', 'bucket-progress-2', 'C'),
                   ('workspace-1', 'bucket-progress-1', 'B');",
            )
            .unwrap();
        connection
    }

    fn input() -> CreateTask {
        CreateTask {
            task_id: "task-1".into(),
            workspace_id: "workspace-1".into(),
            title: "Task".into(),
            description: "Description".into(),
            start_date: Some("2026-07-01".into()),
            due_date: Some("2026-07-31".into()),
            status_id: None,
            priority_id: 2,
            complete_percentage: 0,
            milestone_id: "milestone-1".into(),
            bucket_id: Some("bucket-todo".into()),
        }
    }

    #[test]
    fn task_crud_and_search_work_without_documents() {
        let mut connection = connection();
        let created = create(&mut connection, input()).unwrap();
        assert_eq!((created.title.as_str(), created.status_id), ("Task", 0));
        assert_eq!(list(&connection, "workspace-1").unwrap().len(), 1);
        assert_eq!(
            search(
                &connection,
                SearchTasks {
                    workspace_id: "workspace-1".into(),
                    query: Some("script".into()),
                    ..SearchTasks::default()
                },
            )
            .unwrap()
            .len(),
            1
        );
        let updated = update(
            &connection,
            "task-1",
            UpdateTask {
                title: Some("Updated".into()),
                description: None,
                start_date: None,
                due_date: None,
                priority_id: Some(3),
                milestone_id: None,
                expected_updated_at: None,
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(
            (updated.title.as_str(), updated.priority_id),
            ("Updated", 3)
        );
        assert!(delete(&connection, "task-1").unwrap());
        assert!(find_by_id(&connection, "task-1", true).unwrap().is_none());
    }

    #[test]
    fn bucket_and_status_updates_stay_synchronized() {
        let mut connection = connection();
        create(&mut connection, input()).unwrap();
        let moved = update_status(&mut connection, "task-1", 50)
            .unwrap()
            .unwrap();
        assert_eq!(moved.bucket_id, "bucket-progress-1");
        assert_eq!(moved.status_id, 50);

        let moved = update_bucket(&mut connection, "task-1", "bucket-todo")
            .unwrap()
            .unwrap();
        assert_eq!(moved.status_id, 0);

        connection
            .execute(
                "UPDATE TASKS SET status_id = 50 WHERE task_id = 'task-1'",
                [],
            )
            .unwrap();
        let moved = find_by_id(&connection, "task-1", false).unwrap().unwrap();
        assert_eq!(moved.bucket_id, "bucket-progress-1");

        update_bucket(&mut connection, "task-1", "bucket-todo").unwrap();

        connection
            .execute(
                "UPDATE BUCKETS SET status_type = 100
                 WHERE bucket_id = 'bucket-todo'",
                [],
            )
            .unwrap();
        assert_eq!(
            find_by_id(&connection, "task-1", false)
                .unwrap()
                .unwrap()
                .status_id,
            100
        );
    }

    #[test]
    fn rejects_mismatched_bucket_status_and_cross_workspace_values() {
        let mut connection = connection();
        let mut mismatched = input();
        mismatched.status_id = Some(50);
        assert!(create(&mut connection, mismatched).is_err());
    }

    #[test]
    fn enforces_exclusive_document_and_task_workspaces() {
        let mut connection = connection();
        connection
            .execute(
                "INSERT INTO WORKSPACE (
                   workspace_id, workspace_key, workspace_type, name
                 ) VALUES ('document-workspace', 'documents', 1, 'Documents')",
                [],
            )
            .unwrap();

        assert!(connection
            .execute(
                "INSERT INTO DOCUMENTS (
                   document_id, workspace_id, document_type, title
                 ) VALUES ('invalid-document', 'workspace-1', 'document', 'Invalid')",
                [],
            )
            .is_err());

        assert!(connection
            .execute(
                "INSERT INTO TASKS (
                   task_id, workspace_id, title, status_id,
                   milestone_id, bucket_id
                 ) VALUES (
                   'invalid-task', 'document-workspace', 'Invalid', 0,
                   'milestone-1', 'bucket-todo'
                 )",
                [],
            )
            .is_err());

        create(&mut connection, input()).unwrap();
        assert!(connection
            .execute(
                "UPDATE TASKS SET workspace_id = 'document-workspace'
                 WHERE task_id = 'task-1'",
                [],
            )
            .is_err());
    }
}
