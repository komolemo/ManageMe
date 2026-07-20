use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub document_id: String,
    pub workspace_id: String,
    pub document_type: String,
    pub title: String,
    pub content: String,
    pub icon_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDocument {
    pub document_id: String,
    pub workspace_id: String,
    pub title: String,
    #[serde(default)]
    pub content: String,
    pub icon_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDocument {
    pub title: Option<String>,
    pub content: Option<String>,
    pub icon_id: Option<String>,
    pub expected_updated_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDocument {
    pub task_id: String,
    pub document_id: String,
    pub workspace_id: String,
    pub title: String,
    #[serde(default)]
    pub content: String,
    pub icon_id: Option<String>,
    pub milestone_id: String,
    pub bucket_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDocument {
    pub task_id: String,
    pub document: Document,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentTreeNode {
    pub document: Document,
    pub children: Vec<DocumentTreeNode>,
}

const SELECT_COLUMNS: &str = "document_id, workspace_id, document_type, title, \
    COALESCE(content, ''), icon_id, created_at, updated_at, deleted_at";
const NOW: &str = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

fn map_document(row: &rusqlite::Row<'_>) -> rusqlite::Result<Document> {
    Ok(Document {
        document_id: row.get(0)?,
        workspace_id: row.get(1)?,
        document_type: row.get(2)?,
        title: row.get(3)?,
        content: row.get(4)?,
        icon_id: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
        deleted_at: row.get(8)?,
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

pub fn find_by_id(
    connection: &Connection,
    document_id: &str,
    include_deleted: bool,
) -> Result<Option<Document>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS} FROM DOCUMENTS
                 WHERE document_id = ?1 AND (?2 OR deleted_at IS NULL)"
            ),
            params![document_id, include_deleted],
            map_document,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create(connection: &Connection, input: CreateDocument) -> Result<Document, String> {
    let document_id = required(&input.document_id, "documentId")?;
    let workspace_id = required(&input.workspace_id, "workspaceId")?;
    let title = required(&input.title, "title")?;
    connection
        .execute(
            "INSERT INTO DOCUMENTS (
               document_id, workspace_id, document_type, title, content, icon_id
             ) VALUES (?1, ?2, 'document', ?3, ?4, ?5)",
            params![
                document_id,
                workspace_id,
                title,
                input.content,
                input.icon_id
            ],
        )
        .map_err(|error| error.to_string())?;
    find_by_id(connection, &document_id, false)?
        .ok_or_else(|| "The created Document could not be retrieved".into())
}

pub fn list(
    connection: &Connection,
    workspace_id: &str,
    document_type: Option<&str>,
    include_deleted: bool,
) -> Result<Vec<Document>, String> {
    if document_type.is_some_and(|value| !matches!(value, "document" | "task")) {
        return Err("documentType must be document or task".into());
    }
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM DOCUMENTS
             WHERE workspace_id = ?1
               AND (?2 IS NULL OR document_type = ?2)
               AND (?3 OR deleted_at IS NULL)
             ORDER BY title COLLATE NOCASE, document_id"
        ))
        .map_err(|error| error.to_string())?;
    let documents = statement
        .query_map(
            params![workspace_id, document_type, include_deleted],
            map_document,
        )
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(documents)
}

fn ensure_updated(
    connection: &Connection,
    document_id: &str,
    expected_updated_at: Option<&str>,
    changed: usize,
) -> Result<Option<Document>, String> {
    if changed > 0 {
        return find_by_id(connection, document_id, false);
    }
    if find_by_id(connection, document_id, false)?.is_some() && expected_updated_at.is_some() {
        return Err("Document update conflict".into());
    }
    Ok(None)
}

pub fn update_title(
    connection: &Connection,
    document_id: &str,
    title: &str,
    expected_updated_at: Option<&str>,
) -> Result<Option<Document>, String> {
    let title = required(title, "title")?;
    let changed = connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS SET title = ?1, updated_at = {NOW}
                 WHERE document_id = ?2 AND deleted_at IS NULL
                   AND (?3 IS NULL OR updated_at = ?3)"
            ),
            params![title, document_id, expected_updated_at],
        )
        .map_err(|error| error.to_string())?;
    ensure_updated(connection, document_id, expected_updated_at, changed)
}

pub fn update_content(
    connection: &Connection,
    document_id: &str,
    content: &str,
    expected_updated_at: Option<&str>,
) -> Result<Option<Document>, String> {
    let changed = connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS SET content = ?1, updated_at = {NOW}
                 WHERE document_id = ?2 AND deleted_at IS NULL
                   AND (?3 IS NULL OR updated_at = ?3)"
            ),
            params![content, document_id, expected_updated_at],
        )
        .map_err(|error| error.to_string())?;
    ensure_updated(connection, document_id, expected_updated_at, changed)
}

pub fn update_icon(
    connection: &Connection,
    document_id: &str,
    icon_id: Option<&str>,
    expected_updated_at: Option<&str>,
) -> Result<Option<Document>, String> {
    let changed = connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS SET icon_id = ?1, updated_at = {NOW}
                 WHERE document_id = ?2 AND deleted_at IS NULL
                   AND (?3 IS NULL OR updated_at = ?3)"
            ),
            params![icon_id, document_id, expected_updated_at],
        )
        .map_err(|error| error.to_string())?;
    ensure_updated(connection, document_id, expected_updated_at, changed)
}

pub fn update(
    connection: &Connection,
    document_id: &str,
    input: UpdateDocument,
) -> Result<Option<Document>, String> {
    if input.title.is_none() && input.content.is_none() && input.icon_id.is_none() {
        return find_by_id(connection, document_id, false);
    }
    let title = input
        .title
        .as_deref()
        .map(|value| required(value, "title"))
        .transpose()?;
    let changed = connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS
                 SET title = COALESCE(?1, title),
                     content = COALESCE(?2, content),
                     icon_id = COALESCE(?3, icon_id),
                     updated_at = {NOW}
                 WHERE document_id = ?4 AND deleted_at IS NULL
                   AND (?5 IS NULL OR updated_at = ?5)"
            ),
            params![
                title,
                input.content,
                input.icon_id,
                document_id,
                input.expected_updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    ensure_updated(
        connection,
        document_id,
        input.expected_updated_at.as_deref(),
        changed,
    )
}

pub fn delete(connection: &Connection, document_id: &str) -> Result<bool, String> {
    connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS SET deleted_at = {NOW}, updated_at = {NOW}
                 WHERE document_id = ?1 AND deleted_at IS NULL"
            ),
            [document_id],
        )
        .map(|changed| changed > 0)
        .map_err(|error| error.to_string())
}

pub fn restore(connection: &Connection, document_id: &str) -> Result<Option<Document>, String> {
    let changed = connection
        .execute(
            &format!(
                "UPDATE DOCUMENTS SET deleted_at = NULL, updated_at = {NOW}
                 WHERE document_id = ?1 AND deleted_at IS NOT NULL"
            ),
            [document_id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, document_id, false)
}

pub fn create_task(
    connection: &mut Connection,
    input: CreateTaskDocument,
) -> Result<TaskDocument, String> {
    let task_id = required(&input.task_id, "taskId")?;
    let document_id = required(&input.document_id, "documentId")?;
    let workspace_id = required(&input.workspace_id, "workspaceId")?;
    let title = required(&input.title, "title")?;
    let milestone_id = required(&input.milestone_id, "milestoneId")?;
    let bucket_id = required(&input.bucket_id, "bucketId")?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO DOCUMENTS (
               document_id, workspace_id, document_type, title, content, icon_id
             ) VALUES (?1, ?2, 'task', ?3, ?4, ?5)",
            params![
                document_id,
                workspace_id,
                title,
                input.content,
                input.icon_id
            ],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO TASKS (
               task_id, document_id, milestone_id, bucket_id
             ) VALUES (?1, ?2, ?3, ?4)",
            params![task_id, document_id, milestone_id, bucket_id],
        )
        .map_err(|error| error.to_string())?;
    let document = find_by_id(&transaction, &document_id, false)?
        .ok_or_else(|| "The created Task Document could not be retrieved".to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(TaskDocument { task_id, document })
}

fn build_tree_node(
    document_id: &str,
    documents: &HashMap<String, Document>,
    children: &HashMap<String, Vec<String>>,
    visited: &mut HashSet<String>,
) -> Option<DocumentTreeNode> {
    if !visited.insert(document_id.to_owned()) {
        return None;
    }
    let document = documents.get(document_id)?.clone();
    let child_nodes = children
        .get(document_id)
        .into_iter()
        .flatten()
        .filter_map(|child_id| build_tree_node(child_id, documents, children, visited))
        .collect();
    Some(DocumentTreeNode {
        document,
        children: child_nodes,
    })
}

pub fn tree(connection: &Connection, workspace_id: &str) -> Result<Vec<DocumentTreeNode>, String> {
    let documents = list(connection, workspace_id, None, false)?;
    let document_map: HashMap<_, _> = documents
        .into_iter()
        .map(|document| (document.document_id.clone(), document))
        .collect();
    let mut statement = connection
        .prepare(
            "SELECT relation.parent_document_id, relation.child_document_id
             FROM DOCUMENT_RELATIVE_BIND relation
             JOIN DOCUMENTS parent
               ON parent.document_id = relation.parent_document_id
             JOIN DOCUMENTS child
               ON child.document_id = relation.child_document_id
             WHERE parent.workspace_id = ?1 AND child.workspace_id = ?1
               AND parent.deleted_at IS NULL AND child.deleted_at IS NULL
             ORDER BY relation.parent_document_id, relation.display_order",
        )
        .map_err(|error| error.to_string())?;
    let relations = statement
        .query_map([workspace_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    let child_ids: HashSet<_> = relations.iter().map(|(_, child)| child.clone()).collect();
    let mut children: HashMap<String, Vec<String>> = HashMap::new();
    for (parent, child) in relations {
        children.entry(parent).or_default().push(child);
    }
    let mut root_ids: Vec<_> = document_map
        .keys()
        .filter(|id| !child_ids.contains(*id))
        .cloned()
        .collect();
    root_ids.sort_by(|left, right| {
        document_map[left]
            .title
            .to_lowercase()
            .cmp(&document_map[right].title.to_lowercase())
    });
    let mut visited = HashSet::new();
    Ok(root_ids
        .iter()
        .filter_map(|id| build_tree_node(id, &document_map, &children, &mut visited))
        .collect())
}

pub fn move_to_parent(
    connection: &mut Connection,
    child_document_id: &str,
    parent_document_id: Option<&str>,
    display_order: Option<i64>,
) -> Result<bool, String> {
    if parent_document_id == Some(child_document_id) {
        return Err("A Document cannot be its own parent".into());
    }
    let child = find_by_id(connection, child_document_id, false)?
        .ok_or_else(|| "Child Document was not found".to_string())?;
    if let Some(parent_id) = parent_document_id {
        let parent = find_by_id(connection, parent_id, false)?
            .ok_or_else(|| "Parent Document was not found".to_string())?;
        if parent.workspace_id != child.workspace_id {
            return Err("Parent and child Documents must be in the same Workspace".into());
        }
        let creates_cycle: bool = connection
            .query_row(
                "WITH RECURSIVE descendants(document_id) AS (
                   SELECT child_document_id FROM DOCUMENT_RELATIVE_BIND
                   WHERE parent_document_id = ?1
                   UNION ALL
                   SELECT relation.child_document_id
                   FROM DOCUMENT_RELATIVE_BIND relation
                   JOIN descendants
                     ON relation.parent_document_id = descendants.document_id
                 )
                 SELECT EXISTS(
                   SELECT 1 FROM descendants WHERE document_id = ?2
                 )",
                params![child_document_id, parent_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;
        if creates_cycle {
            return Err("The Document move would create a cycle".into());
        }
    }

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "DELETE FROM DOCUMENT_RELATIVE_BIND WHERE child_document_id = ?1",
            [child_document_id],
        )
        .map_err(|error| error.to_string())?;
    if let Some(parent_id) = parent_document_id {
        let order = match display_order {
            Some(value) if value >= 0 => value,
            Some(_) => return Err("displayOrder must be zero or greater".into()),
            None => transaction
                .query_row(
                    "SELECT COALESCE(MAX(display_order) + 1, 0)
                     FROM DOCUMENT_RELATIVE_BIND
                     WHERE parent_document_id = ?1",
                    [parent_id],
                    |row| row.get(0),
                )
                .map_err(|error| error.to_string())?,
        };
        transaction
            .execute(
                "INSERT INTO DOCUMENT_RELATIVE_BIND (
                   parent_document_id, child_document_id, display_order
                 ) VALUES (?1, ?2, ?3)",
                params![parent_id, child_document_id, order],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(true)
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

fn with_mut_connection<T>(
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
pub fn create_document(
    database: tauri::State<'_, Database>,
    input: CreateDocument,
) -> Result<Document, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn get_document_by_id(
    database: tauri::State<'_, Database>,
    document_id: String,
    include_deleted: Option<bool>,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| {
        find_by_id(connection, &document_id, include_deleted.unwrap_or(false))
    })
}

#[tauri::command]
pub fn list_documents(
    database: tauri::State<'_, Database>,
    workspace_id: String,
    document_type: Option<String>,
    include_deleted: Option<bool>,
) -> Result<Vec<Document>, String> {
    with_connection(&database, |connection| {
        list(
            connection,
            &workspace_id,
            document_type.as_deref(),
            include_deleted.unwrap_or(false),
        )
    })
}

#[tauri::command]
pub fn update_document_title(
    database: tauri::State<'_, Database>,
    document_id: String,
    title: String,
    expected_updated_at: Option<String>,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| {
        update_title(
            connection,
            &document_id,
            &title,
            expected_updated_at.as_deref(),
        )
    })
}

#[tauri::command]
pub fn update_document_content(
    database: tauri::State<'_, Database>,
    document_id: String,
    content: String,
    expected_updated_at: Option<String>,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| {
        update_content(
            connection,
            &document_id,
            &content,
            expected_updated_at.as_deref(),
        )
    })
}

#[tauri::command]
pub fn update_document(
    database: tauri::State<'_, Database>,
    document_id: String,
    input: UpdateDocument,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| {
        update(connection, &document_id, input)
    })
}

#[tauri::command]
pub fn update_document_icon(
    database: tauri::State<'_, Database>,
    document_id: String,
    icon_id: Option<String>,
    expected_updated_at: Option<String>,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| {
        update_icon(
            connection,
            &document_id,
            icon_id.as_deref(),
            expected_updated_at.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_document(
    database: tauri::State<'_, Database>,
    document_id: String,
) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &document_id))
}

#[tauri::command]
pub fn restore_document(
    database: tauri::State<'_, Database>,
    document_id: String,
) -> Result<Option<Document>, String> {
    with_connection(&database, |connection| restore(connection, &document_id))
}

#[tauri::command]
pub fn create_task_document(
    database: tauri::State<'_, Database>,
    input: CreateTaskDocument,
) -> Result<TaskDocument, String> {
    with_mut_connection(&database, |connection| create_task(connection, input))
}

#[tauri::command]
pub fn list_document_tree(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<DocumentTreeNode>, String> {
    with_connection(&database, |connection| tree(connection, &workspace_id))
}

#[tauri::command]
pub fn move_document(
    database: tauri::State<'_, Database>,
    child_document_id: String,
    parent_document_id: Option<String>,
    display_order: Option<i64>,
) -> Result<bool, String> {
    with_mut_connection(&database, |connection| {
        move_to_parent(
            connection,
            &child_document_id,
            parent_document_id.as_deref(),
            display_order,
        )
    })
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
                 ) VALUES ('workspace-1', 'library-1', 1, 'Library')",
                [],
            )
            .unwrap();
        connection
    }

    fn input() -> CreateDocument {
        CreateDocument {
            document_id: "document-1".into(),
            workspace_id: "workspace-1".into(),
            title: "Document".into(),
            content: "Initial".into(),
            icon_id: Some("document".into()),
        }
    }

    #[test]
    fn document_crud_and_logical_deletion_work() {
        let connection = connection();
        let created = create(&connection, input()).unwrap();
        assert_eq!(created.document_type, "document");
        assert_eq!(
            list(&connection, "workspace-1", Some("document"), false)
                .unwrap()
                .len(),
            1
        );
        let updated = update_content(
            &connection,
            "document-1",
            "Updated",
            Some(&created.updated_at),
        )
        .unwrap()
        .unwrap();
        assert_eq!(updated.content, "Updated");
        assert!(update_title(
            &connection,
            "document-1",
            "Stale",
            Some(&created.updated_at)
        )
        .is_err());
        assert!(delete(&connection, "document-1").unwrap());
        assert!(find_by_id(&connection, "document-1", false)
            .unwrap()
            .is_none());
        assert!(restore(&connection, "document-1").unwrap().is_some());
    }

    #[test]
    fn bulk_update_only_changes_supplied_fields() {
        let connection = connection();
        let created = create(&connection, input()).unwrap();
        let updated = update(
            &connection,
            "document-1",
            UpdateDocument {
                title: Some("Renamed".into()),
                content: None,
                icon_id: None,
                expected_updated_at: Some(created.updated_at),
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(updated.title, "Renamed");
        assert_eq!(updated.content, "Initial");
        assert_eq!(updated.icon_id.as_deref(), Some("document"));
    }

    #[test]
    fn task_creation_tree_and_move_work() {
        let mut connection = connection();
        connection
            .execute(
                "INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name, display_order
                 ) VALUES ('milestone-1', 'workspace-1', 'Milestone', 0)",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO BUCKETS (
                   bucket_id, workspace_id, name, status_type, display_order
                 ) VALUES ('bucket-1', 'workspace-1', 'Bucket', 0, 0)",
                [],
            )
            .unwrap();
        create(&connection, input()).unwrap();
        create(
            &connection,
            CreateDocument {
                document_id: "document-2".into(),
                workspace_id: "workspace-1".into(),
                title: "Child".into(),
                content: String::new(),
                icon_id: None,
            },
        )
        .unwrap();
        assert!(move_to_parent(&mut connection, "document-2", Some("document-1"), None).unwrap());
        let roots = tree(&connection, "workspace-1").unwrap();
        assert_eq!(roots.len(), 1);
        assert_eq!(roots[0].children.len(), 1);
        assert!(move_to_parent(&mut connection, "document-1", Some("document-2"), None).is_err());

        let task = create_task(
            &mut connection,
            CreateTaskDocument {
                task_id: "task-1".into(),
                document_id: "task-document-1".into(),
                workspace_id: "workspace-1".into(),
                title: "Task".into(),
                content: String::new(),
                icon_id: None,
                milestone_id: "milestone-1".into(),
                bucket_id: "bucket-1".into(),
            },
        )
        .unwrap();
        assert_eq!(task.document.document_type, "task");
    }
}
