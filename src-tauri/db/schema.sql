PRAGMA foreign_keys = ON;

-- Project
CREATE TABLE IF NOT EXISTS PROJECTS (
  project_id TEXT PRIMARY KEY,
  project_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color_id INTEGER,
  icon_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tag color master
CREATE TABLE IF NOT EXISTS TAG_COLORS (
  color_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  background_value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Task priority master
CREATE TABLE IF NOT EXISTS MASTER_TASK_PRIORITY (
  priority_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Bucket. Used as board columns when grouping by bucket.
CREATE TABLE IF NOT EXISTS BUCKETS (
  bucket_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status_type INTEGER NOT NULL CHECK (status_type IN (0, 50, 100)),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
  UNIQUE (project_id, display_order)
);

-- Milestone
CREATE TABLE IF NOT EXISTS MILESTONES (
  milestone_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
  UNIQUE (project_id, display_order)
);

-- Global tag master. Tags do not belong to a project.
CREATE TABLE IF NOT EXISTS TAGS (
  tag_id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_id INTEGER,
  description TEXT,
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (color_id) REFERENCES TAG_COLORS(color_id) ON DELETE SET NULL
);

-- URL reference
CREATE TABLE IF NOT EXISTS URL_REFERENCES (
  reference_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Task.
-- display_order is the project grid order. Board and child order are stored separately.
CREATE TABLE IF NOT EXISTS TASKS (
  task_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  start_date TEXT,
  due_date TEXT,
  priority_id INTEGER NOT NULL DEFAULT 0 CHECK(priority_id IN (0, 1, 2, 3)),
  complete_percentage INTEGER NOT NULL DEFAULT 0 CHECK(complete_percentage >= 0 AND complete_percentage <= 100),
  milestone_id TEXT NOT NULL DEFAULT '0',
  bucket_id TEXT NOT NULL DEFAULT '0',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES MILESTONES(milestone_id),
  FOREIGN KEY (bucket_id) REFERENCES BUCKETS(bucket_id),
  FOREIGN KEY (priority_id) REFERENCES MASTER_TASK_PRIORITY(priority_id)
);

-- Workplace
CREATE TABLE IF NOT EXISTS WORKPLACE (
  workplace_id TEXT PRIMARY KEY,
  name TEXT,
  icon_id TEXT,
  is_favorite INTEGER NOT NULL CHECK (is_favorite IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Wiki
CREATE TABLE IF NOT EXISTS WIKI (
  wiki_id TEXT PRIMARY KEY,
  workplace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workplace_id) REFERENCES WORKPLACE(workplace_id) ON DELETE CASCADE
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

-- Project-scoped UI settings.
CREATE TABLE IF NOT EXISTS PROJECT_VIEW_SETTINGS (
  project_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (project_id, setting_key),
  FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id) ON DELETE CASCADE
);

CREATE TABLE COMPONENTS (
  component_id TEXT PRIMARY KEY,
  source_wiki_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_wiki_id) REFERENCES WIKI(wiki_id) ON DELETE SET NULL
);

-- ================================================================
-- Bind and relationship tables

-- Board order for each project and board grouping.
CREATE TABLE IF NOT EXISTS TASK_BOARD_ORDER (
  project_id TEXT NOT NULL,
  board_group_type TEXT NOT NULL CHECK (board_group_type IN ('status', 'bucket')),
  board_group_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (project_id, board_group_type, board_group_id, task_id),
  FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  UNIQUE (project_id, board_group_type, board_group_id, display_order)
);

CREATE TABLE IF NOT EXISTS TASK_TAG_BIND (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
);

-- Task hierarchy. A task may have many child tasks.
CREATE TABLE IF NOT EXISTS TASK_RELATIVE_BIND (
  parent_task_id TEXT NOT NULL,
  sub_task_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (parent_task_id, sub_task_id),
  FOREIGN KEY (parent_task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (sub_task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  CHECK (parent_task_id <> sub_task_id),
  UNIQUE (sub_task_id),
  UNIQUE (parent_task_id, display_order)
);

CREATE TABLE IF NOT EXISTS TASK_REFERENCE_BIND (
  task_id TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  PRIMARY KEY (task_id, reference_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (reference_id) REFERENCES URL_REFERENCES(reference_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TASK_WIKI_BIND (
  task_id TEXT NOT NULL,
  wiki_id TEXT NOT NULL,
  PRIMARY KEY (task_id, wiki_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE,
  FOREIGN KEY (wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE,
  UNIQUE (task_id),
  UNIQUE (wiki_id)
);

CREATE TABLE IF NOT EXISTS WIKI_TAG_BIND (
  wiki_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (wiki_id, tag_id),
  FOREIGN KEY (wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id) ON DELETE CASCADE
);

-- Wiki hierarchy. A wiki page may have many child wiki pages.
CREATE TABLE IF NOT EXISTS WIKI_RELATIVE_BIND (
  parent_wiki_id TEXT NOT NULL,
  child_wiki_id TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (parent_wiki_id, child_wiki_id),
  FOREIGN KEY (parent_wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE,
  FOREIGN KEY (child_wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE,
  CHECK (parent_wiki_id <> child_wiki_id),
  UNIQUE (child_wiki_id),
  UNIQUE (parent_wiki_id, display_order)
);

CREATE TABLE WIKI_COMPONENT_BIND (
  wiki_id TEXT NOT NULL,
  component_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (wiki_id, component_id),
  FOREIGN KEY (wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE,
  FOREIGN KEY (component_id) REFERENCES COMPONENTS(component_id) ON DELETE CASCADE
);

-- ================================================================
-- History tables

CREATE TABLE IF NOT EXISTS LOG_SEARCH_TASK (
  log_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  PRIMARY KEY (log_id, task_id),
  FOREIGN KEY (task_id) REFERENCES TASKS(task_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LOG_SEARCH_WIKI (
  log_id TEXT NOT NULL,
  wiki_id TEXT NOT NULL,
  PRIMARY KEY (log_id, wiki_id),
  FOREIGN KEY (wiki_id) REFERENCES WIKI(wiki_id) ON DELETE CASCADE
);

-- Initial master data
INSERT OR IGNORE INTO TAG_COLORS (color_id, name, value, background_value, display_order) VALUES
  (1, 'Red', '#ef4444', '#fee2e2', 1),
  (2, 'Orange', '#f97316', '#ffedd5', 2),
  (3, 'Yellow', '#eab308', '#fef9c3', 3),
  (4, 'Lime', '#84cc16', '#ecfccb', 4),
  (5, 'Green', '#22c55e', '#dcfce7', 5),
  (6, 'Light Blue', '#38bdf8', '#e0f2fe', 6),
  (7, 'Blue', '#3b82f6', '#dbeafe', 7),
  (8, 'Navy', '#1e3a8a', '#dbeafe', 8),
  (9, 'Purple', '#8b5cf6', '#ede9fe', 9),
  (10, 'Pink', '#ec4899', '#fce7f3', 10),
  (11, 'White', '#d1d5db', '#ffffff', 11),
  (12, 'Gray', '#6b7280', '#f3f4f6', 12),
  (13, 'Brown', '#92400e', '#fef3c7', 13),
  (14, 'Dark Gray', '#374151', '#e5e7eb', 14);

INSERT OR IGNORE INTO MASTER_TASK_PRIORITY (priority_id, name, display_order) VALUES
  (0, 'Low', 3),
  (1, 'Medium', 2),
  (2, 'High', 1),
  (3, 'Emergency', 0);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON TASKS(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON TASKS(priority_id);
-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_buckets_project_id ON BUCKETS(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON MILESTONES(project_id);
CREATE INDEX IF NOT EXISTS idx_tags_color_id ON TAGS(color_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON TASKS(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_bucket_id ON TASKS(bucket_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON TASKS(priority_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON TASKS(project_id);
CREATE INDEX IF NOT EXISTS idx_wiki_workplace_id ON WIKI(workplace_id);
CREATE INDEX IF NOT EXISTS idx_wiki_workplace_updated_at ON WIKI(workplace_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_components_source_wiki_id ON COMPONENTS(source_wiki_id);

-- Bind Table Indexes
CREATE INDEX IF NOT EXISTS idx_task_board_order_group ON TASK_BOARD_ORDER(project_id, board_group_type, board_group_id);
CREATE INDEX IF NOT EXISTS idx_task_board_order_task_id ON TASK_BOARD_ORDER(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tag_bind_task_id ON TASK_TAG_BIND(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tag_bind_tag_id ON TASK_TAG_BIND(tag_id);
CREATE INDEX IF NOT EXISTS idx_task_relative_bind_parent ON TASK_RELATIVE_BIND(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_relative_bind_sub ON TASK_RELATIVE_BIND(sub_task_id);
CREATE INDEX IF NOT EXISTS idx_task_reference_bind_task_id ON TASK_REFERENCE_BIND(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reference_bind_reference_id ON TASK_REFERENCE_BIND(reference_id);
CREATE INDEX IF NOT EXISTS idx_task_wiki_bind_task_id ON TASK_WIKI_BIND(task_id);
CREATE INDEX IF NOT EXISTS idx_task_wiki_bind_wiki_id ON TASK_WIKI_BIND(wiki_id);
CREATE INDEX IF NOT EXISTS idx_wiki_tag_bind_wiki_id ON WIKI_TAG_BIND(wiki_id);
CREATE INDEX IF NOT EXISTS idx_wiki_tag_bind_tag_id ON WIKI_TAG_BIND(tag_id);
CREATE INDEX IF NOT EXISTS idx_wiki_relative_bind_parent ON WIKI_RELATIVE_BIND(parent_wiki_id);
CREATE INDEX IF NOT EXISTS idx_wiki_relative_bind_child ON WIKI_RELATIVE_BIND(child_wiki_id);
CREATE INDEX IF NOT EXISTS idx_wiki_component_bind_component_id ON WIKI_COMPONENT_BIND(component_id);

-- History Table Indexes
CREATE INDEX IF NOT EXISTS idx_log_search_task_log_id ON LOG_SEARCH_TASK(log_id);
CREATE INDEX IF NOT EXISTS idx_log_search_task_task_id ON LOG_SEARCH_TASK(task_id);
CREATE INDEX IF NOT EXISTS idx_log_search_wiki_log_id ON LOG_SEARCH_WIKI(log_id);
CREATE INDEX IF NOT EXISTS idx_log_search_wiki_wiki_id ON LOG_SEARCH_WIKI(wiki_id);

PRAGMA user_version = 2;
