"""Load the development test data into a ManageMe SQLite database."""

from __future__ import annotations

import argparse
from pathlib import Path
import sqlite3


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "manageme.db"
SEED_PATH = BASE_DIR / "seed_document_test_data.sql"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Execute seed_document_test_data.sql against a SQLite database."
    )
    parser.add_argument(
        "--database",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"SQLite database path (default: {DEFAULT_DB_PATH})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    database_path = args.database.expanduser().resolve()

    if not database_path.is_file():
        raise FileNotFoundError(
            f"Database does not exist: {database_path}\n"
            "Create it first with apply_schema.py or specify --database."
        )

    seed_sql = SEED_PATH.read_text(encoding="utf-8")

    try:
        with sqlite3.connect(database_path) as connection:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.executescript(seed_sql)
    except sqlite3.Error as error:
        raise RuntimeError(
            f"Failed to apply seed SQL to {database_path}: {error}"
        ) from error

    print(f"Applied seed: {SEED_PATH}")
    print(f"Database: {database_path}")


if __name__ == "__main__":
    main()
