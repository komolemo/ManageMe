from pathlib import Path
import sqlite3


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "manageme.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def table_columns(connection: sqlite3.Connection, table_name: str) -> set[str]:
    return {
        row[1]
        for row in connection.execute(f"PRAGMA table_info({table_name})")
    }


def add_column(
    connection: sqlite3.Connection,
    table_name: str,
    column_name: str,
    column_definition: str,
) -> None:
    if column_name not in table_columns(connection, table_name):
        connection.execute(
            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"
        )


def migrate_existing_database(connection: sqlite3.Connection) -> None:
    """Bring older local development databases up to the current schema shape."""
    tables = {
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }

    if "WORKSPACE" in tables:
        add_column(connection, "WORKSPACE", "workspace_key", "TEXT")
        add_column(
            connection,
            "WORKSPACE",
            "workspace_type",
            "INTEGER NOT NULL DEFAULT 0 CHECK (workspace_type IN (0, 1))",
        )
        add_column(
            connection,
            "WORKSPACE",
            "description",
            "TEXT NOT NULL DEFAULT ''",
        )
        add_column(connection, "WORKSPACE", "deleted_at", "TEXT")
        add_column(connection, "WORKSPACE", "color_id", "INTEGER")
        connection.execute(
            """
            UPDATE WORKSPACE
            SET workspace_key = workspace_id
            WHERE workspace_key IS NULL OR workspace_key = ''
            """
        )
        connection.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_workspace_key
            ON WORKSPACE(workspace_key)
            """
        )

    if "BUCKETS" in tables:
        add_column(connection, "BUCKETS", "workspace_id", "TEXT")
        add_column(connection, "BUCKETS", "display_order", "INTEGER NOT NULL DEFAULT 0")

    if "DOCUMENTS" in tables:
        add_column(connection, "DOCUMENTS", "document_type", "TEXT")

    if "TAGS" in tables:
        columns = table_columns(connection, "TAGS")
        if "id" in columns and "tag_id" not in columns:
            connection.execute("ALTER TABLE TAGS RENAME COLUMN id TO tag_id")
        add_column(connection, "TAGS", "description", "TEXT")
        add_column(connection, "TAGS", "last_used_at", "TEXT")

    if "DOCUMENT_RELATIVE_BIND" in tables:
        add_column(
            connection,
            "DOCUMENT_RELATIVE_BIND",
            "display_order",
            "INTEGER NOT NULL DEFAULT 0",
        )

    if "TASKS" in tables:
        add_column(connection, "TASKS", "document_id", "TEXT")
        add_column(connection, "TASKS", "status_id", "TEXT")
        add_column(connection, "TASKS", "bucket_id", "TEXT NOT NULL DEFAULT '0'")
        add_column(connection, "TASKS", "complete_percentage", "INTEGER NOT NULL DEFAULT 0")


def drop_all_tables(connection: sqlite3.Connection) -> None:
    """Drop all tables and indexes from the database."""
    cursor = connection.execute(
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'index') AND name NOT LIKE 'sqlite_%'"
    )
    objects = [row[0] for row in cursor]
    
    for obj in objects:
        try:
            connection.execute(f"DROP TABLE IF EXISTS {obj}")
        except sqlite3.Error:
            # If it's not a table, it might be an index
            try:
                connection.execute(f"DROP INDEX IF EXISTS {obj}")
            except sqlite3.Error:
                pass
    
    connection.commit()


def main() -> None:
    schema = SCHEMA_PATH.read_text(encoding="utf-8")

    with sqlite3.connect(DB_PATH) as connection:
        drop_all_tables(connection)
        connection.executescript(schema)
        connection.commit()

    print(f"Applied schema: {SCHEMA_PATH}")
    print(f"Database: {DB_PATH}")


if __name__ == "__main__":
    main()
