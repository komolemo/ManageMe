use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

pub struct Database(pub Mutex<Connection>);

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub workspace_id: String,
    pub workspace_key: String,
    pub workspace_type: u8,
    pub name: String,
    pub description: String,
    pub icon_id: Option<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspace {
    pub workspace_id: String,
    pub workspace_key: String,
    pub workspace_type: u8,
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub icon_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspace {
    pub name: String,
    pub description: String,
    pub icon_id: Option<String>,
    pub is_favorite: bool,
}

fn validate_type(value: u8) -> Result<(), String> {
    match value {
        0 | 1 => Ok(()),
        _ => Err("workspaceType は 0（Project）または 1（Document）を指定してください".into()),
    }
}

fn validate_required(label: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{label} は必須です"))
    } else {
        Ok(())
    }
}

fn map_workspace(row: &rusqlite::Row<'_>) -> rusqlite::Result<Workspace> {
    Ok(Workspace {
        workspace_id: row.get(0)?,
        workspace_key: row.get(1)?,
        workspace_type: row.get(2)?,
        name: row.get(3)?,
        description: row.get(4)?,
        icon_id: row.get(5)?,
        is_favorite: row.get::<_, i64>(6)? != 0,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

const SELECT_COLUMNS: &str =
    "workspace_id, workspace_key, workspace_type, name, description, icon_id, \
     is_favorite, created_at, updated_at";

fn table_exists(connection: &Connection, table_name: &str) -> Result<bool, String> {
    connection
        .query_row(
            "SELECT EXISTS(
               SELECT 1 FROM sqlite_master
               WHERE type = 'table' AND name = ?1
             )",
            [table_name],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())
}

fn column_exists(
    connection: &Connection,
    table_name: &str,
    column_name: &str,
) -> Result<bool, String> {
    let mut statement = connection
        .prepare(&format!("PRAGMA table_info(\"{table_name}\")"))
        .map_err(|error| error.to_string())?;
    let columns = statement
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(columns.iter().any(|column| column == column_name))
}

fn rename_legacy_workspace_column(connection: &Connection, table_name: &str) -> Result<(), String> {
    if table_exists(connection, table_name)?
        && column_exists(connection, table_name, "workplace_id")?
        && !column_exists(connection, table_name, "workspace_id")?
    {
        connection
            .execute(
                &format!(
                    "ALTER TABLE \"{table_name}\"
                     RENAME COLUMN workplace_id TO workspace_id"
                ),
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn migrate(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "DROP TABLE IF EXISTS WORKPLACE_VIEW_SETTINGS;
             DROP TABLE IF EXISTS WORKSPACE_VIEW_SETTINGS;
             DROP TABLE IF EXISTS VIEW_SETTINGS;
             DROP TABLE IF EXISTS APP_SETTING;",
        )
        .map_err(|error| error.to_string())?;

    if table_exists(connection, "WORKPLACE")? && !table_exists(connection, "WORKSPACE")? {
        connection
            .execute("ALTER TABLE WORKPLACE RENAME TO WORKSPACE", [])
            .map_err(|error| error.to_string())?;
    }

    if !table_exists(connection, "WORKSPACE")? {
        return Ok(());
    }

    rename_legacy_workspace_column(connection, "WORKSPACE")?;
    if column_exists(connection, "WORKSPACE", "workplace_key")?
        && !column_exists(connection, "WORKSPACE", "workspace_key")?
    {
        connection
            .execute(
                "ALTER TABLE WORKSPACE
                 RENAME COLUMN workplace_key TO workspace_key",
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    if column_exists(connection, "WORKSPACE", "workplace_type")?
        && !column_exists(connection, "WORKSPACE", "workspace_type")?
    {
        connection
            .execute(
                "ALTER TABLE WORKSPACE
                 RENAME COLUMN workplace_type TO workspace_type",
                [],
            )
            .map_err(|error| error.to_string())?;
    }

    for table_name in ["BUCKETS", "MILESTONES", "DOCUMENTS", "TASK_BOARD_ORDER"] {
        rename_legacy_workspace_column(connection, table_name)?;
    }

    if !column_exists(connection, "WORKSPACE", "workspace_type")? {
        connection
            .execute(
                "ALTER TABLE WORKSPACE ADD COLUMN workspace_type
                 INTEGER NOT NULL DEFAULT 0 CHECK (workspace_type IN (0, 1))",
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    if !column_exists(connection, "WORKSPACE", "description")? {
        connection
            .execute(
                "ALTER TABLE WORKSPACE ADD COLUMN description TEXT NOT NULL DEFAULT ''",
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    if !column_exists(connection, "WORKSPACE", "deleted_at")? {
        connection
            .execute("ALTER TABLE WORKSPACE ADD COLUMN deleted_at TEXT", [])
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn create(connection: &Connection, input: CreateWorkspace) -> Result<Workspace, String> {
    validate_required("workspaceId", &input.workspace_id)?;
    validate_required("workspaceKey", &input.workspace_key)?;
    validate_required("name", &input.name)?;
    validate_type(input.workspace_type)?;

    connection
        .execute(
            "INSERT INTO WORKSPACE
             (workspace_id, workspace_key, workspace_type, name, description, icon_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                input.workspace_id,
                input.workspace_key,
                input.workspace_type,
                input.name.trim(),
                input.description,
                input.icon_id
            ],
        )
        .map_err(|error| error.to_string())?;

    if input.workspace_type == 0 {
        for (display_order, (slug, name, status_type)) in [
            ("not-started", "Not Started", 0),
            ("in-progress", "In Progress", 50),
            ("review", "Review", 50),
            ("completed", "Completed", 100),
            ("closed", "Closed", 100),
        ]
        .into_iter()
        .enumerate()
        {
            let bucket_id = format!("{}:bucket:{slug}", input.workspace_id);
            connection
                .execute(
                    "INSERT INTO BUCKETS (
                       bucket_id, workspace_id, name, status_type, display_order
                     ) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![
                        bucket_id,
                        input.workspace_id,
                        name,
                        status_type,
                        display_order as i64
                    ],
                )
                .map_err(|error| error.to_string())?;
            connection
                .execute(
                    "INSERT INTO BUCKET_ORDER (workspace_id, bucket_id, order_hint)
                     VALUES (?1, ?2, ?3)",
                    params![
                        input.workspace_id,
                        bucket_id,
                        format!("{display_order:020}")
                    ],
                )
                .map_err(|error| error.to_string())?;
        }
    }

    find_by_id(connection, &input.workspace_id)?
        .ok_or_else(|| "作成した Workspace を取得できませんでした".into())
}

pub fn find_by_id(connection: &Connection, id: &str) -> Result<Option<Workspace>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS} FROM WORKSPACE
                 WHERE workspace_id = ?1 AND deleted_at IS NULL"
            ),
            [id],
            map_workspace,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn find_by_key(connection: &Connection, key: &str) -> Result<Option<Workspace>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS} FROM WORKSPACE
                 WHERE workspace_key = ?1 AND deleted_at IS NULL"
            ),
            [key],
            map_workspace,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn list_by_type(connection: &Connection, workspace_type: u8) -> Result<Vec<Workspace>, String> {
    validate_type(workspace_type)?;
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM WORKSPACE
             WHERE workspace_type = ?1 AND deleted_at IS NULL
             ORDER BY updated_at DESC, workspace_id"
        ))
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([workspace_type], map_workspace)
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

pub fn update(
    connection: &Connection,
    id: &str,
    input: UpdateWorkspace,
) -> Result<Option<Workspace>, String> {
    validate_required("name", &input.name)?;
    let changed = connection
        .execute(
            "UPDATE WORKSPACE SET name = ?1, description = ?2, icon_id = ?3,
             is_favorite = ?4,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE workspace_id = ?5 AND deleted_at IS NULL",
            params![
                input.name.trim(),
                input.description,
                input.icon_id,
                input.is_favorite,
                id
            ],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, id)
}

pub fn update_favorite(
    connection: &Connection,
    id: &str,
    is_favorite: bool,
) -> Result<Option<Workspace>, String> {
    let changed = connection
        .execute(
            "UPDATE WORKSPACE SET is_favorite = ?1,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE workspace_id = ?2 AND deleted_at IS NULL",
            params![is_favorite, id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, id)
}

pub fn delete(connection: &Connection, id: &str) -> Result<bool, String> {
    connection
        .execute(
            "UPDATE WORKSPACE
             SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE workspace_id = ?1 AND workspace_type = 0
               AND deleted_at IS NULL",
            [id],
        )
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
        .map_err(|_| "DB ロックの取得に失敗しました")?;
    operation(&connection)
}

#[tauri::command]
pub fn create_workspace(
    database: tauri::State<'_, Database>,
    input: CreateWorkspace,
) -> Result<Workspace, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn get_workspace_by_id(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<Option<Workspace>, String> {
    with_connection(&database, |connection| {
        find_by_id(connection, &workspace_id)
    })
}

#[tauri::command]
pub fn get_workspace_by_key(
    database: tauri::State<'_, Database>,
    workspace_key: String,
) -> Result<Option<Workspace>, String> {
    with_connection(&database, |connection| {
        find_by_key(connection, &workspace_key)
    })
}

#[tauri::command]
pub fn list_workspaces(
    database: tauri::State<'_, Database>,
    workspace_type: u8,
) -> Result<Vec<Workspace>, String> {
    with_connection(&database, |connection| {
        list_by_type(connection, workspace_type)
    })
}

#[tauri::command]
pub fn update_workspace(
    database: tauri::State<'_, Database>,
    workspace_id: String,
    input: Option<UpdateWorkspace>,
    is_favorite: Option<bool>,
) -> Result<Option<Workspace>, String> {
    with_connection(&database, |connection| match (input, is_favorite) {
        (Some(input), None) => update(connection, &workspace_id, input),
        (None, Some(is_favorite)) => update_favorite(connection, &workspace_id, is_favorite),
        _ => Err("input または isFavorite のいずれか一方を指定してください".into()),
    })
}

#[tauri::command]
pub fn delete_workspace(
    database: tauri::State<'_, Database>,
    workspace_id: String,
) -> Result<bool, String> {
    with_connection(&database, |connection| delete(connection, &workspace_id))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn connection() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = ON;
                 CREATE TABLE WORKSPACE (
                   workspace_id TEXT PRIMARY KEY,
                   workspace_key TEXT NOT NULL UNIQUE,
                   workspace_type INTEGER NOT NULL CHECK (workspace_type IN (0, 1)),
                   name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', icon_id TEXT,
                   is_favorite INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   deleted_at TEXT
                 );
                 CREATE TABLE BUCKETS (
                   bucket_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   name TEXT NOT NULL,
                   status_type INTEGER NOT NULL CHECK (status_type IN (0, 50, 100)),
                   display_order INTEGER NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
                   UNIQUE (workspace_id, display_order)
                 );
                 CREATE TABLE BUCKET_ORDER (
                   workspace_id TEXT NOT NULL,
                   bucket_id TEXT NOT NULL,
                   order_hint TEXT NOT NULL,
                   PRIMARY KEY (workspace_id, bucket_id),
                   FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
                   FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id) ON DELETE CASCADE
                 );",
            )
            .unwrap();
        connection
    }

    #[test]
    fn crud_and_type_lists_work() {
        let connection = connection();
        let created = create(
            &connection,
            CreateWorkspace {
                workspace_id: "w1".into(),
                workspace_key: "project-one".into(),
                workspace_type: 0,
                name: "Project One".into(),
                description: "first".into(),
                icon_id: Some("kanban".into()),
            },
        )
        .unwrap();
        assert_eq!(created.name, "Project One");
        let buckets = connection
            .prepare(
                "SELECT name, status_type FROM BUCKETS
                 WHERE workspace_id = 'w1' ORDER BY display_order",
            )
            .unwrap()
            .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?)))
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap();
        assert_eq!(
            buckets,
            vec![
                ("Not Started".into(), 0),
                ("In Progress".into(), 50),
                ("Review".into(), 50),
                ("Completed".into(), 100),
                ("Closed".into(), 100),
            ]
        );
        assert_eq!(
            find_by_key(&connection, "project-one").unwrap(),
            Some(created)
        );
        assert_eq!(list_by_type(&connection, 0).unwrap().len(), 1);
        assert!(list_by_type(&connection, 1).unwrap().is_empty());

        let updated = update(
            &connection,
            "w1",
            UpdateWorkspace {
                name: "Renamed".into(),
                description: "updated".into(),
                icon_id: None,
                is_favorite: true,
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(updated.name, "Renamed");
        assert_eq!(updated.description, "updated");
        assert!(updated.is_favorite);

        let favorite_updated = update_favorite(&connection, "w1", false).unwrap().unwrap();
        assert!(!favorite_updated.is_favorite);
        assert_eq!(favorite_updated.name, "Renamed");
        assert_eq!(favorite_updated.description, "updated");

        assert!(delete(&connection, "w1").unwrap());
        assert!(find_by_id(&connection, "w1").unwrap().is_none());
        assert!(!delete(&connection, "missing").unwrap());
        let deleted_at: Option<String> = connection
            .query_row(
                "SELECT deleted_at FROM WORKSPACE WHERE workspace_id = 'w1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert!(deleted_at.is_some());
    }

    #[test]
    fn migrate_renames_legacy_workspace_columns() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE WORKPLACE (
                   workplace_id TEXT PRIMARY KEY,
                   workplace_key TEXT NOT NULL UNIQUE,
                   name TEXT NOT NULL,
                   icon_id TEXT,
                   is_favorite INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                 );
                 CREATE TABLE BUCKETS (
                   bucket_id TEXT PRIMARY KEY,
                   workplace_id TEXT NOT NULL
                 );
                 CREATE TABLE DOCUMENTS (
                   document_id TEXT PRIMARY KEY,
                   workplace_id TEXT NOT NULL
                 );
                 CREATE TABLE TASK_BOARD_ORDER (
                   workplace_id TEXT NOT NULL,
                   task_id TEXT NOT NULL
                 );
                 CREATE TABLE WORKPLACE_VIEW_SETTINGS (
                   workplace_id TEXT NOT NULL,
                   setting_key TEXT NOT NULL,
                   PRIMARY KEY (workplace_id, setting_key)
                 );
                 CREATE TABLE VIEW_SETTINGS (
                   setting_key TEXT PRIMARY KEY,
                   setting_value TEXT NOT NULL
                 );
                 CREATE TABLE APP_SETTING (
                   setting_key TEXT PRIMARY KEY,
                   setting_value TEXT NOT NULL
                 );",
            )
            .unwrap();

        migrate(&connection).unwrap();

        assert!(table_exists(&connection, "WORKSPACE").unwrap());
        assert!(!table_exists(&connection, "WORKPLACE").unwrap());
        assert!(column_exists(&connection, "WORKSPACE", "workspace_id").unwrap());
        assert!(column_exists(&connection, "WORKSPACE", "workspace_key").unwrap());
        assert!(column_exists(&connection, "WORKSPACE", "workspace_type").unwrap());
        assert!(column_exists(&connection, "WORKSPACE", "deleted_at").unwrap());
        assert!(column_exists(&connection, "BUCKETS", "workspace_id").unwrap());
        assert!(column_exists(&connection, "DOCUMENTS", "workspace_id").unwrap());
        assert!(column_exists(&connection, "TASK_BOARD_ORDER", "workspace_id").unwrap());
        assert!(!table_exists(&connection, "WORKPLACE_VIEW_SETTINGS").unwrap());
        assert!(!table_exists(&connection, "WORKSPACE_VIEW_SETTINGS").unwrap());
        assert!(!table_exists(&connection, "VIEW_SETTINGS").unwrap());
        assert!(!table_exists(&connection, "APP_SETTING").unwrap());
    }
}
