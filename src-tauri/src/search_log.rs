use crate::workspace::Database;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;

const DEFAULT_LIMIT: u32 = 20;
const MAX_LIMIT: u32 = 100;
const DEFAULT_MAX_ENTRIES: u32 = 100;
const DEFAULT_RETENTION_DAYS: u32 = 180;
const SEARCH_WORD_SUGGESTION_LIMIT: u32 = 4;
const TASK_SUGGESTION_LIMIT: u32 = 3;
const DOCUMENT_SUGGESTION_LIMIT: u32 = 3;
const TOTAL_SUGGESTION_LIMIT: u32 =
    SEARCH_WORD_SUGGESTION_LIMIT + TASK_SUGGESTION_LIMIT + DOCUMENT_SUGGESTION_LIMIT;
const NOW: &str = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SearchWordLog {
    pub log_id: String,
    pub search_word: String,
    pub created_at: String,
    pub last_searched_at: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SearchDocumentLog {
    pub log_id: String,
    pub document_id: String,
    pub workspace_id: String,
    pub title: String,
    pub accessed_at: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SearchTaskLog {
    pub log_id: String,
    pub task_id: String,
    pub workspace_id: String,
    pub title: String,
    pub accessed_at: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestion {
    pub kind: String,
    pub id: String,
    pub label: String,
    pub workspace_id: Option<String>,
    pub last_used_at: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PruneSearchLogsResult {
    pub search_words: usize,
    pub documents: usize,
    pub tasks: usize,
}

fn required<'a>(value: &'a str, field: &str) -> Result<&'a str, String> {
    let value = value.trim();
    if value.is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(value)
    }
}

fn resolved_limit(limit: Option<u32>) -> u32 {
    limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT)
}

fn escape_like(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

fn prefix_pattern(query: &str) -> String {
    format!("{}%", escape_like(query.trim()))
}

#[derive(Debug, Clone, PartialEq)]
enum QueryToken {
    Operand(String),
    And,
    Or,
    Not,
    LeftParenthesis,
    RightParenthesis,
}

impl QueryToken {
    fn ends_expression(&self) -> bool {
        matches!(self, Self::Operand(_) | Self::RightParenthesis)
    }

    fn starts_expression(&self) -> bool {
        matches!(self, Self::Operand(_) | Self::LeftParenthesis)
    }
}

fn tokenize_query(query: &str) -> Result<Vec<QueryToken>, String> {
    let mut characters = query.chars().peekable();
    let mut tokens = Vec::new();

    while let Some(character) = characters.next() {
        if character.is_whitespace() {
            continue;
        }

        if character == '(' {
            tokens.push(QueryToken::LeftParenthesis);
            continue;
        }
        if character == ')' {
            tokens.push(QueryToken::RightParenthesis);
            continue;
        }
        if character == '"' {
            let mut phrase = String::new();
            let mut closed = false;
            while let Some(phrase_character) = characters.next() {
                if phrase_character == '"' {
                    if characters.peek() == Some(&'"') {
                        characters.next();
                        phrase.push('"');
                    } else {
                        closed = true;
                        break;
                    }
                } else {
                    phrase.push(phrase_character);
                }
            }
            if !closed {
                return Err("Search query contains an unclosed quote".into());
            }
            let phrase = phrase.split_whitespace().collect::<Vec<_>>().join(" ");
            if phrase.is_empty() {
                return Err("Exact-match phrase must not be empty".into());
            }
            tokens.push(QueryToken::Operand(phrase));
            continue;
        }

        let mut word = String::from(character);
        while let Some(next) = characters.peek() {
            if next.is_whitespace() || matches!(next, '(' | ')' | '"') {
                break;
            }
            word.push(*next);
            characters.next();
        }
        tokens.push(if word.eq_ignore_ascii_case("AND") {
            QueryToken::And
        } else if word.eq_ignore_ascii_case("OR") {
            QueryToken::Or
        } else if word.eq_ignore_ascii_case("NOT") {
            QueryToken::Not
        } else {
            QueryToken::Operand(word)
        });
    }

    Ok(tokens)
}

fn build_fts_query(query: &str) -> Result<Option<String>, String> {
    let raw_tokens = tokenize_query(query)?;
    if raw_tokens.is_empty() {
        return Ok(None);
    }

    let searchable_character_count = raw_tokens
        .iter()
        .filter_map(|token| match token {
            QueryToken::Operand(value) => Some(
                value
                    .chars()
                    .filter(|character| !character.is_whitespace())
                    .count(),
            ),
            _ => None,
        })
        .sum::<usize>();
    if searchable_character_count < 2 {
        return Ok(None);
    }

    let mut tokens = Vec::new();
    for token in raw_tokens {
        if tokens
            .last()
            .is_some_and(|previous: &QueryToken| previous.ends_expression())
            && token.starts_expression()
        {
            tokens.push(QueryToken::And);
        }
        tokens.push(token);
    }

    let mut expects_operand = true;
    let mut parenthesis_depth = 0_u32;
    for token in &tokens {
        if expects_operand {
            match token {
                QueryToken::Operand(_) => expects_operand = false,
                QueryToken::LeftParenthesis => parenthesis_depth += 1,
                _ => return Err("Search query expects a word or exact-match phrase".into()),
            }
        } else {
            match token {
                QueryToken::And | QueryToken::Or | QueryToken::Not => expects_operand = true,
                QueryToken::RightParenthesis if parenthesis_depth > 0 => {
                    parenthesis_depth -= 1;
                }
                _ => {
                    return Err(
                        "Search query expects AND, OR, NOT, or a closing parenthesis".into(),
                    )
                }
            }
        }
    }
    if expects_operand {
        return Err("Search query must not end with an operator".into());
    }
    if parenthesis_depth != 0 {
        return Err("Search query contains an unclosed parenthesis".into());
    }

    Ok(Some(
        tokens
            .into_iter()
            .map(|token| match token {
                QueryToken::Operand(value) => format!("\"{}\"", value.replace('"', "\"\"")),
                QueryToken::And => "AND".into(),
                QueryToken::Or => "OR".into(),
                QueryToken::Not => "NOT".into(),
                QueryToken::LeftParenthesis => "(".into(),
                QueryToken::RightParenthesis => ")".into(),
            })
            .collect::<Vec<_>>()
            .join(" "),
    ))
}

pub fn create_word(
    connection: &Connection,
    log_id: &str,
    search_word: &str,
) -> Result<SearchWordLog, String> {
    let log_id = required(log_id, "logId")?;
    let search_word = required(search_word, "searchWord")?;
    connection
        .execute(
            &format!(
                "INSERT INTO LOG_SEARCH_WORD (log_id, search_word, last_searched_at)
                 VALUES (?1, ?2, {NOW})"
            ),
            params![log_id, search_word],
        )
        .map_err(|error| error.to_string())?;
    find_word(connection, log_id)?.ok_or_else(|| "Created search word log was not found".into())
}

fn find_word(connection: &Connection, log_id: &str) -> Result<Option<SearchWordLog>, String> {
    connection
        .query_row(
            "SELECT log_id, search_word, created_at,
                    COALESCE(last_searched_at, created_at)
             FROM LOG_SEARCH_WORD WHERE log_id = ?1",
            [log_id],
            |row| {
                Ok(SearchWordLog {
                    log_id: row.get(0)?,
                    search_word: row.get(1)?,
                    created_at: row.get(2)?,
                    last_searched_at: row.get(3)?,
                })
            },
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create_document(
    connection: &Connection,
    log_id: &str,
    document_id: &str,
) -> Result<SearchDocumentLog, String> {
    let log_id = required(log_id, "logId")?;
    let document_id = required(document_id, "documentId")?;
    let changed = connection
        .execute(
            &format!(
                "INSERT INTO LOG_SEARCH_DOCUMENT (log_id, document_id, accessed_at)
             SELECT ?1, document_id, {NOW} FROM DOCUMENTS
             WHERE document_id = ?2 AND deleted_at IS NULL",
            ),
            params![log_id, document_id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Err("Document was not found".into());
    }
    find_document(connection, log_id, document_id)?
        .ok_or_else(|| "Created document search log was not found".into())
}

fn find_document(
    connection: &Connection,
    log_id: &str,
    document_id: &str,
) -> Result<Option<SearchDocumentLog>, String> {
    connection
        .query_row(
            "SELECT log.log_id, document.document_id, document.workspace_id,
                    document.title, log.accessed_at
             FROM LOG_SEARCH_DOCUMENT log
             JOIN DOCUMENTS document ON document.document_id = log.document_id
             WHERE log.log_id = ?1 AND log.document_id = ?2",
            params![log_id, document_id],
            |row| {
                Ok(SearchDocumentLog {
                    log_id: row.get(0)?,
                    document_id: row.get(1)?,
                    workspace_id: row.get(2)?,
                    title: row.get(3)?,
                    accessed_at: row.get(4)?,
                })
            },
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn create_task(
    connection: &Connection,
    log_id: &str,
    task_id: &str,
) -> Result<SearchTaskLog, String> {
    let log_id = required(log_id, "logId")?;
    let task_id = required(task_id, "taskId")?;
    let changed = connection
        .execute(
            &format!(
                "INSERT INTO LOG_SEARCH_TASK (log_id, task_id, accessed_at)
             SELECT ?1, task_id, {NOW} FROM TASKS
             WHERE task_id = ?2 AND deleted_at IS NULL",
            ),
            params![log_id, task_id],
        )
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Err("Task was not found".into());
    }
    find_task(connection, log_id, task_id)?
        .ok_or_else(|| "Created task search log was not found".into())
}

fn find_task(
    connection: &Connection,
    log_id: &str,
    task_id: &str,
) -> Result<Option<SearchTaskLog>, String> {
    connection
        .query_row(
            "SELECT log.log_id, task.task_id, task.workspace_id,
                    task.title, log.accessed_at
             FROM LOG_SEARCH_TASK log
             JOIN TASKS task ON task.task_id = log.task_id
             WHERE log.log_id = ?1 AND log.task_id = ?2",
            params![log_id, task_id],
            |row| {
                Ok(SearchTaskLog {
                    log_id: row.get(0)?,
                    task_id: row.get(1)?,
                    workspace_id: row.get(2)?,
                    title: row.get(3)?,
                    accessed_at: row.get(4)?,
                })
            },
        )
        .optional()
        .map_err(|error| error.to_string())
}

pub fn recent_words(
    connection: &Connection,
    query: &str,
    limit: Option<u32>,
) -> Result<Vec<SearchWordLog>, String> {
    let mut statement = connection
        .prepare(
            "SELECT MIN(log_id), search_word, MIN(created_at),
                    MAX(COALESCE(last_searched_at, created_at)) AS last_used_at
             FROM LOG_SEARCH_WORD
             WHERE search_word LIKE ?1 ESCAPE '\\' COLLATE NOCASE
             GROUP BY search_word COLLATE NOCASE
             ORDER BY last_used_at DESC, search_word COLLATE NOCASE
             LIMIT ?2",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(
            params![prefix_pattern(query), resolved_limit(limit)],
            |row| {
                Ok(SearchWordLog {
                    log_id: row.get(0)?,
                    search_word: row.get(1)?,
                    created_at: row.get(2)?,
                    last_searched_at: row.get(3)?,
                })
            },
        )
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

pub fn recent_documents(
    connection: &Connection,
    query: &str,
    workspace_id: Option<&str>,
    limit: Option<u32>,
) -> Result<Vec<SearchDocumentLog>, String> {
    let Some(fts_query) = build_fts_query(query)? else {
        return Ok(Vec::new());
    };
    let mut statement = connection
        .prepare(
            "SELECT MIN(log.log_id), document.document_id, document.workspace_id,
                    document.title, MAX(log.accessed_at) AS last_used_at
             FROM LOG_SEARCH_DOCUMENT log
             JOIN DOCUMENTS document ON document.document_id = log.document_id
             JOIN DOCUMENT_SEARCH_FTS
               ON DOCUMENT_SEARCH_FTS.document_id = document.document_id
             WHERE document.deleted_at IS NULL
               AND (?1 IS NULL OR document.workspace_id = ?1)
               AND DOCUMENT_SEARCH_FTS MATCH ?2
             GROUP BY document.document_id
             ORDER BY last_used_at DESC, document.title COLLATE NOCASE
             LIMIT ?3",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(
            params![workspace_id, fts_query, resolved_limit(limit)],
            |row| {
                Ok(SearchDocumentLog {
                    log_id: row.get(0)?,
                    document_id: row.get(1)?,
                    workspace_id: row.get(2)?,
                    title: row.get(3)?,
                    accessed_at: row.get(4)?,
                })
            },
        )
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

pub fn recent_tasks(
    connection: &Connection,
    query: &str,
    workspace_id: Option<&str>,
    limit: Option<u32>,
) -> Result<Vec<SearchTaskLog>, String> {
    let Some(fts_query) = build_fts_query(query)? else {
        return Ok(Vec::new());
    };
    let mut statement = connection
        .prepare(
            "SELECT MIN(log.log_id), task.task_id, task.workspace_id,
                    task.title, MAX(log.accessed_at) AS last_used_at
             FROM LOG_SEARCH_TASK log
             JOIN TASKS task ON task.task_id = log.task_id
             JOIN TASK_SEARCH_FTS
               ON TASK_SEARCH_FTS.task_id = task.task_id
             WHERE task.deleted_at IS NULL
               AND (?1 IS NULL OR task.workspace_id = ?1)
               AND TASK_SEARCH_FTS MATCH ?2
             GROUP BY task.task_id
             ORDER BY last_used_at DESC, task.title COLLATE NOCASE
             LIMIT ?3",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(
            params![workspace_id, fts_query, resolved_limit(limit)],
            |row| {
                Ok(SearchTaskLog {
                    log_id: row.get(0)?,
                    task_id: row.get(1)?,
                    workspace_id: row.get(2)?,
                    title: row.get(3)?,
                    accessed_at: row.get(4)?,
                })
            },
        )
        .map_err(|error| error.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|error| error.to_string())
}

pub fn suggestions(
    connection: &Connection,
    query: &str,
    workspace_id: Option<&str>,
    limit: Option<u32>,
) -> Result<Vec<SearchSuggestion>, String> {
    let limit = limit
        .unwrap_or(TOTAL_SUGGESTION_LIMIT)
        .min(TOTAL_SUGGESTION_LIMIT);
    if limit == 0 {
        return Ok(Vec::new());
    }
    let mut result = Vec::new();
    result.extend(
        recent_words(connection, query, Some(SEARCH_WORD_SUGGESTION_LIMIT))?
            .into_iter()
            .map(|log| SearchSuggestion {
                kind: "word".into(),
                id: log.log_id,
                label: log.search_word,
                workspace_id: None,
                last_used_at: log.last_searched_at,
            }),
    );
    result.extend(
        recent_tasks(connection, query, workspace_id, Some(TASK_SUGGESTION_LIMIT))?
            .into_iter()
            .map(|log| SearchSuggestion {
                kind: "task".into(),
                id: log.task_id,
                label: log.title,
                workspace_id: Some(log.workspace_id),
                last_used_at: log.accessed_at,
            }),
    );
    result.extend(
        recent_documents(
            connection,
            query,
            workspace_id,
            Some(DOCUMENT_SUGGESTION_LIMIT),
        )?
        .into_iter()
        .map(|log| SearchSuggestion {
            kind: "document".into(),
            id: log.document_id,
            label: log.title,
            workspace_id: Some(log.workspace_id),
            last_used_at: log.accessed_at,
        }),
    );
    result.truncate(limit as usize);
    Ok(result)
}

pub fn touch_word(connection: &Connection, search_word: &str) -> Result<usize, String> {
    let search_word = required(search_word, "searchWord")?;
    connection
        .execute(
            &format!(
                "UPDATE LOG_SEARCH_WORD SET last_searched_at = {NOW}
                 WHERE search_word = ?1 COLLATE NOCASE"
            ),
            [search_word],
        )
        .map_err(|error| error.to_string())
}

pub fn touch_document(connection: &Connection, document_id: &str) -> Result<usize, String> {
    connection
        .execute(
            &format!(
                "UPDATE LOG_SEARCH_DOCUMENT SET accessed_at = {NOW}
                 WHERE document_id = ?1"
            ),
            [required(document_id, "documentId")?],
        )
        .map_err(|error| error.to_string())
}

pub fn touch_task(connection: &Connection, task_id: &str) -> Result<usize, String> {
    connection
        .execute(
            &format!(
                "UPDATE LOG_SEARCH_TASK SET accessed_at = {NOW}
                 WHERE task_id = ?1"
            ),
            [required(task_id, "taskId")?],
        )
        .map_err(|error| error.to_string())
}

fn delete_by(
    connection: &Connection,
    table: &str,
    column: &str,
    value: &str,
) -> Result<usize, String> {
    let value = required(value, column)?;
    connection
        .execute(&format!("DELETE FROM {table} WHERE {column} = ?1"), [value])
        .map_err(|error| error.to_string())
}

fn clear(connection: &Connection, table: &str) -> Result<usize, String> {
    connection
        .execute(&format!("DELETE FROM {table}"), [])
        .map_err(|error| error.to_string())
}

pub fn prune(
    connection: &Connection,
    max_entries: Option<u32>,
    retention_days: Option<u32>,
) -> Result<PruneSearchLogsResult, String> {
    let max_entries = max_entries.unwrap_or(DEFAULT_MAX_ENTRIES).max(1);
    let retention_days = retention_days.unwrap_or(DEFAULT_RETENTION_DAYS).max(1);
    let search_words = connection
        .execute(
            "DELETE FROM LOG_SEARCH_WORD
             WHERE julianday(COALESCE(last_searched_at, created_at)) <
                     julianday('now', printf('-%d days', ?2))
                OR log_id IN (
                    SELECT log_id FROM LOG_SEARCH_WORD
                    ORDER BY COALESCE(last_searched_at, created_at) DESC, log_id DESC
                    LIMIT -1 OFFSET ?1
                )",
            params![max_entries, retention_days],
        )
        .map_err(|error| error.to_string())?;
    let documents = connection
        .execute(
            "DELETE FROM LOG_SEARCH_DOCUMENT
             WHERE julianday(accessed_at) < julianday('now', printf('-%d days', ?2))
                OR log_id IN (
                    SELECT log_id FROM (
                        SELECT log.log_id,
                               ROW_NUMBER() OVER (
                                   PARTITION BY document.workspace_id
                                   ORDER BY log.accessed_at DESC, log.log_id DESC
                               ) AS row_number
                        FROM LOG_SEARCH_DOCUMENT log
                        JOIN DOCUMENTS document ON document.document_id = log.document_id
                    ) WHERE row_number > ?1
                )",
            params![max_entries, retention_days],
        )
        .map_err(|error| error.to_string())?;
    let tasks = connection
        .execute(
            "DELETE FROM LOG_SEARCH_TASK
             WHERE julianday(accessed_at) < julianday('now', printf('-%d days', ?2))
                OR log_id IN (
                    SELECT log_id FROM (
                        SELECT log.log_id,
                               ROW_NUMBER() OVER (
                                   PARTITION BY task.workspace_id
                                   ORDER BY log.accessed_at DESC, log.log_id DESC
                               ) AS row_number
                        FROM LOG_SEARCH_TASK log
                        JOIN TASKS task ON task.task_id = log.task_id
                    ) WHERE row_number > ?1
                )",
            params![max_entries, retention_days],
        )
        .map_err(|error| error.to_string())?;
    Ok(PruneSearchLogsResult {
        search_words,
        documents,
        tasks,
    })
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
pub fn create_search_word_log(
    database: tauri::State<'_, Database>,
    log_id: String,
    search_word: String,
) -> Result<SearchWordLog, String> {
    with_connection(&database, |connection| {
        create_word(connection, &log_id, &search_word)
    })
}

#[tauri::command]
pub fn create_search_document_log(
    database: tauri::State<'_, Database>,
    log_id: String,
    document_id: String,
) -> Result<SearchDocumentLog, String> {
    with_connection(&database, |connection| {
        create_document(connection, &log_id, &document_id)
    })
}

#[tauri::command]
pub fn create_search_task_log(
    database: tauri::State<'_, Database>,
    log_id: String,
    task_id: String,
) -> Result<SearchTaskLog, String> {
    with_connection(&database, |connection| {
        create_task(connection, &log_id, &task_id)
    })
}

#[tauri::command]
pub fn list_recent_search_words(
    database: tauri::State<'_, Database>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<SearchWordLog>, String> {
    with_connection(&database, |connection| {
        recent_words(connection, &query, limit)
    })
}

#[tauri::command]
pub fn list_recent_search_documents(
    database: tauri::State<'_, Database>,
    query: String,
    workspace_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SearchDocumentLog>, String> {
    with_connection(&database, |connection| {
        recent_documents(connection, &query, workspace_id.as_deref(), limit)
    })
}

#[tauri::command]
pub fn list_recent_search_tasks(
    database: tauri::State<'_, Database>,
    query: String,
    workspace_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SearchTaskLog>, String> {
    with_connection(&database, |connection| {
        recent_tasks(connection, &query, workspace_id.as_deref(), limit)
    })
}

#[tauri::command]
pub fn list_search_suggestions(
    database: tauri::State<'_, Database>,
    query: String,
    workspace_id: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<SearchSuggestion>, String> {
    with_connection(&database, |connection| {
        suggestions(connection, &query, workspace_id.as_deref(), limit)
    })
}

#[tauri::command]
pub fn touch_search_word_log(
    database: tauri::State<'_, Database>,
    search_word: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| touch_word(connection, &search_word))
}

#[tauri::command]
pub fn touch_search_document_log(
    database: tauri::State<'_, Database>,
    document_id: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| {
        touch_document(connection, &document_id)
    })
}

#[tauri::command]
pub fn touch_search_task_log(
    database: tauri::State<'_, Database>,
    task_id: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| touch_task(connection, &task_id))
}

#[tauri::command]
pub fn delete_search_word_log(
    database: tauri::State<'_, Database>,
    search_word: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| {
        delete_by(connection, "LOG_SEARCH_WORD", "search_word", &search_word)
    })
}

#[tauri::command]
pub fn delete_search_document_log(
    database: tauri::State<'_, Database>,
    document_id: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| {
        delete_by(
            connection,
            "LOG_SEARCH_DOCUMENT",
            "document_id",
            &document_id,
        )
    })
}

#[tauri::command]
pub fn delete_search_task_log(
    database: tauri::State<'_, Database>,
    task_id: String,
) -> Result<usize, String> {
    with_connection(&database, |connection| {
        delete_by(connection, "LOG_SEARCH_TASK", "task_id", &task_id)
    })
}

#[tauri::command]
pub fn clear_search_word_logs(database: tauri::State<'_, Database>) -> Result<usize, String> {
    with_connection(&database, |connection| clear(connection, "LOG_SEARCH_WORD"))
}

#[tauri::command]
pub fn clear_search_document_logs(database: tauri::State<'_, Database>) -> Result<usize, String> {
    with_connection(&database, |connection| {
        clear(connection, "LOG_SEARCH_DOCUMENT")
    })
}

#[tauri::command]
pub fn clear_search_task_logs(database: tauri::State<'_, Database>) -> Result<usize, String> {
    with_connection(&database, |connection| clear(connection, "LOG_SEARCH_TASK"))
}

#[tauri::command]
pub fn prune_search_logs(
    database: tauri::State<'_, Database>,
    max_entries: Option<u32>,
    retention_days: Option<u32>,
) -> Result<PruneSearchLogsResult, String> {
    with_connection(&database, |connection| {
        prune(connection, max_entries, retention_days)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn connection() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "PRAGMA foreign_keys = ON;
                 PRAGMA recursive_triggers = ON;",
            )
            .unwrap();
        connection
            .execute_batch(include_str!("../db/schema.sql"))
            .unwrap();
        connection
            .execute_batch(
                "INSERT INTO WORKSPACE (
                   workspace_id, workspace_key, workspace_type, name
                 ) VALUES
                   ('documents-1', 'documents-1', 1, 'Documents 1'),
                   ('documents-2', 'documents-2', 1, 'Documents 2'),
                   ('tasks-1', 'tasks-1', 0, 'Tasks 1'),
                   ('tasks-2', 'tasks-2', 0, 'Tasks 2');
                 INSERT INTO BUCKETS (
                   bucket_id, workspace_id, name, status_type
                 ) VALUES
                   ('bucket-1', 'tasks-1', 'Bucket 1', 0),
                   ('bucket-2', 'tasks-2', 'Bucket 2', 0);
                 INSERT INTO MILESTONES (
                   milestone_id, workspace_id, name
                 ) VALUES
                   ('milestone-1', 'tasks-1', 'Milestone 1'),
                   ('milestone-2', 'tasks-2', 'Milestone 2');
                 INSERT INTO DOCUMENTS (
                   document_id, workspace_id, document_type, title, content
                 ) VALUES
                   ('document-1', 'documents-1', 'document', 'Rust 100% guide', ''),
                   ('document-2', 'documents-1', 'document', 'SQLite guide', 'Hidden architecture'),
                   ('document-3', 'documents-2', 'document', 'Other document', '');
                 INSERT INTO TASKS (
                   task_id, workspace_id, title, description, status_id, milestone_id, bucket_id
                 ) VALUES
                   ('task-1', 'tasks-1', 'Rust_task', '', 0, 'milestone-1', 'bucket-1'),
                   ('task-2', 'tasks-1', 'SQLite task', 'Hidden workflow', 0, 'milestone-1', 'bucket-1'),
                   ('task-3', 'tasks-2', 'Other task', '', 0, 'milestone-2', 'bucket-2');",
            )
            .unwrap();
        connection
    }

    #[test]
    fn search_log_crud_and_combined_suggestions_work() {
        let connection = connection();

        create_word(&connection, "word-1", "Rust").unwrap();
        create_word(&connection, "word-2", "Rust").unwrap();
        create_word(&connection, "word-3", "100%").unwrap();
        create_word(&connection, "word-4", "SQLite").unwrap();
        create_word(&connection, "word-5", "Guide").unwrap();
        create_word(&connection, "word-6", "Other").unwrap();
        for index in 1..=4 {
            create_word(
                &connection,
                &format!("common-word-{index}"),
                &format!("common search {index}"),
            )
            .unwrap();
        }
        create_document(&connection, "document-log-1", "document-1").unwrap();
        create_document(&connection, "document-log-2", "document-2").unwrap();
        create_document(&connection, "document-log-3", "document-3").unwrap();
        create_task(&connection, "task-log-1", "task-1").unwrap();
        create_task(&connection, "task-log-2", "task-2").unwrap();
        create_task(&connection, "task-log-3", "task-3").unwrap();
        connection
            .execute_batch(
                "UPDATE DOCUMENTS SET content = 'api method stable common'
                   WHERE document_id = 'document-1';
                 UPDATE DOCUMENTS SET content = 'api deprecated method common'
                   WHERE document_id = 'document-2';
                 UPDATE DOCUMENTS SET content = 'method common'
                   WHERE document_id = 'document-3';",
            )
            .unwrap();
        connection
            .execute_batch(
                "UPDATE TASKS SET description = 'api method stable common'
                   WHERE task_id = 'task-1';
                 UPDATE TASKS SET description = 'api deprecated method common'
                   WHERE task_id = 'task-2';
                 UPDATE TASKS SET description = 'method common'
                   WHERE task_id = 'task-3';",
            )
            .unwrap();

        assert_eq!(recent_words(&connection, "ru", None).unwrap().len(), 1);
        assert!(recent_words(&connection, "ust", None).unwrap().is_empty());
        assert_eq!(recent_words(&connection, "100%", None).unwrap().len(), 1);
        assert!(recent_documents(&connection, "r", None, None)
            .unwrap()
            .is_empty());
        assert!(recent_tasks(&connection, "r", None, None)
            .unwrap()
            .is_empty());
        assert_eq!(
            recent_documents(&connection, "100%", Some("documents-1"), None).unwrap()[0]
                .document_id,
            "document-1"
        );
        assert_eq!(
            recent_tasks(&connection, "rust_", Some("tasks-1"), None).unwrap()[0].task_id,
            "task-1"
        );
        assert_eq!(
            recent_documents(&connection, "deprecated", None, None).unwrap()[0].document_id,
            "document-2"
        );
        assert_eq!(
            recent_tasks(&connection, "deprecated", None, None).unwrap()[0].task_id,
            "task-2"
        );

        let one_character = suggestions(&connection, "r", None, Some(10)).unwrap();
        assert_eq!(one_character.len(), 1);
        assert_eq!(one_character[0].kind, "word");

        let combined = suggestions(&connection, "common", None, Some(10)).unwrap();
        assert_eq!(combined.len(), 10);
        assert_eq!(
            combined
                .iter()
                .map(|item| item.kind.as_str())
                .collect::<Vec<_>>(),
            [
                "word", "word", "word", "word", "task", "task", "task", "document", "document",
                "document"
            ]
        );

        assert_eq!(touch_word(&connection, "Rust").unwrap(), 2);
        assert_eq!(touch_document(&connection, "document-1").unwrap(), 1);
        assert_eq!(touch_task(&connection, "task-1").unwrap(), 1);
        assert_eq!(
            delete_by(&connection, "LOG_SEARCH_WORD", "search_word", "Rust").unwrap(),
            2
        );
        assert_eq!(
            delete_by(
                &connection,
                "LOG_SEARCH_DOCUMENT",
                "document_id",
                "document-1"
            )
            .unwrap(),
            1
        );
        assert_eq!(
            delete_by(&connection, "LOG_SEARCH_TASK", "task_id", "task-1").unwrap(),
            1
        );
    }

    #[test]
    fn fts_query_supports_delimiters_boolean_operators_and_phrases() {
        assert_eq!(
            build_fts_query("api method").unwrap().as_deref(),
            Some("\"api\" AND \"method\"")
        );
        assert_eq!(
            build_fts_query("api　method").unwrap().as_deref(),
            Some("\"api\" AND \"method\"")
        );
        assert_eq!(
            build_fts_query("api AND method").unwrap().as_deref(),
            Some("\"api\" AND \"method\"")
        );
        assert_eq!(
            build_fts_query("api OR method").unwrap().as_deref(),
            Some("\"api\" OR \"method\"")
        );
        assert_eq!(
            build_fts_query("api NOT deprecated").unwrap().as_deref(),
            Some("\"api\" NOT \"deprecated\"")
        );
        assert_eq!(
            build_fts_query("\"api method\"").unwrap().as_deref(),
            Some("\"api method\"")
        );
        assert!(build_fts_query("a").unwrap().is_none());
        assert!(build_fts_query("NOT api").is_err());
        assert!(build_fts_query("\"api method").is_err());
        assert!(build_fts_query("(api OR method").is_err());
    }

    #[test]
    fn recent_entities_apply_and_or_not_and_exact_phrase_searches() {
        let connection = connection();
        for (log_id, document_id) in [
            ("document-log-1", "document-1"),
            ("document-log-2", "document-2"),
            ("document-log-3", "document-3"),
        ] {
            create_document(&connection, log_id, document_id).unwrap();
        }
        for (log_id, task_id) in [
            ("task-log-1", "task-1"),
            ("task-log-2", "task-2"),
            ("task-log-3", "task-3"),
        ] {
            create_task(&connection, log_id, task_id).unwrap();
        }
        connection
            .execute_batch(
                "UPDATE DOCUMENTS SET content = 'api method stable'
                   WHERE document_id = 'document-1';
                 UPDATE DOCUMENTS SET content = 'api deprecated method'
                   WHERE document_id = 'document-2';
                 UPDATE DOCUMENTS SET content = 'method only'
                   WHERE document_id = 'document-3';
                 UPDATE TASKS SET description = 'api method stable'
                   WHERE task_id = 'task-1';
                 UPDATE TASKS SET description = 'api deprecated method'
                   WHERE task_id = 'task-2';
                 UPDATE TASKS SET description = 'method only'
                   WHERE task_id = 'task-3';",
            )
            .unwrap();

        for query in ["api method", "api　method", "api AND method"] {
            assert_eq!(
                recent_documents(&connection, query, None, None)
                    .unwrap()
                    .len(),
                2
            );
            assert_eq!(
                recent_tasks(&connection, query, None, None).unwrap().len(),
                2
            );
        }
        assert_eq!(
            recent_documents(&connection, "api OR method", None, None)
                .unwrap()
                .len(),
            3
        );
        assert_eq!(
            recent_tasks(&connection, "api OR method", None, None)
                .unwrap()
                .len(),
            3
        );
        assert_eq!(
            recent_documents(&connection, "api NOT deprecated", None, None).unwrap()[0].document_id,
            "document-1"
        );
        assert_eq!(
            recent_tasks(&connection, "api NOT deprecated", None, None).unwrap()[0].task_id,
            "task-1"
        );
        assert_eq!(
            recent_documents(&connection, "\"api method\"", None, None).unwrap()[0].document_id,
            "document-1"
        );
        assert_eq!(
            recent_tasks(&connection, "\"api method\"", None, None).unwrap()[0].task_id,
            "task-1"
        );
    }

    #[test]
    fn logs_reject_missing_or_logically_deleted_targets() {
        let connection = connection();
        connection
            .execute(
                "UPDATE DOCUMENTS SET deleted_at = datetime('now') WHERE document_id = 'document-1'",
                [],
            )
            .unwrap();
        connection
            .execute(
                "UPDATE TASKS SET deleted_at = datetime('now') WHERE task_id = 'task-1'",
                [],
            )
            .unwrap();

        assert!(create_word(&connection, "word", "  ").is_err());
        assert!(create_document(&connection, "document-log", "document-1").is_err());
        assert!(create_task(&connection, "task-log", "task-1").is_err());
        assert!(create_document(&connection, "document-log", "missing").is_err());
        assert!(create_task(&connection, "task-log", "missing").is_err());
    }

    #[test]
    fn prune_enforces_global_and_per_workspace_limits() {
        let connection = connection();
        for index in 1..=3 {
            create_word(
                &connection,
                &format!("word-{index}"),
                &format!("word {index}"),
            )
            .unwrap();
        }
        for (log_id, document_id) in [
            ("document-log-1", "document-1"),
            ("document-log-2", "document-2"),
            ("document-log-3", "document-1"),
            ("document-log-4", "document-3"),
        ] {
            create_document(&connection, log_id, document_id).unwrap();
        }
        for (log_id, task_id) in [
            ("task-log-1", "task-1"),
            ("task-log-2", "task-2"),
            ("task-log-3", "task-1"),
            ("task-log-4", "task-3"),
        ] {
            create_task(&connection, log_id, task_id).unwrap();
        }

        prune(&connection, Some(2), Some(180)).unwrap();

        let word_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM LOG_SEARCH_WORD", [], |row| row.get(0))
            .unwrap();
        assert_eq!(word_count, 2);
        for (table, entity_table, entity_id) in [
            ("LOG_SEARCH_DOCUMENT", "DOCUMENTS", "document_id"),
            ("LOG_SEARCH_TASK", "TASKS", "task_id"),
        ] {
            let first_workspace_count: i64 = connection
                .query_row(
                    &format!(
                        "SELECT COUNT(*) FROM {table} log
                         JOIN {entity_table} entity ON entity.{entity_id} = log.{entity_id}
                         WHERE entity.workspace_id IN ('documents-1', 'tasks-1')"
                    ),
                    [],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(first_workspace_count, 2);
        }
    }

    #[test]
    fn migration_adds_and_backfills_search_log_timestamps() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch(
                "CREATE TABLE LOG_SEARCH_WORD (
                   log_id TEXT PRIMARY KEY,
                   search_word TEXT NOT NULL,
                   created_at TEXT NOT NULL
                 );
                 CREATE TABLE LOG_SEARCH_DOCUMENT (
                   log_id TEXT NOT NULL,
                   document_id TEXT NOT NULL,
                   PRIMARY KEY (log_id, document_id)
                 );
                 INSERT INTO LOG_SEARCH_WORD VALUES ('word-1', 'Rust', '2026-01-01');
                 INSERT INTO LOG_SEARCH_DOCUMENT VALUES ('log-1', 'document-1');",
            )
            .unwrap();

        crate::database_migrations::add_search_log_timestamps(&connection).unwrap();
        crate::database_migrations::add_search_log_timestamps(&connection).unwrap();

        let last_searched_at: String = connection
            .query_row("SELECT last_searched_at FROM LOG_SEARCH_WORD", [], |row| {
                row.get(0)
            })
            .unwrap();
        let accessed_at: String = connection
            .query_row("SELECT accessed_at FROM LOG_SEARCH_DOCUMENT", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(last_searched_at, "2026-01-01");
        assert!(!accessed_at.is_empty());
    }
}
