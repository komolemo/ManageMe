PRAGMA foreign_keys = ON;

-- Workspace.
-- PROJECTS is deprecated; project-only columns are merged into WORKSPACE.
CREATE TABLE IF NOT EXISTS WORKSPACE (
  workspace_id TEXT PRIMARY KEY,
  workspace_key TEXT NOT NULL UNIQUE,
  workspace_type INTEGER NOT NULL CHECK (workspace_type IN (0, 1)),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_id TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Bucket. Used as board columns when grouping by bucket.
CREATE TABLE IF NOT EXISTS BUCKETS (
  bucket_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status_type INTEGER NOT NULL CHECK (status_type IN (0, 50, 100)),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  UNIQUE (workspace_id, display_order)
);

-- Display order of buckets within each workspace.
CREATE TABLE IF NOT EXISTS BUCKET_ORDER (
  workspace_id TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  order_hint TEXT NOT NULL COLLATE BINARY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, bucket_id),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO BUCKET_ORDER (
  workspace_id,
  bucket_id,
  order_hint
)
SELECT
  workspace_id,
  bucket_id,
  printf('%020d', display_order)
FROM BUCKETS;

-- Milestone
CREATE TABLE IF NOT EXISTS MILESTONES (
  milestone_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  UNIQUE (workspace_id, display_order)
);

-- Display order of milestones within each workspace.
CREATE TABLE IF NOT EXISTS MILESTONE_ORDER (
  workspace_id TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  order_hint TEXT NOT NULL COLLATE BINARY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, milestone_id),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id) ON DELETE CASCADE
);

-- Backfill order rows when upgrading databases that stored the order directly
-- on MILESTONES.
INSERT OR IGNORE INTO MILESTONE_ORDER (
  workspace_id,
  milestone_id,
  order_hint
)
SELECT
  workspace_id,
  milestone_id,
  printf('%020d', display_order)
FROM MILESTONES;

-- Global tag master. Tags do not belong to a workspace.
CREATE TABLE IF NOT EXISTS TAGS (
  tag_id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_id INTEGER,
  description TEXT,
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dictionary of distinctive nouns extracted from documents.
CREATE TABLE IF NOT EXISTS DICTIONARY_WORDS (
  dictionary_word_id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  normalized_word TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL DEFAULT 'ai' CHECK (created_by IN ('ai', 'user')),
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  UNIQUE (normalized_word)
);

-- URL reference
CREATE TABLE IF NOT EXISTS URL_REFERENCES (
  reference_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Shared document body for Document pages and Tasks.
CREATE TABLE IF NOT EXISTS DOCUMENTS (
  document_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('task', 'document')),
  title TEXT NOT NULL,
  content TEXT,
  icon_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE
);

-- Task-specific information.
-- The task_id remains the primary key; document_id links to the shared document.
CREATE TABLE IF NOT EXISTS TASKS (
  task_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  due_date TEXT,
  status_id TEXT,
  priority_id INTEGER NOT NULL DEFAULT 0 CHECK(priority_id IN (0, 1, 2, 3)),
  complete_percentage INTEGER NOT NULL DEFAULT 0 CHECK(complete_percentage >= 0 AND complete_percentage <= 100),
  milestone_id TEXT NOT NULL DEFAULT '0',
  bucket_id TEXT NOT NULL DEFAULT '0',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id),
  FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id)
);

-- Global UI settings.
CREATE TABLE IF NOT EXISTS VIEW_SETTINGS (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Global application settings.
CREATE TABLE IF NOT EXISTS APP_SETTING (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workspace-scoped UI settings.
CREATE TABLE IF NOT EXISTS WORKSPACE_VIEW_SETTINGS (
  workspace_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, setting_key),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS COMPONENTS (
  component_id TEXT PRIMARY KEY,
  source_document_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_document_id) REFERENCES DOCUMENTS(document_id) ON DELETE SET NULL
);

-- ================================================================
-- Bind and relationship tables

-- Board order for each workspace and board grouping.
CREATE TABLE IF NOT EXISTS TASK_BOARD_ORDER (
  workspace_id TEXT NOT NULL,
  board_group_type TEXT NOT NULL CHECK (board_group_type IN ('status', 'bucket')),
  board_group_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  order_hint TEXT NOT NULL COLLATE BINARY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, board_group_type, board_group_id, task_id),
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DOCUMENT_TAG_BIND (
  document_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (document_id, tag_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
);

-- Document hierarchy. A document may have many child documents.
CREATE TABLE IF NOT EXISTS DOCUMENT_RELATIVE_BIND (
  parent_document_id TEXT NOT NULL,
  child_document_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (parent_document_id, child_document_id),
  FOREIGN KEY (parent_document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (child_document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  CHECK (parent_document_id <> child_document_id),
  UNIQUE (child_document_id),
  UNIQUE (parent_document_id, display_order)
);

-- Display order of Documents within a workspace and optional parent Document.
CREATE TABLE IF NOT EXISTS DOCUMENT_ORDER (
  document_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  parent_document_id TEXT,
  order_hint TEXT NOT NULL COLLATE BINARY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  CHECK (parent_document_id IS NULL OR parent_document_id <> document_id)
);

INSERT OR IGNORE INTO DOCUMENT_ORDER (
  document_id,
  workspace_id,
  parent_document_id,
  order_hint
)
SELECT
  document.document_id,
  document.workspace_id,
  relation.parent_document_id,
  printf(
    '%020d',
    ROW_NUMBER() OVER (
      PARTITION BY document.workspace_id, relation.parent_document_id
      ORDER BY COALESCE(relation.display_order, 0), document.document_id
    ) - 1
  )
FROM DOCUMENTS document
LEFT JOIN DOCUMENT_RELATIVE_BIND relation
  ON relation.child_document_id = document.document_id;

CREATE TRIGGER IF NOT EXISTS trg_documents_insert_order
AFTER INSERT ON DOCUMENTS
BEGIN
  INSERT INTO DOCUMENT_ORDER (
    document_id,
    workspace_id,
    parent_document_id,
    order_hint
  )
  VALUES (
    NEW.document_id,
    NEW.workspace_id,
    NULL,
    COALESCE(
      (
        SELECT order_hint || 'V'
        FROM DOCUMENT_ORDER
        WHERE workspace_id = NEW.workspace_id
          AND parent_document_id IS NULL
        ORDER BY order_hint COLLATE BINARY DESC, document_id DESC
        LIMIT 1
      ),
      'V'
    )
  );
END;

CREATE TABLE IF NOT EXISTS TASK_REFERENCE_BIND (
  task_id TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  PRIMARY KEY (task_id, reference_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (reference_id) REFERENCES URL_REFERENCES(reference_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DOCUMENT_COMPONENT_BIND (
  document_id TEXT NOT NULL,
  component_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, component_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES COMPONENTS(component_id) ON DELETE CASCADE
);

-- Task blocks embedded in Documents. A Task may appear more than once in a
-- Document, so each placement has its own reference_id.
CREATE TABLE IF NOT EXISTS DOCUMENT_TASK_REFERENCES (
  reference_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  block_id TEXT NOT NULL,
  position INTEGER CHECK (position IS NULL OR position >= 0),
  display_config TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  UNIQUE (document_id, block_id)
);

CREATE TABLE IF NOT EXISTS DOCUMENT_DICTIONARY_WORD_BIND (
  document_id TEXT NOT NULL,
  dictionary_word_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'user')),
  occurrence_count INTEGER NOT NULL DEFAULT 1 CHECK (occurrence_count >= 0),
  first_position INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, dictionary_word_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (dictionary_word_id) REFERENCES DICTIONARY_WORDS(dictionary_word_id) ON DELETE CASCADE
);

-- ================================================================
-- History tables

CREATE TABLE IF NOT EXISTS LOG_SEARCH_WORD (
  log_id TEXT PRIMARY KEY,
  search_word TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS LOG_SEARCH_DOCUMENT (
  log_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  PRIMARY KEY (log_id, document_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE
);

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_buckets_workspace_id ON BUCKETS(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bucket_order_workspace_hint ON BUCKET_ORDER(workspace_id, order_hint);
CREATE INDEX IF NOT EXISTS idx_bucket_order_bucket_id ON BUCKET_ORDER(bucket_id);
CREATE INDEX IF NOT EXISTS idx_milestones_workspace_id ON MILESTONES(workspace_id);
CREATE INDEX IF NOT EXISTS idx_milestone_order_workspace_hint ON MILESTONE_ORDER(workspace_id, order_hint);
CREATE INDEX IF NOT EXISTS idx_milestone_order_milestone_id ON MILESTONE_ORDER(milestone_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_words_word ON DICTIONARY_WORDS(word);
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON DOCUMENTS(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_workspace_updated_at ON DOCUMENTS(workspace_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_documents_type ON DOCUMENTS(document_type);
CREATE INDEX IF NOT EXISTS idx_tasks_document_id ON TASKS(document_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON TASKS(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_bucket_id ON TASKS(bucket_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON TASKS(priority_id);
CREATE INDEX IF NOT EXISTS idx_components_source_document_id ON COMPONENTS(source_document_id);
CREATE INDEX IF NOT EXISTS idx_workspace_type_updated_at ON WORKSPACE(workspace_type, updated_at);
CREATE INDEX IF NOT EXISTS idx_workspace_type_deleted_updated_at ON WORKSPACE(workspace_type, deleted_at, updated_at);

-- Bind Table Indexes
CREATE INDEX IF NOT EXISTS idx_task_board_order_group ON TASK_BOARD_ORDER(workspace_id, board_group_type, board_group_id, order_hint);
CREATE INDEX IF NOT EXISTS idx_task_board_order_task_id ON TASK_BOARD_ORDER(task_id);
CREATE INDEX IF NOT EXISTS idx_document_tag_bind_document_id ON DOCUMENT_TAG_BIND(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tag_bind_tag_id ON DOCUMENT_TAG_BIND(tag_id);
CREATE INDEX IF NOT EXISTS idx_document_relative_bind_parent ON DOCUMENT_RELATIVE_BIND(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_document_relative_bind_child ON DOCUMENT_RELATIVE_BIND(child_document_id);
CREATE INDEX IF NOT EXISTS idx_document_order_context_hint ON DOCUMENT_ORDER(workspace_id, parent_document_id, order_hint);
CREATE INDEX IF NOT EXISTS idx_document_order_parent_id ON DOCUMENT_ORDER(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_task_reference_bind_task_id ON TASK_REFERENCE_BIND(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reference_bind_reference_id ON TASK_REFERENCE_BIND(reference_id);
CREATE INDEX IF NOT EXISTS idx_document_component_bind_component_id ON DOCUMENT_COMPONENT_BIND(component_id);
CREATE INDEX IF NOT EXISTS idx_document_task_references_document_id ON DOCUMENT_TASK_REFERENCES(document_id);
CREATE INDEX IF NOT EXISTS idx_document_task_references_task_id ON DOCUMENT_TASK_REFERENCES(task_id);
CREATE INDEX IF NOT EXISTS idx_document_task_references_document_position ON DOCUMENT_TASK_REFERENCES(document_id, position);
CREATE INDEX IF NOT EXISTS idx_document_dictionary_word_bind_word_id ON DOCUMENT_DICTIONARY_WORD_BIND(dictionary_word_id);

-- History Table Indexes
CREATE INDEX IF NOT EXISTS idx_log_search_word_search_word ON LOG_SEARCH_WORD(search_word);
CREATE INDEX IF NOT EXISTS idx_log_search_word_created_at ON LOG_SEARCH_WORD(created_at);
CREATE INDEX IF NOT EXISTS idx_log_search_document_log_id ON LOG_SEARCH_DOCUMENT(log_id);
CREATE INDEX IF NOT EXISTS idx_log_search_document_document_id ON LOG_SEARCH_DOCUMENT(document_id);

PRAGMA user_version = 17;
