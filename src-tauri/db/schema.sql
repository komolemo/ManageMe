PRAGMA foreign_keys = ON;

-- Workspace. / ワークスペース。
-- PROJECTS is deprecated; project-only columns are merged into WORKSPACE.
-- PROJECTSは廃止済みで、プロジェクト固有の列はWORKSPACEへ統合する。
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
-- バケット。バケットでグループ化する際のボード列として使用する。
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
-- 各ワークスペース内のバケット表示順。
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

-- Milestone. / マイルストーン。
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
-- 各ワークスペース内のマイルストーン表示順。
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
-- グローバルなタグマスター。タグはワークスペースに所属しない。
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
-- ドキュメントから抽出した特徴的な名詞の辞書。
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

-- URL reference. / URL参照。
CREATE TABLE IF NOT EXISTS URL_REFERENCES (
  reference_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Document entity and its body content.
-- ドキュメントエンティティとその本文。
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

-- workspace_type: 1 = Document Workspace, 0 = Task Workspace.
-- workspace_type: 1 = Documentワークスペース、0 = Taskワークスペース。
CREATE TRIGGER IF NOT EXISTS validate_document_workspace
BEFORE INSERT ON DOCUMENTS
WHEN NOT EXISTS (
  SELECT 1
  FROM WORKSPACE
  WHERE workspace_id = NEW.workspace_id
    AND workspace_type = 1
)
BEGIN
  SELECT RAISE(ABORT, 'DOCUMENTS must belong to a Document Workspace');
END;

CREATE TRIGGER IF NOT EXISTS validate_document_workspace_update
BEFORE UPDATE OF workspace_id ON DOCUMENTS
WHEN NOT EXISTS (
  SELECT 1
  FROM WORKSPACE
  WHERE workspace_id = NEW.workspace_id
    AND workspace_type = 1
)
BEGIN
  SELECT RAISE(ABORT, 'DOCUMENTS must belong to a Document Workspace');
END;

-- Independent Task entity. Documents may reference Tasks through
-- DOCUMENT_TASK_REFERENCES, but neither entity owns the other.
-- 独立したTaskエンティティ。DocumentはDOCUMENT_TASK_REFERENCESを介してTaskを
-- 参照できるが、いずれのエンティティも他方を所有しない。
CREATE TABLE IF NOT EXISTS TASKS (
  task_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  due_date TEXT,
  status_id INTEGER NOT NULL CHECK(status_id IN (0, 50, 100)),
  priority_id INTEGER NOT NULL DEFAULT 0 CHECK(priority_id IN (0, 1, 2, 3)),
  complete_percentage INTEGER NOT NULL DEFAULT 0 CHECK(complete_percentage >= 0 AND complete_percentage <= 100),
  milestone_id TEXT NOT NULL DEFAULT '0',
  bucket_id TEXT NOT NULL DEFAULT '0',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  FOREIGN KEY (workspace_id) REFERENCES WORKSPACE(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id),
  FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id)
);

CREATE TRIGGER IF NOT EXISTS validate_task_workspace
BEFORE INSERT ON TASKS
WHEN NOT EXISTS (
  SELECT 1
  FROM WORKSPACE
  WHERE workspace_id = NEW.workspace_id
    AND workspace_type = 0
)
BEGIN
  SELECT RAISE(ABORT, 'TASKS must belong to a Task Workspace');
END;

CREATE TRIGGER IF NOT EXISTS validate_task_workspace_update
BEFORE UPDATE OF workspace_id ON TASKS
WHEN NOT EXISTS (
  SELECT 1
  FROM WORKSPACE
  WHERE workspace_id = NEW.workspace_id
    AND workspace_type = 0
)
BEGIN
  SELECT RAISE(ABORT, 'TASKS must belong to a Task Workspace');
END;

-- Keep a Task's cached status paired with its Bucket.
CREATE TRIGGER IF NOT EXISTS trg_tasks_insert_bucket_status
AFTER INSERT ON TASKS
BEGIN
  UPDATE TASKS
  SET status_id = (
    SELECT status_type FROM BUCKETS WHERE bucket_id = NEW.bucket_id
  )
  WHERE task_id = NEW.task_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tasks_bucket_status
AFTER UPDATE OF bucket_id ON TASKS
BEGIN
  UPDATE TASKS
  SET status_id = (
        SELECT status_type FROM BUCKETS WHERE bucket_id = NEW.bucket_id
      ),
      updated_at = datetime('now')
  WHERE task_id = NEW.task_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tasks_status_bucket
AFTER UPDATE OF status_id ON TASKS
WHEN NEW.status_id <> (
  SELECT status_type FROM BUCKETS WHERE bucket_id = NEW.bucket_id
)
BEGIN
  UPDATE TASKS
  SET bucket_id = (
        SELECT bucket.bucket_id
        FROM BUCKETS bucket
        JOIN BUCKET_ORDER bucket_order
          ON bucket_order.workspace_id = bucket.workspace_id
         AND bucket_order.bucket_id = bucket.bucket_id
        WHERE bucket.workspace_id = NEW.workspace_id
          AND bucket.status_type = NEW.status_id
        ORDER BY bucket_order.order_hint COLLATE BINARY, bucket.bucket_id
        LIMIT 1
      ),
      updated_at = datetime('now')
  WHERE task_id = NEW.task_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_buckets_status_type_tasks
AFTER UPDATE OF status_type ON BUCKETS
BEGIN
  UPDATE TASKS
  SET status_id = NEW.status_type,
      updated_at = datetime('now')
  WHERE bucket_id = NEW.bucket_id;
END;

-- Reusable document component. / 再利用可能なドキュメントコンポーネント。
CREATE TABLE IF NOT EXISTS COMPONENTS (
  component_id TEXT PRIMARY KEY,
  source_document_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_document_id) REFERENCES DOCUMENTS(document_id) ON DELETE SET NULL
);

-- ================================================================
-- Bind and relationship tables / バインド・関連テーブル

-- Board order for each workspace and board grouping.
-- ワークスペースおよびボードグループごとのTask表示順。
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

-- Parent-child hierarchy between Tasks. Each Task can have at most one parent.
-- Task間の親子階層。各Taskが持てる親Taskは最大1件。
CREATE TABLE IF NOT EXISTS TASK_RELATIVE_BIND (
  parent_task_id TEXT NOT NULL,
  child_task_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (parent_task_id, child_task_id),
  FOREIGN KEY (parent_task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (child_task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  CHECK (parent_task_id <> child_task_id),
  UNIQUE (child_task_id),
  UNIQUE (parent_task_id, display_order)
);

-- Tags assigned to Documents. / Documentに割り当てられたタグ。
CREATE TABLE IF NOT EXISTS DOCUMENT_TAG_BIND (
  document_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (document_id, tag_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
);

-- Document hierarchy. A document may have many child documents.
-- Documentの親子階層。1件のDocumentは複数の子Documentを持てる。
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
-- ワークスペースおよび任意の親Document内におけるDocument表示順。
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

-- URL references assigned to Tasks. / Taskに割り当てられたURL参照。
CREATE TABLE IF NOT EXISTS TASK_REFERENCE_BIND (
  task_id TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  PRIMARY KEY (task_id, reference_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (reference_id) REFERENCES URL_REFERENCES(reference_id) ON DELETE CASCADE
);

-- Components embedded in Documents. / Documentに埋め込まれたコンポーネント。
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
-- Documentに埋め込まれたTaskブロック。同じTaskを複数回配置できるため、
-- 配置ごとに固有のreference_idを持つ。
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

-- Dictionary words associated with Documents.
-- Documentに関連付けられた辞書語。
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
-- History tables / 履歴テーブル

-- Search-word history. / 検索語の履歴。
CREATE TABLE IF NOT EXISTS LOG_SEARCH_WORD (
  log_id TEXT PRIMARY KEY,
  search_word TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_searched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Document search history. / Document検索の履歴。
CREATE TABLE IF NOT EXISTS LOG_SEARCH_DOCUMENT (
  log_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (log_id, document_id),
  FOREIGN KEY (document_id) REFERENCES DOCUMENTS(document_id) ON DELETE CASCADE
);

-- Task search history. / Task検索の履歴。
CREATE TABLE IF NOT EXISTS LOG_SEARCH_TASK (
  log_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (log_id, task_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE
);

-- Full-text search indexes. IDs and Workspace IDs are stored for filtering
-- and navigation, but are not tokenized.
CREATE VIRTUAL TABLE IF NOT EXISTS TASK_SEARCH_FTS USING fts5(
  task_id UNINDEXED,
  workspace_id UNINDEXED,
  title,
  description,
  tokenize = 'unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS DOCUMENT_SEARCH_FTS USING fts5(
  document_id UNINDEXED,
  workspace_id UNINDEXED,
  title,
  content,
  tokenize = 'unicode61'
);

-- Backfill active entities when the FTS tables are first introduced.
INSERT INTO TASK_SEARCH_FTS (task_id, workspace_id, title, description)
SELECT task_id, workspace_id, title, description
FROM TASKS task
WHERE task.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM TASK_SEARCH_FTS search
    WHERE search.task_id = task.task_id
  );

INSERT INTO DOCUMENT_SEARCH_FTS (document_id, workspace_id, title, content)
SELECT document_id, workspace_id, title, COALESCE(content, '')
FROM DOCUMENTS document
WHERE document.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM DOCUMENT_SEARCH_FTS search
    WHERE search.document_id = document.document_id
  );

CREATE TRIGGER IF NOT EXISTS trg_tasks_search_fts_insert
AFTER INSERT ON TASKS
WHEN NEW.deleted_at IS NULL
BEGIN
  INSERT INTO TASK_SEARCH_FTS (task_id, workspace_id, title, description)
  VALUES (NEW.task_id, NEW.workspace_id, NEW.title, NEW.description);
END;

CREATE TRIGGER IF NOT EXISTS trg_tasks_search_fts_update
AFTER UPDATE OF workspace_id, title, description, deleted_at ON TASKS
BEGIN
  DELETE FROM TASK_SEARCH_FTS WHERE task_id = OLD.task_id;
  INSERT INTO TASK_SEARCH_FTS (task_id, workspace_id, title, description)
  SELECT NEW.task_id, NEW.workspace_id, NEW.title, NEW.description
  WHERE NEW.deleted_at IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS trg_tasks_search_fts_delete
AFTER DELETE ON TASKS
BEGIN
  DELETE FROM TASK_SEARCH_FTS WHERE task_id = OLD.task_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_documents_search_fts_insert
AFTER INSERT ON DOCUMENTS
WHEN NEW.deleted_at IS NULL
BEGIN
  INSERT INTO DOCUMENT_SEARCH_FTS (document_id, workspace_id, title, content)
  VALUES (NEW.document_id, NEW.workspace_id, NEW.title, COALESCE(NEW.content, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_documents_search_fts_update
AFTER UPDATE OF workspace_id, title, content, deleted_at ON DOCUMENTS
BEGIN
  DELETE FROM DOCUMENT_SEARCH_FTS WHERE document_id = OLD.document_id;
  INSERT INTO DOCUMENT_SEARCH_FTS (document_id, workspace_id, title, content)
  SELECT NEW.document_id, NEW.workspace_id, NEW.title, COALESCE(NEW.content, '')
  WHERE NEW.deleted_at IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS trg_documents_search_fts_delete
AFTER DELETE ON DOCUMENTS
BEGIN
  DELETE FROM DOCUMENT_SEARCH_FTS WHERE document_id = OLD.document_id;
END;

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
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON TASKS(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_updated_at ON TASKS(workspace_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON TASKS(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON TASKS(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_bucket_id ON TASKS(bucket_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON TASKS(priority_id);
CREATE INDEX IF NOT EXISTS idx_components_source_document_id ON COMPONENTS(source_document_id);
CREATE INDEX IF NOT EXISTS idx_workspace_type_updated_at ON WORKSPACE(workspace_type, updated_at);
CREATE INDEX IF NOT EXISTS idx_workspace_type_deleted_updated_at ON WORKSPACE(workspace_type, deleted_at, updated_at);

-- Bind Table Indexes
CREATE INDEX IF NOT EXISTS idx_task_board_order_group ON TASK_BOARD_ORDER(workspace_id, board_group_type, board_group_id, order_hint);
CREATE INDEX IF NOT EXISTS idx_task_board_order_task_id ON TASK_BOARD_ORDER(task_id);
CREATE INDEX IF NOT EXISTS idx_task_relative_bind_parent ON TASK_RELATIVE_BIND(parent_task_id, display_order);
CREATE INDEX IF NOT EXISTS idx_task_relative_bind_child ON TASK_RELATIVE_BIND(child_task_id);
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
CREATE INDEX IF NOT EXISTS idx_log_search_word_last_searched_at ON LOG_SEARCH_WORD(last_searched_at);
CREATE INDEX IF NOT EXISTS idx_log_search_document_log_id ON LOG_SEARCH_DOCUMENT(log_id);
CREATE INDEX IF NOT EXISTS idx_log_search_document_document_id ON LOG_SEARCH_DOCUMENT(document_id);
CREATE INDEX IF NOT EXISTS idx_log_search_document_accessed_at ON LOG_SEARCH_DOCUMENT(accessed_at);
CREATE INDEX IF NOT EXISTS idx_log_search_task_log_id ON LOG_SEARCH_TASK(log_id);
CREATE INDEX IF NOT EXISTS idx_log_search_task_task_id ON LOG_SEARCH_TASK(task_id);
CREATE INDEX IF NOT EXISTS idx_log_search_task_accessed_at ON LOG_SEARCH_TASK(accessed_at);

PRAGMA user_version = 20;
