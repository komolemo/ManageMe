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

COMMIT;
