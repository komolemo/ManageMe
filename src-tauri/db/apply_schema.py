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

    if "PROJECTS" in tables:
        add_column(connection, "PROJECTS", "project_key", "TEXT")
        connection.execute(
            """
            UPDATE PROJECTS
            SET project_key = project_id
            WHERE project_key IS NULL OR project_key = ''
            """
        )
        connection.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_key
            ON PROJECTS(project_key)
            """
        )

    if "BUCKETS" in tables:
        add_column(connection, "BUCKETS", "project_id", "TEXT")
        add_column(connection, "BUCKETS", "display_order", "INTEGER NOT NULL DEFAULT 0")

    if "WIKI" in tables:
        add_column(connection, "WIKI", "project_id", "TEXT")

    if "TAGS" in tables:
        columns = table_columns(connection, "TAGS")
        if "id" in columns and "tag_id" not in columns:
            connection.execute("ALTER TABLE TAGS RENAME COLUMN id TO tag_id")
        add_column(connection, "TAGS", "description", "TEXT")
        add_column(connection, "TAGS", "last_used_at", "TEXT")

    if "TASK_RELATIVE_BIND" in tables:
        add_column(
            connection,
            "TASK_RELATIVE_BIND",
            "display_order",
            "INTEGER NOT NULL DEFAULT 0",
        )

    if "TASKS" in tables:
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
