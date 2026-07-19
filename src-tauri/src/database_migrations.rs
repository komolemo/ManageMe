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
}
