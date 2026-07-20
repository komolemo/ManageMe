use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DictionaryWord {
    pub dictionary_word_id: String,
    pub word: String,
    pub normalized_word: String,
    pub description: String,
    pub created_by: String,
    pub confidence: Option<f64>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDictionaryWord {
    pub dictionary_word_id: String,
    pub word: String,
    pub normalized_word: Option<String>,
    #[serde(default)]
    pub description: String,
    pub created_by: String,
    pub confidence: Option<f64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDictionaryWord {
    pub word: String,
    pub normalized_word: Option<String>,
    pub description: String,
    pub created_by: String,
    pub confidence: Option<f64>,
}

const SELECT_COLUMNS: &str = "dictionary_word_id, word, normalized_word, \
     COALESCE(description, ''), created_by, confidence, created_at, updated_at";

fn map_word(row: &rusqlite::Row<'_>) -> rusqlite::Result<DictionaryWord> {
    Ok(DictionaryWord {
        dictionary_word_id: row.get(0)?,
        word: row.get(1)?,
        normalized_word: row.get(2)?,
        description: row.get(3)?,
        created_by: row.get(4)?,
        confidence: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

fn normalized_value(word: &str, supplied: Option<&str>) -> Result<String, String> {
    let word = word.trim();
    if word.is_empty() {
        return Err("word is required".into());
    }
    let normalized = supplied
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_lowercase)
        .unwrap_or_else(|| word.to_lowercase());
    Ok(normalized)
}

fn validate_metadata(created_by: &str, confidence: Option<f64>) -> Result<(), String> {
    if !matches!(created_by, "ai" | "user") {
        return Err("createdBy must be ai or user".into());
    }
    if confidence.is_some_and(|value| !(0.0..=1.0).contains(&value)) {
        return Err("confidence must be between 0 and 1".into());
    }
    Ok(())
}

pub fn find_by_id(
    connection: &Connection,
    dictionary_word_id: &str,
) -> Result<Option<DictionaryWord>, String> {
    connection
        .query_row(
            &format!(
                "SELECT {SELECT_COLUMNS} FROM DICTIONARY_WORDS
                 WHERE dictionary_word_id = ?1 AND deleted_at IS NULL"
            ),
            [dictionary_word_id],
            map_word,
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create(
    connection: &Connection,
    input: CreateDictionaryWord,
) -> Result<DictionaryWord, String> {
    if input.dictionary_word_id.trim().is_empty() {
        return Err("dictionaryWordId is required".into());
    }
    let word = input.word.trim();
    let normalized = normalized_value(word, input.normalized_word.as_deref())?;
    validate_metadata(&input.created_by, input.confidence)?;

    let deleted_id: Option<String> = connection
        .query_row(
            "SELECT dictionary_word_id FROM DICTIONARY_WORDS
             WHERE normalized_word = ?1 AND deleted_at IS NOT NULL",
            [&normalized],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;
    let id = deleted_id.unwrap_or(input.dictionary_word_id);
    let changed = connection
        .execute(
            "UPDATE DICTIONARY_WORDS
             SET word = ?1, normalized_word = ?2, description = ?3,
                 created_by = ?4, confidence = ?5, deleted_at = NULL,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE dictionary_word_id = ?6",
            params![
                word,
                normalized,
                input.description,
                input.created_by,
                input.confidence,
                id
            ],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        connection
            .execute(
                "INSERT INTO DICTIONARY_WORDS (
                   dictionary_word_id, word, normalized_word, description,
                   created_by, confidence
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    id,
                    word,
                    normalized,
                    input.description,
                    input.created_by,
                    input.confidence
                ],
            )
            .map_err(|error| error.to_string())?;
    }
    find_by_id(connection, &id)?
        .ok_or_else(|| "The created Dictionary word could not be retrieved".into())
}

pub fn list(connection: &Connection, initial: Option<&str>) -> Result<Vec<DictionaryWord>, String> {
    let initial = initial.map(str::trim).filter(|value| !value.is_empty());
    let pattern = initial.map(|value| format!("{}%", escape_like(value)));
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM DICTIONARY_WORDS
             WHERE deleted_at IS NULL
               AND (?1 IS NULL OR normalized_word LIKE ?1 ESCAPE '\\')
             ORDER BY normalized_word COLLATE NOCASE, dictionary_word_id"
        ))
        .map_err(|error| error.to_string())?;
    let words = statement
        .query_map([pattern], map_word)
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(words)
}

fn escape_like(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

pub fn search(connection: &Connection, query: &str) -> Result<Vec<DictionaryWord>, String> {
    let query = query.trim();
    if query.is_empty() {
        return list(connection, None);
    }
    let pattern = format!("%{}%", escape_like(query));
    let mut statement = connection
        .prepare(&format!(
            "SELECT {SELECT_COLUMNS} FROM DICTIONARY_WORDS
             WHERE deleted_at IS NULL
               AND (
                 word LIKE ?1 ESCAPE '\\' COLLATE NOCASE
                 OR normalized_word LIKE ?1 ESCAPE '\\' COLLATE NOCASE
                 OR COALESCE(description, '') LIKE ?1 ESCAPE '\\' COLLATE NOCASE
               )
             ORDER BY normalized_word COLLATE NOCASE, dictionary_word_id"
        ))
        .map_err(|error| error.to_string())?;
    let words = statement
        .query_map([pattern], map_word)
        .map_err(|error| error.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())?;
    Ok(words)
}

pub fn update(
    connection: &Connection,
    dictionary_word_id: &str,
    input: UpdateDictionaryWord,
) -> Result<Option<DictionaryWord>, String> {
    let word = input.word.trim();
    let normalized = normalized_value(word, input.normalized_word.as_deref())?;
    validate_metadata(&input.created_by, input.confidence)?;
    let changed = connection
        .execute(
            "UPDATE DICTIONARY_WORDS
             SET word = ?1, normalized_word = ?2, description = ?3,
                 created_by = ?4, confidence = ?5,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE dictionary_word_id = ?6 AND deleted_at IS NULL",
            params![
                word,
                normalized,
                input.description,
                input.created_by,
                input.confidence,
                dictionary_word_id
            ],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Ok(None);
    }
    find_by_id(connection, dictionary_word_id)
}

pub fn delete(connection: &Connection, dictionary_word_id: &str) -> Result<bool, String> {
    connection
        .execute(
            "UPDATE DICTIONARY_WORDS
             SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE dictionary_word_id = ?1 AND deleted_at IS NULL",
            [dictionary_word_id],
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
        .map_err(|_| "Failed to acquire the database lock")?;
    operation(&connection)
}

#[tauri::command]
pub fn create_dictionary_word(
    database: tauri::State<'_, Database>,
    input: CreateDictionaryWord,
) -> Result<DictionaryWord, String> {
    with_connection(&database, |connection| create(connection, input))
}

#[tauri::command]
pub fn get_dictionary_word_by_id(
    database: tauri::State<'_, Database>,
    dictionary_word_id: String,
) -> Result<Option<DictionaryWord>, String> {
    with_connection(&database, |connection| {
        find_by_id(connection, &dictionary_word_id)
    })
}

#[tauri::command]
pub fn list_dictionary_words(
    database: tauri::State<'_, Database>,
    initial: Option<String>,
) -> Result<Vec<DictionaryWord>, String> {
    with_connection(&database, |connection| list(connection, initial.as_deref()))
}

#[tauri::command]
pub fn search_dictionary_words(
    database: tauri::State<'_, Database>,
    query: String,
) -> Result<Vec<DictionaryWord>, String> {
    with_connection(&database, |connection| search(connection, &query))
}

#[tauri::command]
pub fn update_dictionary_word(
    database: tauri::State<'_, Database>,
    dictionary_word_id: String,
    input: UpdateDictionaryWord,
) -> Result<Option<DictionaryWord>, String> {
    with_connection(&database, |connection| {
        update(connection, &dictionary_word_id, input)
    })
}

#[tauri::command]
pub fn delete_dictionary_word(
    database: tauri::State<'_, Database>,
    dictionary_word_id: String,
) -> Result<bool, String> {
    with_connection(&database, |connection| {
        delete(connection, &dictionary_word_id)
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
    }

    fn input(id: &str, word: &str) -> CreateDictionaryWord {
        CreateDictionaryWord {
            dictionary_word_id: id.into(),
            word: word.into(),
            normalized_word: None,
            description: "Description".into(),
            created_by: "user".into(),
            confidence: Some(0.8),
        }
    }

    #[test]
    fn dictionary_word_crud_search_and_restore_work() {
        let connection = connection();
        let created = create(&connection, input("word-1", " API ")).unwrap();
        assert_eq!(created.normalized_word, "api");
        assert_eq!(list(&connection, Some("a")).unwrap().len(), 1);
        assert_eq!(search(&connection, "script").unwrap().len(), 1);

        let updated = update(
            &connection,
            "word-1",
            UpdateDictionaryWord {
                word: "Application Programming Interface".into(),
                normalized_word: None,
                description: "Updated".into(),
                created_by: "ai".into(),
                confidence: Some(1.0),
            },
        )
        .unwrap()
        .unwrap();
        assert_eq!(updated.description, "Updated");
        assert!(delete(&connection, "word-1").unwrap());
        assert!(find_by_id(&connection, "word-1").unwrap().is_none());

        let restored = create(
            &connection,
            input("word-2", "Application Programming Interface"),
        )
        .unwrap();
        assert_eq!(restored.dictionary_word_id, "word-1");
    }

    #[test]
    fn rejects_invalid_metadata_and_escapes_search() {
        let connection = connection();
        let mut invalid = input("word-1", "Term");
        invalid.confidence = Some(1.1);
        assert!(create(&connection, invalid).is_err());
        create(&connection, input("word-2", "100%")).unwrap();
        assert_eq!(search(&connection, "%").unwrap().len(), 1);
        assert!(search(&connection, "_").unwrap().is_empty());
    }
}
