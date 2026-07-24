-- Development-only data for testing the Document page and its DetailSidebar.
BEGIN IMMEDIATE;

INSERT INTO WORKSPACE (
  workspace_id,
  workspace_key,
  workspace_type,
  name,
  description,
  icon_id
) VALUES (
  'test-library-workspace',
  'test-library-document-tree',
  1,
  'Document Tree Test Library',
  'Development-only Library for testing Document CRUD and hierarchy.',
  'book-open-text'
)
ON CONFLICT(workspace_id) DO UPDATE SET
  workspace_type = excluded.workspace_type,
  name = excluded.name,
  description = excluded.description,
  icon_id = excluded.icon_id,
  deleted_at = NULL;

INSERT OR IGNORE INTO DOCUMENTS (
  document_id,
  workspace_id,
  document_type,
  title,
  content,
  icon_id
) VALUES
(
  'test-library-workspace',
  'test-library-workspace',
  'document',
  'Document Tree Test Library',
  '# Document Tree Test Library

This is the root document used to test the Document page.',
  'document'
),
(
  'test-document-requirements',
  'test-library-workspace',
  'document',
  'Requirements',
  '# Requirements

Dummy requirements for testing.',
  'reference'
),
(
  'test-document-functional-requirements',
  'test-library-workspace',
  'document',
  'Functional Requirements',
  '# Functional Requirements

- Create documents
- Edit documents
- Display parent-child relationships',
  'checklist'
),
(
  'test-document-non-functional-requirements',
  'test-library-workspace',
  'document',
  'Non-functional Requirements',
  '# Non-functional Requirements

- Autosave after 700 milliseconds
- Retain edits when saving fails',
  'checklist'
),
(
  'test-document-design',
  'test-library-workspace',
  'document',
  'Design',
  '# Design

Dummy design notes for testing.',
  'draft'
),
(
  'test-document-database-design',
  'test-library-workspace',
  'document',
  'Database Design',
  '# Database Design

The test hierarchy uses DOCUMENT_RELATIVE_BIND.',
  'document'
),
(
  'test-document-api-design',
  'test-library-workspace',
  'document',
  'API Design',
  '# API Design

Dummy API design notes.',
  'reference'
),
(
  'test-document-release-notes',
  'test-library-workspace',
  'document',
  'Release Notes',
  '# Release Notes

Standalone root-level document.',
  'draft'
);

INSERT OR IGNORE INTO DOCUMENT_RELATIVE_BIND (
  parent_document_id,
  child_document_id,
  display_order
) VALUES
(
  'test-library-workspace',
  'test-document-requirements',
  0
),
(
  'test-library-workspace',
  'test-document-design',
  1
),
(
  'test-document-requirements',
  'test-document-functional-requirements',
  0
),
(
  'test-document-requirements',
  'test-document-non-functional-requirements',
  1
),
(
  'test-document-design',
  'test-document-database-design',
  0
),
(
  'test-document-design',
  'test-document-api-design',
  1
);

-- Development-only Project whose Task list mirrors src/pages/projectData.ts.
INSERT INTO WORKSPACE (
  workspace_id, workspace_key, workspace_type, name, description, icon_id
) VALUES (
  'test-project-workspace', 'test-project-tasks', 0, 'Task List Test Project',
  'Development-only Project populated with TASKS dummy data.', 'list-checks'
)
ON CONFLICT(workspace_id) DO UPDATE SET
  workspace_type = excluded.workspace_type,
  name = excluded.name,
  description = excluded.description,
  icon_id = excluded.icon_id,
  deleted_at = NULL;

INSERT OR IGNORE INTO BUCKETS (bucket_id, workspace_id, name, status_type, display_order)
VALUES
  ('test-project-backlog', 'test-project-workspace', 'Backlog', 0, 0),
  ('test-project-progress', 'test-project-workspace', 'In Progress', 50, 1),
  ('test-project-done', 'test-project-workspace', 'Done', 100, 2);

INSERT OR IGNORE INTO BUCKET_ORDER (workspace_id, bucket_id, order_hint)
VALUES
  ('test-project-workspace', 'test-project-backlog', '00000000000000000000'),
  ('test-project-workspace', 'test-project-progress', '00000000000000000001'),
  ('test-project-workspace', 'test-project-done', '00000000000000000002');

INSERT OR IGNORE INTO MILESTONES (milestone_id, workspace_id, name, display_order)
VALUES
  ('test-project-ph-1-0', 'test-project-workspace', 'ph-1-0', 0),
  ('test-project-ph-1-1', 'test-project-workspace', 'ph-1-1', 1),
  ('test-project-ph-1-2', 'test-project-workspace', 'ph-1-2', 2),
  ('test-project-ph-1-3', 'test-project-workspace', 'ph-1-3', 3),
  ('test-project-ph-1-4', 'test-project-workspace', 'ph-1-4', 4),
  ('test-project-ph-1-5', 'test-project-workspace', 'ph-1-5', 5);

INSERT OR IGNORE INTO MILESTONE_ORDER (workspace_id, milestone_id, order_hint)
VALUES
  ('test-project-workspace', 'test-project-ph-1-0', '00000000000000000000'),
  ('test-project-workspace', 'test-project-ph-1-1', '00000000000000000001'),
  ('test-project-workspace', 'test-project-ph-1-2', '00000000000000000002'),
  ('test-project-workspace', 'test-project-ph-1-3', '00000000000000000003'),
  ('test-project-workspace', 'test-project-ph-1-4', '00000000000000000004'),
  ('test-project-workspace', 'test-project-ph-1-5', '00000000000000000005');

INSERT INTO TASKS (
  task_id, workspace_id, title, description, due_date, status_id, priority_id,
  complete_percentage, milestone_id, bucket_id
) VALUES
  ('101', 'test-project-workspace', 'Reflect issue hierarchy rules in the UI', 'Organize the relationship between Project Document and Task Document.', '05/24', 0, 2, 100, 'test-project-ph-1-0', 'test-project-backlog'),
  ('102', 'test-project-workspace', 'Define parent and child task display rules', 'Clarify how nested tasks appear in the project grid.', '05/22', 50, 1, 100, 'test-project-ph-1-0', 'test-project-progress'),
  ('103', 'test-project-workspace', 'Check expansion behavior with nested records', 'Verify that child task rows are shown only when expanded.', '05/23', 50, 1, 100, 'test-project-ph-1-0', 'test-project-progress'),
  ('104', 'test-project-workspace', 'Verify grandchild row notation', 'Confirm that grandchild task rows use the expected hierarchy marker.', '05/24', 0, 0, 0, 'test-project-ph-1-0', 'test-project-backlog'),
  ('105', 'test-project-workspace', 'task-1-child-3', 'Clarify how nested tasks appear in the project grid.', '05/22', 50, 1, 100, 'test-project-ph-1-0', 'test-project-progress'),
  ('106', 'test-project-workspace', 'task-1-child-4', 'Clarify how nested tasks appear in the project grid.', '05/22', 50, 1, 100, 'test-project-ph-1-0', 'test-project-progress'),
  ('107', 'test-project-workspace', 'Project list screen', 'Create a UI that navigates from the list to each project page.', '05/27', 50, 1, 0, 'test-project-ph-1-0', 'test-project-progress'),
  ('108', 'test-project-workspace', 'Document Markdown input', 'Place a Markdown input area on the Task Page.', '05/30', 50, 1, 0, 'test-project-ph-1-1', 'test-project-progress'),
  ('109', 'test-project-workspace', 'Board view layout', 'Show task cards grouped by status in board columns.', '06/02', 50, 0, 0, 'test-project-ph-1-1', 'test-project-progress'),
  ('110', 'test-project-workspace', 'Task detail drawer', 'Design a compact task detail drawer for quick edits.', '06/04', 0, 2, 0, 'test-project-ph-1-1', 'test-project-backlog'),
  ('111', 'test-project-workspace', 'Project dashboard metrics', 'Add summary metrics for open tasks, reviews, and due dates.', '06/06', 50, 1, 0, 'test-project-ph-1-1', 'test-project-progress'),
  ('112', 'test-project-workspace', 'Settings theme toggle', 'Review the theme toggle behavior in settings.', '06/08', 50, 0, 100, 'test-project-ph-1-1', 'test-project-progress'),
  ('113', 'test-project-workspace', 'Tag search result filters', 'Let users narrow search results by tag, status, and priority.', '06/10', 0, 1, 0, 'test-project-ph-1-2', 'test-project-backlog'),
  ('114', 'test-project-workspace', 'Document link preview', 'Show a lightweight preview when hovering over document links.', '06/12', 50, 1, 0, 'test-project-ph-1-2', 'test-project-progress'),
  ('115', 'test-project-workspace', 'Milestone progress indicator', 'Add milestone progress based on completed and review tasks.', '06/14', 50, 2, 0, 'test-project-ph-1-2', 'test-project-progress'),
  ('116', 'test-project-workspace', 'Bulk task selection', 'Support selecting multiple tasks from the grid view.', '06/16', 0, 2, 0, 'test-project-ph-1-2', 'test-project-backlog'),
  ('117', 'test-project-workspace', 'Sidebar keyboard navigation', 'Validate keyboard navigation through sidebar destinations.', '06/18', 50, 1, 100, 'test-project-ph-1-2', 'test-project-progress'),
  ('118', 'test-project-workspace', 'Task document autosave', 'Persist task document edits automatically after short idle periods.', '06/20', 50, 2, 0, 'test-project-ph-1-3', 'test-project-progress'),
  ('119', 'test-project-workspace', 'Project document table of contents', 'Generate a table of contents from project document headings.', '06/22', 0, 0, 0, 'test-project-ph-1-3', 'test-project-backlog'),
  ('120', 'test-project-workspace', 'Due date quick presets', 'Add quick due date options such as today, tomorrow, and next week.', '06/24', 50, 1, 0, 'test-project-ph-1-3', 'test-project-progress'),
  ('121', 'test-project-workspace', 'Priority color audit', 'Check priority colors for contrast in light and dark themes.', '06/26', 50, 0, 0, 'test-project-ph-1-3', 'test-project-progress'),
  ('122', 'test-project-workspace', 'Project export workflow', 'Define how project data can be exported for backup or sharing.', '06/28', 100, 2, 0, 'test-project-ph-1-4', 'test-project-done'),
  ('123', 'test-project-workspace', 'Empty state polish', 'Improve empty states across project, tag, and search pages.', '06/30', 50, 1, 100, 'test-project-ph-1-4', 'test-project-progress'),
  ('124', 'test-project-workspace', 'Notification preference panel', 'Create notification preference controls in the settings page.', '07/02', 50, 1, 0, 'test-project-ph-1-4', 'test-project-progress'),
  ('125', 'test-project-workspace', 'Tag color migration plan', 'Plan how existing tag colors should migrate to the new palette.', '07/04', 0, 0, 0, 'test-project-ph-1-4', 'test-project-backlog'),
  ('126', 'test-project-workspace', 'Search ranking tuning', 'Tune search ranking so exact title matches appear first.', '07/06', 100, 2, 0, 'test-project-ph-1-5', 'test-project-done'),
  ('127', 'test-project-workspace', 'Task activity timeline', 'Show task changes and comments in a chronological timeline.', '07/08', 0, 1, 0, 'test-project-ph-1-5', 'test-project-backlog'),
  ('128', 'test-project-workspace', 'Responsive grid check', 'Check the grid layout across desktop and narrow viewports.', '07/10', 50, 1, 100, 'test-project-ph-1-5', 'test-project-progress'),
  ('129', 'test-project-workspace', 'Release checklist draft', 'Draft the release checklist for the first ManageMe milestone.', '07/12', 0, 2, 0, 'test-project-ph-1-5', 'test-project-backlog')
ON CONFLICT(task_id) DO UPDATE SET
  workspace_id = excluded.workspace_id,
  title = excluded.title,
  description = excluded.description,
  due_date = excluded.due_date,
  status_id = excluded.status_id,
  priority_id = excluded.priority_id,
  complete_percentage = excluded.complete_percentage,
  milestone_id = excluded.milestone_id,
  bucket_id = excluded.bucket_id,
  deleted_at = NULL;

INSERT OR IGNORE INTO TASK_RELATIVE_BIND (
  parent_task_id, child_task_id, display_order
) VALUES
  ('101', '102', 0),
  ('101', '103', 1),
  ('101', '105', 2),
  ('101', '106', 3),
  ('103', '104', 0);

-- Recent search history used to exercise suggestions in development builds.
INSERT OR REPLACE INTO LOG_SEARCH_WORD (
  log_id, search_word, created_at, last_searched_at
) VALUES
  ('test-search-word-rust', 'Rust', datetime('now', '-12 minutes'), datetime('now', '-12 minutes')),
  ('test-search-word-database', 'database design', datetime('now', '-9 minutes'), datetime('now', '-9 minutes')),
  ('test-search-word-task', 'task', datetime('now', '-6 minutes'), datetime('now', '-6 minutes')),
  ('test-search-word-search', 'search', datetime('now', '-3 minutes'), datetime('now', '-3 minutes'));

INSERT OR REPLACE INTO LOG_SEARCH_DOCUMENT (
  log_id, document_id, accessed_at
) VALUES
  ('test-search-document-requirements', 'test-document-requirements', datetime('now', '-10 minutes')),
  ('test-search-document-database', 'test-document-database-design', datetime('now', '-7 minutes')),
  ('test-search-document-api', 'test-document-api-design', datetime('now', '-4 minutes'));

INSERT OR REPLACE INTO LOG_SEARCH_TASK (
  log_id, task_id, accessed_at
) VALUES
  ('test-search-task-ranking', '126', datetime('now', '-8 minutes')),
  ('test-search-task-filter', '113', datetime('now', '-5 minutes')),
  ('test-search-task-empty-state', '123', datetime('now', '-2 minutes'));

COMMIT;
