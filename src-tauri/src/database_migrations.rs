use rusqlite::Connection;

fn table_exists(connection: &Connection, table_name: &str) -> rusqlite::Result<bool> {
    connection.query_row(
        "SELECT EXISTS(
           SELECT 1 FROM sqlite_master
           WHERE type = 'table' AND name = ?1
         )",
        [table_name],
        |row| row.get(0),
    )
}

fn has_foreign_key_target(
    connection: &Connection,
    table_name: &str,
    target_table: &str,
) -> rusqlite::Result<bool> {
    let mut statement = connection.prepare(&format!("PRAGMA foreign_key_list({table_name})"))?;
    let targets = statement.query_map([], |row| row.get::<_, String>(2))?;
    for target in targets {
        if target?.eq_ignore_ascii_case(target_table) {
            return Ok(true);
        }
    }
    Ok(false)
}

fn column_exists(
    connection: &Connection,
    table_name: &str,
    column_name: &str,
) -> rusqlite::Result<bool> {
    let mut statement = connection.prepare(&format!("PRAGMA table_info({table_name})"))?;
    let columns = statement.query_map([], |row| row.get::<_, String>(1))?;
    for column in columns {
        if column?.eq_ignore_ascii_case(column_name) {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn add_dictionary_word_deleted_at(connection: &Connection) -> Result<(), String> {
    if table_exists(connection, "DICTIONARY_WORDS").map_err(|error| error.to_string())?
        && !column_exists(connection, "DICTIONARY_WORDS", "deleted_at")
            .map_err(|error| error.to_string())?
    {
        connection
            .execute(
                "ALTER TABLE DICTIONARY_WORDS ADD COLUMN deleted_at TEXT",
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn add_document_metadata_columns(connection: &Connection) -> Result<(), String> {
    if !table_exists(connection, "DOCUMENTS").map_err(|error| error.to_string())? {
        return Ok(());
    }
    for column in ["icon_id", "deleted_at"] {
        if !column_exists(connection, "DOCUMENTS", column).map_err(|error| error.to_string())? {
            connection
                .execute(
                    &format!("ALTER TABLE DOCUMENTS ADD COLUMN {column} TEXT"),
                    [],
                )
                .map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

pub fn add_task_description(connection: &Connection) -> Result<(), String> {
    if table_exists(connection, "TASKS").map_err(|error| error.to_string())?
        && !column_exists(connection, "TASKS", "description").map_err(|error| error.to_string())?
    {
        connection
            .execute(
                "ALTER TABLE TASKS
                 ADD COLUMN description TEXT NOT NULL DEFAULT ''",
                [],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

pub fn migrate_order_tables(connection: &mut Connection) -> Result<(), String> {
    let bucket_order_uses_integer = table_exists(connection, "BUCKET_ORDER")
        .map_err(|error| error.to_string())?
        && column_exists(connection, "BUCKET_ORDER", "display_order")
            .map_err(|error| error.to_string())?;
    let milestone_order_uses_integer = table_exists(connection, "MILESTONE_ORDER")
        .map_err(|error| error.to_string())?
        && column_exists(connection, "MILESTONE_ORDER", "display_order")
            .map_err(|error| error.to_string())?;
    let task_order_uses_integer = table_exists(connection, "TASK_BOARD_ORDER")
        .map_err(|error| error.to_string())?
        && column_exists(connection, "TASK_BOARD_ORDER", "display_order")
            .map_err(|error| error.to_string())?;

    if !bucket_order_uses_integer && !milestone_order_uses_integer && !task_order_uses_integer {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;

    if bucket_order_uses_integer {
        transaction
            .execute_batch(
                "CREATE TABLE BUCKET_ORDER_WITH_HINT (
                   workspace_id TEXT NOT NULL,
                   bucket_id TEXT NOT NULL,
                   order_hint TEXT NOT NULL COLLATE BINARY,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (workspace_id, bucket_id),
                   FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                     ON DELETE CASCADE,
                   FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id)
                     ON DELETE CASCADE
                 );
                 INSERT INTO BUCKET_ORDER_WITH_HINT (
                   workspace_id, bucket_id, order_hint, created_at, updated_at
                 )
                 SELECT
                   workspace_id, bucket_id, printf('%020d', display_order),
                   created_at, updated_at
                 FROM BUCKET_ORDER;
                 DROP TABLE BUCKET_ORDER;
                 ALTER TABLE BUCKET_ORDER_WITH_HINT RENAME TO BUCKET_ORDER;",
            )
            .map_err(|error| error.to_string())?;
    }

    if milestone_order_uses_integer {
        transaction
            .execute_batch(
                "CREATE TABLE MILESTONE_ORDER_WITH_HINT (
                   workspace_id TEXT NOT NULL,
                   milestone_id TEXT NOT NULL,
                   order_hint TEXT NOT NULL COLLATE BINARY,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (workspace_id, milestone_id),
                   FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                     ON DELETE CASCADE,
                   FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id)
                     ON DELETE CASCADE
                 );
                 INSERT INTO MILESTONE_ORDER_WITH_HINT (
                   workspace_id, milestone_id, order_hint, created_at, updated_at
                 )
                 SELECT
                   workspace_id, milestone_id, printf('%020d', display_order),
                   created_at, updated_at
                 FROM MILESTONE_ORDER;
                 DROP TABLE MILESTONE_ORDER;
                 ALTER TABLE MILESTONE_ORDER_WITH_HINT RENAME TO MILESTONE_ORDER;",
            )
            .map_err(|error| error.to_string())?;
    }

    if task_order_uses_integer {
        transaction
            .execute_batch(
                "CREATE TABLE TASK_BOARD_ORDER_WITH_HINT (
                   workspace_id TEXT NOT NULL,
                   board_group_type TEXT NOT NULL
                     CHECK (board_group_type IN ('status', 'bucket')),
                   board_group_id TEXT NOT NULL,
                   task_id TEXT NOT NULL,
                   order_hint TEXT NOT NULL COLLATE BINARY,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (
                     workspace_id, board_group_type, board_group_id, task_id
                   ),
                   FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                     ON DELETE CASCADE,
                   FOREIGN KEY (task_id) REFERENCES TASKS(task_id)
                     ON DELETE CASCADE
                 );
                 INSERT INTO TASK_BOARD_ORDER_WITH_HINT (
                   workspace_id, board_group_type, board_group_id, task_id,
                   order_hint, created_at, updated_at
                 )
                 SELECT
                   workspace_id, board_group_type, board_group_id, task_id,
                   printf('%020d', display_order), created_at, updated_at
                 FROM TASK_BOARD_ORDER;
                 DROP TABLE TASK_BOARD_ORDER;
                 ALTER TABLE TASK_BOARD_ORDER_WITH_HINT
                   RENAME TO TASK_BOARD_ORDER;",
            )
            .map_err(|error| error.to_string())?;
    }

    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| error.to_string())
}

pub fn migrate_documents_workspace_fk(connection: &mut Connection) -> Result<(), String> {
    if !table_exists(connection, "DOCUMENTS").map_err(|error| error.to_string())?
        || !has_foreign_key_target(connection, "DOCUMENTS", "WORKPLACE")
            .map_err(|error| error.to_string())?
    {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute_batch(
            "CREATE TABLE DOCUMENTS_WITH_WORKSPACE_FK (
               document_id TEXT PRIMARY KEY,
               workspace_id TEXT NOT NULL,
               document_type TEXT NOT NULL
                 CHECK (document_type IN ('task', 'document')),
               title TEXT NOT NULL,
               content TEXT,
               icon_id TEXT,
               created_at TEXT NOT NULL DEFAULT (datetime('now')),
               updated_at TEXT NOT NULL DEFAULT (datetime('now')),
               deleted_at TEXT,
               FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                 ON DELETE CASCADE
             );
             INSERT INTO DOCUMENTS_WITH_WORKSPACE_FK (
               document_id, workspace_id, document_type, title, content,
               icon_id, created_at, updated_at, deleted_at
             )
             SELECT
               document_id, workspace_id, document_type, title, content,
               icon_id, created_at, updated_at, deleted_at
             FROM DOCUMENTS;
             DROP TABLE DOCUMENTS;
             ALTER TABLE DOCUMENTS_WITH_WORKSPACE_FK RENAME TO DOCUMENTS;",
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| error.to_string())
}

pub fn migrate_milestones_workspace_fk(connection: &mut Connection) -> Result<(), String> {
    if !table_exists(connection, "MILESTONES").map_err(|error| error.to_string())?
        || !has_foreign_key_target(connection, "MILESTONES", "WORKPLACE")
            .map_err(|error| error.to_string())?
    {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute_batch(
            "CREATE TABLE MILESTONES_WITH_WORKSPACE_FK (
               milestone_id TEXT PRIMARY KEY,
               workspace_id TEXT NOT NULL,
               name TEXT NOT NULL,
               display_order INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL DEFAULT (datetime('now')),
               updated_at TEXT NOT NULL DEFAULT (datetime('now')),
               FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                 ON DELETE CASCADE,
               UNIQUE (workspace_id, display_order)
             );
             INSERT INTO MILESTONES_WITH_WORKSPACE_FK (
               milestone_id, workspace_id, name, display_order,
               created_at, updated_at
             )
             SELECT
               milestone_id, workspace_id, name, display_order,
               created_at, updated_at
             FROM MILESTONES;
             DROP TABLE MILESTONES;
             ALTER TABLE MILESTONES_WITH_WORKSPACE_FK RENAME TO MILESTONES;",
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| error.to_string())
}

pub fn migrate_buckets_workspace_fk(connection: &mut Connection) -> Result<(), String> {
    if !table_exists(connection, "BUCKETS").map_err(|error| error.to_string())?
        || !has_foreign_key_target(connection, "BUCKETS", "WORKPLACE")
            .map_err(|error| error.to_string())?
    {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute_batch(
            "CREATE TABLE BUCKETS_WITH_WORKSPACE_FK (
               bucket_id TEXT PRIMARY KEY,
               workspace_id TEXT NOT NULL,
               name TEXT NOT NULL,
               status_type INTEGER NOT NULL CHECK (status_type IN (0, 50, 100)),
               display_order INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL DEFAULT (datetime('now')),
               updated_at TEXT NOT NULL DEFAULT (datetime('now')),
               FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id)
                 ON DELETE CASCADE,
               UNIQUE (workspace_id, display_order)
             );
             INSERT INTO BUCKETS_WITH_WORKSPACE_FK (
               bucket_id, workspace_id, name, status_type, display_order,
               created_at, updated_at
             )
             SELECT
               bucket_id, workspace_id, name, status_type, display_order,
               created_at, updated_at
             FROM BUCKETS;
             DROP TABLE BUCKETS;
             ALTER TABLE BUCKETS_WITH_WORKSPACE_FK RENAME TO BUCKETS;",
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| error.to_string())
}

pub fn remove_task_priority_master(connection: &mut Connection) -> Result<(), String> {
    let master_exists =
        table_exists(connection, "MASTER_TASK_PRIORITY").map_err(|error| error.to_string())?;
    let tasks_exist = table_exists(connection, "TASKS").map_err(|error| error.to_string())?;
    let tasks_reference_master = tasks_exist
        && has_foreign_key_target(connection, "TASKS", "MASTER_TASK_PRIORITY")
            .map_err(|error| error.to_string())?;
    if !master_exists && !tasks_reference_master {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    if tasks_reference_master {
        transaction
            .execute_batch(
                "CREATE TABLE TASKS_WITH_FIXED_PRIORITY (
                   task_id TEXT PRIMARY KEY,
                   document_id TEXT NOT NULL UNIQUE,
                   start_date TEXT,
                   due_date TEXT,
                   status_id TEXT,
                   priority_id INTEGER NOT NULL DEFAULT 0
                     CHECK(priority_id IN (0, 1, 2, 3)),
                   complete_percentage INTEGER NOT NULL DEFAULT 0
                     CHECK(complete_percentage >= 0 AND complete_percentage <= 100),
                   milestone_id TEXT NOT NULL DEFAULT '0',
                   bucket_id TEXT NOT NULL DEFAULT '0',
                   display_order INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id)
                     ON DELETE CASCADE,
                   FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id),
                   FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id)
                 );
                 INSERT INTO TASKS_WITH_FIXED_PRIORITY (
                   task_id, document_id, start_date, due_date, status_id,
                   priority_id, complete_percentage, milestone_id, bucket_id,
                   display_order, created_at, updated_at
                 )
                 SELECT
                   task_id, document_id, start_date, due_date, status_id,
                   priority_id, complete_percentage, milestone_id, bucket_id,
                   display_order, created_at, updated_at
                 FROM TASKS;
                 DROP TABLE TASKS;
                 ALTER TABLE TASKS_WITH_FIXED_PRIORITY RENAME TO TASKS;",
            )
            .map_err(|error| error.to_string())?;
    }
    if master_exists {
        transaction
            .execute("DROP TABLE MASTER_TASK_PRIORITY", [])
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| error.to_string())
}

pub fn remove_tag_colors_table(connection: &mut Connection) -> Result<(), String> {
    if !table_exists(connection, "TAG_COLORS").map_err(|error| error.to_string())? {
        return Ok(());
    }

    connection
        .execute_batch("PRAGMA foreign_keys = OFF;")
        .map_err(|error| error.to_string())?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    if table_exists(&transaction, "TAGS").map_err(|error| error.to_string())? {
        transaction
            .execute_batch(
                "CREATE TABLE TAGS_WITHOUT_COLOR_MASTER (
                   tag_id TEXT PRIMARY KEY,
                   name TEXT NOT NULL UNIQUE,
                   color_id INTEGER,
                   description TEXT,
                   last_used_at TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                 );
                 INSERT INTO TAGS_WITHOUT_COLOR_MASTER (
                   tag_id, name, color_id, description, last_used_at,
                   created_at, updated_at
                 )
                 SELECT
                   tag_id, name, color_id, description, last_used_at,
                   created_at, updated_at
                 FROM TAGS;
                 DROP TABLE TAGS;
                 ALTER TABLE TAGS_WITHOUT_COLOR_MASTER RENAME TO TAGS;",
            )
            .map_err(|error| error.to_string())?;
    }
    transaction
        .execute("DROP TABLE TAG_COLORS", [])
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn removes_color_master_without_losing_tags() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE TAG_COLORS (
                   color_id INTEGER PRIMARY KEY,
                   name TEXT NOT NULL
                 );
                 CREATE TABLE TAGS (
                   tag_id TEXT PRIMARY KEY,
                   name TEXT NOT NULL UNIQUE,
                   color_id INTEGER,
                   description TEXT,
                   last_used_at TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (color_id) REFERENCES TAG_COLORS(color_id)
                 );
                 INSERT INTO TAG_COLORS (color_id, name) VALUES (7, 'Blue');
                 INSERT INTO TAGS (tag_id, name, color_id)
                 VALUES ('tag-1', 'backend', 7);",
            )
            .unwrap();

        remove_tag_colors_table(&mut connection).unwrap();

        assert!(!table_exists(&connection, "TAG_COLORS").unwrap());
        let tag: (String, i64) = connection
            .query_row(
                "SELECT name, color_id FROM TAGS WHERE tag_id = 'tag-1'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();
        assert_eq!(tag, ("backend".into(), 7));
        assert!(connection
            .prepare("PRAGMA foreign_key_list(TAGS)")
            .unwrap()
            .query_map([], |_| Ok(()))
            .unwrap()
            .next()
            .is_none());
    }

    #[test]
    fn creates_and_backfills_milestone_order() {
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
            .execute(
                "INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name, display_order
                 ) VALUES ('milestone-1', 'workspace-1', 'Phase 1', 3)",
                [],
            )
            .unwrap();

        connection
            .execute_batch(include_str!("../db/schema.sql"))
            .unwrap();

        let order_hint: String = connection
            .query_row(
                "SELECT order_hint
                 FROM MILESTONE_ORDER
                 WHERE workspace_id = 'workspace-1'
                   AND milestone_id = 'milestone-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(order_hint, "00000000000000000003");
    }

    #[test]
    fn creates_binary_text_order_hints_for_every_order_table() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(include_str!("../db/schema.sql"))
            .unwrap();

        for table in [
            "DOCUMENT_ORDER",
            "MILESTONE_ORDER",
            "BUCKET_ORDER",
            "TASK_BOARD_ORDER",
        ] {
            assert!(table_exists(&connection, table).unwrap());
            let (column_type, not_null): (String, bool) = connection
                .query_row(
                    &format!(
                        "SELECT type, \"notnull\"
                         FROM pragma_table_info('{table}')
                         WHERE name = 'order_hint'"
                    ),
                    [],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .unwrap();
            assert_eq!(column_type, "TEXT");
            assert!(not_null);

            let create_sql: String = connection
                .query_row(
                    "SELECT sql FROM sqlite_master
                     WHERE type = 'table' AND name = ?1",
                    [table],
                    |row| row.get(0),
                )
                .unwrap();
            assert!(create_sql.contains("order_hint TEXT NOT NULL COLLATE BINARY"));
        }
    }

    #[test]
    fn migrates_integer_order_tables_without_losing_order() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE WORKSPACE (workspace_id TEXT PRIMARY KEY);
                 CREATE TABLE BUCKETS (bucket_id TEXT PRIMARY KEY);
                 CREATE TABLE MILESTONES (milestone_id TEXT PRIMARY KEY);
                 CREATE TABLE TASKS (task_id TEXT PRIMARY KEY);
                 CREATE TABLE BUCKET_ORDER (
                   workspace_id TEXT NOT NULL,
                   bucket_id TEXT NOT NULL,
                   display_order INTEGER NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (workspace_id, bucket_id)
                 );
                 CREATE TABLE MILESTONE_ORDER (
                   workspace_id TEXT NOT NULL,
                   milestone_id TEXT NOT NULL,
                   display_order INTEGER NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (workspace_id, milestone_id)
                 );
                 CREATE TABLE TASK_BOARD_ORDER (
                   workspace_id TEXT NOT NULL,
                   board_group_type TEXT NOT NULL,
                   board_group_id TEXT NOT NULL,
                   task_id TEXT NOT NULL,
                   display_order INTEGER NOT NULL,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   PRIMARY KEY (
                     workspace_id, board_group_type, board_group_id, task_id
                   )
                 );
                 INSERT INTO BUCKET_ORDER (
                   workspace_id, bucket_id, display_order
                 ) VALUES ('workspace-1', 'bucket-1', 12);
                 INSERT INTO MILESTONE_ORDER (
                   workspace_id, milestone_id, display_order
                 ) VALUES ('workspace-1', 'milestone-1', 3);
                 INSERT INTO TASK_BOARD_ORDER (
                   workspace_id, board_group_type, board_group_id, task_id,
                   display_order
                 ) VALUES (
                   'workspace-1', 'bucket', 'bucket-1', 'task-1', 7
                 );",
            )
            .unwrap();

        migrate_order_tables(&mut connection).unwrap();
        migrate_order_tables(&mut connection).unwrap();

        for (table, expected) in [
            ("BUCKET_ORDER", "00000000000000000012"),
            ("MILESTONE_ORDER", "00000000000000000003"),
            ("TASK_BOARD_ORDER", "00000000000000000007"),
        ] {
            assert!(column_exists(&connection, table, "order_hint").unwrap());
            assert!(!column_exists(&connection, table, "display_order").unwrap());
            let order_hint: String = connection
                .query_row(&format!("SELECT order_hint FROM {table}"), [], |row| {
                    row.get(0)
                })
                .unwrap();
            assert_eq!(order_hint, expected);
        }
    }

    #[test]
    fn migrates_legacy_milestone_workspace_foreign_key() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE WORKPLACE (workplace_id TEXT PRIMARY KEY);
                 CREATE TABLE WORKSPACE (workspace_id TEXT PRIMARY KEY);
                 CREATE TABLE MILESTONES (
                   milestone_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   name TEXT NOT NULL,
                   display_order INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (workspace_id) REFERENCES WORKPLACE(workplace_id)
                     ON DELETE CASCADE,
                   UNIQUE (workspace_id, display_order)
                 );
                 INSERT INTO WORKSPACE (workspace_id) VALUES ('workspace-1');
                 INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name, display_order
                 ) VALUES ('milestone-1', 'workspace-1', 'Phase 1', 0);",
            )
            .unwrap();

        migrate_milestones_workspace_fk(&mut connection).unwrap();

        assert!(has_foreign_key_target(&connection, "MILESTONES", "WORKSPACE").unwrap());
        assert!(!has_foreign_key_target(&connection, "MILESTONES", "WORKPLACE").unwrap());
        assert_eq!(
            connection
                .query_row("SELECT COUNT(*) FROM MILESTONES", [], |row| {
                    row.get::<_, i64>(0)
                })
                .unwrap(),
            1
        );
        assert!(connection
            .execute(
                "INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name, display_order
                 ) VALUES ('milestone-2', 'workspace-1', 'Phase 2', 1)",
                [],
            )
            .is_ok());
    }

    #[test]
    fn migrates_legacy_bucket_workspace_foreign_key() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE WORKPLACE (workplace_id TEXT PRIMARY KEY);
                 CREATE TABLE WORKSPACE (workspace_id TEXT PRIMARY KEY);
                 CREATE TABLE BUCKETS (
                   bucket_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   name TEXT NOT NULL,
                   status_type INTEGER NOT NULL,
                   display_order INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (workspace_id) REFERENCES WORKPLACE(workplace_id)
                     ON DELETE CASCADE,
                   UNIQUE (workspace_id, display_order)
                 );
                 INSERT INTO WORKSPACE (workspace_id) VALUES ('workspace-1');
                 INSERT INTO BUCKETS (
                   bucket_id, workspace_id, name, status_type, display_order
                 ) VALUES ('bucket-1', 'workspace-1', 'Backlog', 0, 0);",
            )
            .unwrap();

        migrate_buckets_workspace_fk(&mut connection).unwrap();

        assert!(has_foreign_key_target(&connection, "BUCKETS", "WORKSPACE").unwrap());
        assert!(!has_foreign_key_target(&connection, "BUCKETS", "WORKPLACE").unwrap());
        assert_eq!(
            connection
                .query_row("SELECT COUNT(*) FROM BUCKETS", [], |row| {
                    row.get::<_, i64>(0)
                })
                .unwrap(),
            1
        );
    }

    #[test]
    fn removes_task_priority_master_without_losing_tasks() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE MASTER_TASK_PRIORITY (
                   priority_id INTEGER PRIMARY KEY,
                   name TEXT NOT NULL
                 );
                 CREATE TABLE TASKS (
                   task_id TEXT PRIMARY KEY,
                   document_id TEXT NOT NULL UNIQUE,
                   start_date TEXT,
                   due_date TEXT,
                   status_id TEXT,
                   priority_id INTEGER NOT NULL DEFAULT 0
                     CHECK(priority_id IN (0, 1, 2, 3)),
                   complete_percentage INTEGER NOT NULL DEFAULT 0,
                   milestone_id TEXT NOT NULL DEFAULT '0',
                   bucket_id TEXT NOT NULL DEFAULT '0',
                   display_order INTEGER NOT NULL DEFAULT 0,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   FOREIGN KEY (priority_id)
                     REFERENCES MASTER_TASK_PRIORITY(priority_id)
                 );
                 INSERT INTO MASTER_TASK_PRIORITY (priority_id, name)
                 VALUES (2, 'High');
                 INSERT INTO TASKS (task_id, document_id, priority_id)
                 VALUES ('task-1', 'document-1', 2);",
            )
            .unwrap();

        remove_task_priority_master(&mut connection).unwrap();

        assert!(!table_exists(&connection, "MASTER_TASK_PRIORITY").unwrap());
        assert!(!has_foreign_key_target(&connection, "TASKS", "MASTER_TASK_PRIORITY").unwrap());
        assert_eq!(
            connection
                .query_row(
                    "SELECT priority_id FROM TASKS WHERE task_id = 'task-1'",
                    [],
                    |row| row.get::<_, i64>(0),
                )
                .unwrap(),
            2
        );
        assert!(connection
            .execute(
                "INSERT INTO TASKS (task_id, document_id, priority_id)
                 VALUES ('task-2', 'document-2', 4)",
                [],
            )
            .is_err());
    }

    #[test]
    fn adds_dictionary_word_logical_deletion_column() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE DICTIONARY_WORDS (
                   dictionary_word_id TEXT PRIMARY KEY,
                   word TEXT NOT NULL
                 );",
            )
            .unwrap();

        add_dictionary_word_deleted_at(&connection).unwrap();
        add_dictionary_word_deleted_at(&connection).unwrap();

        assert!(column_exists(&connection, "DICTIONARY_WORDS", "deleted_at").unwrap());
    }

    #[test]
    fn adds_document_metadata_columns_idempotently() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE DOCUMENTS (
                   document_id TEXT PRIMARY KEY,
                   title TEXT NOT NULL
                 );",
            )
            .unwrap();

        add_document_metadata_columns(&connection).unwrap();
        add_document_metadata_columns(&connection).unwrap();

        assert!(column_exists(&connection, "DOCUMENTS", "icon_id").unwrap());
        assert!(column_exists(&connection, "DOCUMENTS", "deleted_at").unwrap());
    }

    #[test]
    fn adds_task_description_idempotently() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE TASKS (
                   task_id TEXT PRIMARY KEY
                 );
                 INSERT INTO TASKS (task_id) VALUES ('task-1');",
            )
            .unwrap();

        add_task_description(&connection).unwrap();
        add_task_description(&connection).unwrap();

        assert!(column_exists(&connection, "TASKS", "description").unwrap());
        assert_eq!(
            connection
                .query_row(
                    "SELECT description FROM TASKS WHERE task_id = 'task-1'",
                    [],
                    |row| row.get::<_, String>(0),
                )
                .unwrap(),
            ""
        );
    }

    #[test]
    fn document_task_references_allow_multiple_task_placements() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(include_str!("../db/schema.sql"))
            .unwrap();
        connection
            .execute_batch(
                "INSERT INTO WORKSPACE (
                   workspace_id, workspace_key, workspace_type, name
                 ) VALUES ('workspace-1', 'project-1', 0, 'Project');
                 INSERT INTO DOCUMENTS (
                   document_id, workspace_id, document_type, title
                 ) VALUES
                   ('document-1', 'workspace-1', 'document', 'Document'),
                   ('task-document-1', 'workspace-1', 'task', 'Task');
                 INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name
                 ) VALUES ('milestone-1', 'workspace-1', 'Milestone');
                 INSERT INTO BUCKETS (
                   bucket_id, workspace_id, name, status_type
                 ) VALUES ('bucket-1', 'workspace-1', 'Bucket', 0);
                 INSERT INTO TASKS (
                   task_id, document_id, description, milestone_id, bucket_id
                 ) VALUES (
                   'task-1', 'task-document-1', 'Description',
                   'milestone-1', 'bucket-1'
                 );
                 INSERT INTO DOCUMENT_TASK_REFERENCES (
                   reference_id, document_id, task_id, block_id, position
                 ) VALUES
                   ('reference-1', 'document-1', 'task-1', 'block-1', 0),
                   ('reference-2', 'document-1', 'task-1', 'block-2', 1);",
            )
            .unwrap();

        assert_eq!(
            connection
                .query_row(
                    "SELECT COUNT(*) FROM DOCUMENT_TASK_REFERENCES
                     WHERE document_id = 'document-1' AND task_id = 'task-1'",
                    [],
                    |row| row.get::<_, i64>(0),
                )
                .unwrap(),
            2
        );
    }

    #[test]
    fn migrates_legacy_document_workspace_foreign_key() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = OFF;
                 CREATE TABLE WORKPLACE (workplace_id TEXT PRIMARY KEY);
                 CREATE TABLE WORKSPACE (workspace_id TEXT PRIMARY KEY);
                 CREATE TABLE DOCUMENTS (
                   document_id TEXT PRIMARY KEY,
                   workspace_id TEXT NOT NULL,
                   document_type TEXT NOT NULL,
                   title TEXT NOT NULL,
                   content TEXT,
                   icon_id TEXT,
                   created_at TEXT NOT NULL DEFAULT (datetime('now')),
                   updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                   deleted_at TEXT,
                   FOREIGN KEY (workspace_id) REFERENCES WORKPLACE(workplace_id)
                     ON DELETE CASCADE
                 );
                 INSERT INTO WORKSPACE (workspace_id) VALUES ('workspace-1');
                 INSERT INTO DOCUMENTS (
                   document_id, workspace_id, document_type, title
                 ) VALUES ('document-1', 'workspace-1', 'document', 'Document');",
            )
            .unwrap();

        migrate_documents_workspace_fk(&mut connection).unwrap();

        assert!(has_foreign_key_target(&connection, "DOCUMENTS", "WORKSPACE").unwrap());
        assert!(!has_foreign_key_target(&connection, "DOCUMENTS", "WORKPLACE").unwrap());
        assert_eq!(
            connection
                .query_row("SELECT COUNT(*) FROM DOCUMENTS", [], |row| {
                    row.get::<_, i64>(0)
                })
                .unwrap(),
            1
        );
    }
}
