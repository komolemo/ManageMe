import { useCallback, useEffect, useState } from "react";
import {
  BookOpenText,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MenuButton } from "@/components/app/MenuButton";
import { PageLink } from "@/components/app/PageLink";
import { TagInput } from "@/components/app/TagInput";
import { useTagBindings } from "@/hooks/useTagBindings";
import { DocumentEditor } from "@/pages/DocumentPage/DocumentEditor";
import type { EditorCommand } from "@/pages/DocumentPage/editorCommands";
import { TaskDataBar } from "@/pages/DocumentPage/TaskDataBar";
import { PageShell } from "@/pages/PageShell";
import {
  filterProjectTasks,
  ProjectTaskTree,
} from "@/pages/ProjectPage";
import type { ProjectTask, ProjectTaskId } from "@/pages/projectData";
import { useTranslation } from "react-i18next";
import { useDocumentStore } from "@/features/document/documentStore";
import type {
  DocumentRecord,
  DocumentTreeNode,
} from "@/features/document/types";

const documentTitleCharacterLimitByLevel = [22, 10, 10];
const fallbackDocumentTitleCharacterLimit = 14;

type DocumentIconOption = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const documentIconOptions: DocumentIconOption[] = [
  { icon: FileText, label: "document.document", value: "document" },
  { icon: BookOpenText, label: "document.reference", value: "reference" },
  { icon: ClipboardList, label: "document.checklist", value: "checklist" },
  { icon: FilePenLine, label: "document.draft", value: "draft" },
];

const initialDocumentContent =
  "# Overview\n\nProject document content is edited here.\n\n# Linked tasks\n\n- Document pages follow the task hierarchy shown in Sidebar 2.\n- **Bold**, *italic*, and lists are supported in Markdown Input mode.\n- [ ] : gasrgarg \n- [x] : gsgarag";

type DocumentPageProps = {
  documentId?: string;
  documentTitle?: string;
  onOpenDocument?: (document: DocumentRecord) => void;
  onOpenDocumentInNewTab?: (document: DocumentRecord) => void;
  onOpenTaskInNewTab?: (task: ProjectTask) => void;
  onOpenTask?: (task: ProjectTask) => void;
  onOpenProject?: () => void;
  projectTasks?: ProjectTask[];
  taskId?: ProjectTaskId;
  workspaceId?: string;
};

export function DocumentPage({
  documentId,
  documentTitle = "Project Document",
  onOpenDocument,
  onOpenDocumentInNewTab,
  onOpenProject,
  onOpenTask,
  onOpenTaskInNewTab,
  projectTasks = [],
  taskId,
  workspaceId,
}: DocumentPageProps) {
  const { t } = useTranslation();
  const { setTags, tags } = useTagBindings(
    taskId !== undefined
      ? { taskId: String(taskId) }
      : { documentId },
  );
  const [documentIcon, setDocumentIcon] = useState(
    documentIconOptions[0].value,
  );
  const [title, setTitle] = useState(documentTitle);
  const [documentPages, setDocumentPages] = useState<DocumentTreeNode[]>([]);
  const [documentFilter, setDocumentFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const isProjectTaskPage = taskId !== undefined;
  const visibleDocumentPages = filterDocumentNodes(documentPages, documentFilter);
  const [isDocumentIconMenuOpen, setIsDocumentIconMenuOpen] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [editorCommand, setEditorCommand] = useState<EditorCommand | null>(null);
  const selectedDocumentIcon =
    documentIconOptions.find((option) => option.value === documentIcon) ??
    documentIconOptions[0];
  const DocumentIcon = selectedDocumentIcon.icon;
  const storedDocument = useDocumentStore((state) =>
    documentId ? state.documents[documentId] : undefined
  );
  const openOrCreateDocument = useDocumentStore(
    (state) => state.openOrCreateDocument,
  );
  const createDocument = useDocumentStore((state) => state.createDocument);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const listDocumentTree = useDocumentStore(
    (state) => state.listDocumentTree,
  );
  const queueDocumentUpdate = useDocumentStore((state) => state.queueUpdate);
  const isStandardDocument =
    taskId === undefined && Boolean(documentId && workspaceId);

  useEffect(() => {
    if (!isStandardDocument || !documentId || !workspaceId) return;
    void openOrCreateDocument({
      content: initialDocumentContent,
      documentId,
      iconId: documentIconOptions[0].value,
      title: documentTitle,
      workspaceId,
    }).catch(() => undefined);
  }, [
    documentId,
    documentTitle,
    isStandardDocument,
    openOrCreateDocument,
    workspaceId,
  ]);

  const reloadDocumentTree = useCallback(async () => {
    if (!workspaceId) return;
    setDocumentPages(await listDocumentTree(workspaceId));
  }, [listDocumentTree, workspaceId]);

  useEffect(() => {
    if (!isStandardDocument || !storedDocument) return;
    void reloadDocumentTree().catch(() => undefined);
  }, [
    isStandardDocument,
    reloadDocumentTree,
    storedDocument?.documentId,
  ]);

  const addDocument = useCallback(async () => {
    if (!workspaceId) return;
    await createDocument({
      content: "",
      documentId: crypto.randomUUID(),
      iconId: documentIconOptions[0].value,
      title: t("document.untitled", { number: documentPages.length + 1 }),
      workspaceId,
    });
    await reloadDocumentTree();
  }, [
    createDocument,
    documentPages.length,
    reloadDocumentTree,
    t,
    workspaceId,
  ]);

  const removeDocument = useCallback(async (id: string) => {
    await deleteDocument(id);
    await reloadDocumentTree();
  }, [deleteDocument, reloadDocumentTree]);

  useEffect(() => {
    if (!storedDocument) return;
    setTitle(storedDocument.title);
    setDocumentIcon(storedDocument.iconId ?? documentIconOptions[0].value);
  }, [storedDocument?.documentId]);

  useEffect(() => {
    if (!isStandardDocument || !documentId || !storedDocument) return;
    if (!title.trim() || title === storedDocument.title) return;
    const timerId = window.setTimeout(() => {
      queueDocumentUpdate(documentId, { title: title.trim() });
    }, 700);
    return () => window.clearTimeout(timerId);
  }, [
    documentId,
    isStandardDocument,
    queueDocumentUpdate,
    storedDocument,
    title,
  ]);

  const saveContent = useCallback((content: string) => {
    if (isStandardDocument && documentId) {
      queueDocumentUpdate(documentId, { content });
    }
  }, [documentId, isStandardDocument, queueDocumentUpdate]);

  return (
    <PageShell
      breadcrumbs={[
        { label: isProjectTaskPage ? t("pages.projects") : t("pages.document") },
        { label: documentTitle },
      ]}
      detailSidebar={
        isProjectTaskPage ? (
          <ProjectTaskTree
            onOpenTask={onOpenTask ?? (() => undefined)}
            onOpenTaskInNewTab={onOpenTaskInNewTab ?? (() => undefined)}
            tasks={filterProjectTasks(projectTasks, projectFilter)}
          />
        ) : (
          <DocumentTree
            onDelete={removeDocument}
            onOpen={onOpenDocument}
            onOpenInNewTab={onOpenDocumentInNewTab}
            pages={visibleDocumentPages}
          />
        )
      }
      detailSidebarAddLabel={isProjectTaskPage ? t("detailSidebar.addIssue") : t("detailSidebar.addDocument")}
      detailSidebarFilterLabel={isProjectTaskPage ? t("detailSidebar.filterIssues") : t("detailSidebar.filterDocuments")}
      detailSidebarOnAddFile={
        isProjectTaskPage
          ? undefined
          : () => void addDocument()
      }
      detailSidebarOnFilterChange={
        isProjectTaskPage ? setProjectFilter : setDocumentFilter
      }
      detailSidebarOnOpenProject={isProjectTaskPage ? onOpenProject : undefined}
    >
      <div className="flex min-w-0 items-center justify-between gap-[8px]">
        <div className="flex">
          <div className="relative shrink-0">
            <button
              aria-expanded={isDocumentIconMenuOpen}
              aria-label={t("document.changeIcon")}
              className="grid size-[36px] place-items-center bg-transparent border-0 rounded-md text-muted-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-foreground"
              onClick={() =>
                setIsDocumentIconMenuOpen((isMenuOpen) => !isMenuOpen)
              }
              title={t(selectedDocumentIcon.label)}
              type="button"
            >
              <DocumentIcon className="size-[22px]" />
            </button>
            {isDocumentIconMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-20 grid min-w-[148px] gap-[2px] rounded-md bg-popover p-[4px] text-popover-foreground shadow-md">
                {documentIconOptions.map((option) => {
                  const OptionIcon = option.icon;
                  const isSelected = option.value === documentIcon;

                  return (
                    <button
                      className={`
                        flex h-[32px] items-center gap-[8px] border-0 rounded-sm px-[8px] text-left text-xs transition-colors 
                        hover:bg-accent hover:text-accent-foreground ${
                        isSelected ? "bg-accent text-accent-foreground" : "bg-transparent"
                      }`}
                      key={option.value}
                      onClick={() => {
                        setDocumentIcon(option.value);
                        if (isStandardDocument && documentId) {
                          queueDocumentUpdate(documentId, {
                            iconId: option.value,
                          });
                        }
                        setIsDocumentIconMenuOpen(false);
                      }}
                      type="button"
                    >
                      <OptionIcon className="size-4 shrink-0" />
                      <span>{t(option.label)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <input
            className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent py-[2px] text-[24px] font-bold outline-none"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </div>
        <div
          aria-label={t("editor.editorMode")}
          className="grid h-[28px] shrink-0 grid-cols-2 overflow-hidden rounded-md p-[2px]"
          role="tablist"
        >
          <button
            aria-selected={!isMarkdownMode}
            className={`min-w-[64px] rounded-sm border-0 px-[8px] text-xs transition-colors ${
              !isMarkdownMode
                ? "bg-sidebar-foreground/10 text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsMarkdownMode(false)}
            role="tab"
            type="button"
          >
            {t("editor.text")}
          </button>
          <button
            aria-selected={isMarkdownMode}
            className={`min-w-[82px] rounded-sm border-0 px-[8px] text-xs transition-colors ${
              isMarkdownMode
                ? "bg-sidebar-foreground/10 text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsMarkdownMode(true)}
            role="tab"
            type="button"
          >
            {t("editor.markdown")}
          </button>
        </div>
      </div>
      {taskId !== undefined || (documentId !== undefined && storedDocument) ? (
        <section className="grid gap-[6px] mb-2">
          <TagInput
            inputId="document-task-tags"
            onChange={setTags}
            value={tags}
          />
        </section>
      ) : null}
      {taskId !== undefined ? (
        <TaskDataBar
          onOpenTaskInNewTab={onOpenTaskInNewTab}
          taskId={taskId}
        />
      ) : null}
      <article className="grid min-h-[400px] content-start gap-[12px]">
        {isStandardDocument && !storedDocument ? null : (
          <DocumentEditor
            command={editorCommand}
            documentId={documentId ?? `project-document:${documentTitle}`}
            isMarkdownMode={isMarkdownMode}
            initialContent={storedDocument?.content ?? initialDocumentContent}
            onSaveContent={saveContent}
            onCommand={(command) =>
              setEditorCommand({ ...command, id: Date.now() })
            }
            onCommandHandled={() => setEditorCommand(null)}
          />
        )}
      </article>
    </PageShell>
  );
}

type DocumentTreeProps = {
  onDelete: (documentId: string) => void;
  onOpen?: (document: DocumentRecord) => void;
  onOpenInNewTab?: (document: DocumentRecord) => void;
  pages: DocumentTreeNode[];
};

function DocumentTree({
  onDelete,
  onOpen,
  onOpenInNewTab,
  pages,
}: DocumentTreeProps) {
  return (
    <div className="grid gap-[4px]">
      <div className="grid gap-[0px]">
        {pages.map((page) => (
          <DocumentTreeItem
            key={page.document.documentId}
            level={0}
            node={page}
            onDelete={onDelete}
            onOpen={onOpen}
            onOpenInNewTab={onOpenInNewTab}
          />
        ))}
      </div>
    </div>
  );
}

function DocumentTreeItem({
  node,
  level,
  onDelete,
  onOpen,
  onOpenInNewTab,
}: {
  node: DocumentTreeNode;
  level: number;
  onDelete: (documentId: string) => void;
  onOpen?: (document: DocumentRecord) => void;
  onOpenInNewTab?: (document: DocumentRecord) => void;
}) {
  const { t } = useTranslation();
  const hasChildren = Boolean(node.children?.length);
  const [isOpen, setIsOpen] = useState(true);
  const displayTitle = getDocumentTreeDisplayTitle(
    node.document.title,
    level,
  );
  const ToggleIcon = isOpen ? ChevronDown : ChevronRight;
  const TreeDocumentIcon =
    documentIconOptions.find(
      (option) => option.value === node.document.iconId,
    )?.icon ?? FileText;

  return (
    <div className="grid gap-[4px]">
      <div className="
        flex items-center justify-between gap-[4px] pr-[4px] overflow-hidden
        max-w-[calc(100%)] rounded-lg 
        hover:bg-accent-2 hover:text-sidebar-accent-foreground
      ">
        <div
          className="
            box-border flex h-[jhpx] min-w-0 flex-1 cursor-pointer items-center gap-[4px] overflow-hidden
            border-0 bg-transparent px-[0px] py-[6px] text-left text-[14px] text-sidebar-foreground transition-colors
          "
          onAuxClick={(event) => {
            if (event.button === 1) {
              event.preventDefault();
              onOpenInNewTab?.(node.document);
            }
          }}
          onClick={() => onOpen?.(node.document)}
          role="button"
          tabIndex={0}
        >
          <div
            className="flex max-w-full min-w-0 flex-1 items-center"
            style={{ marginLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <button
                className="grid size-[24px] shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-[0px] text-current"
                onClick={(event) => {
                  event.stopPropagation();
                  if (
                    hasChildren &&
                    event.target instanceof Element &&
                    event.target.closest("[data-document-tree-toggle]")
                  ) {
                    setIsOpen((currentIsOpen) => !currentIsOpen);
                  }
                }}
                type="button"
              >
                <span
                  className="grid size-4 shrink-0 place-items-center"
                  data-document-tree-toggle
                  aria-hidden="true"
                >
                  <ToggleIcon className="size-[24px] text-current text-muted-foreground" />
                </span>
              </button>
            ) : (
              <span className="size-[24px] shrink-0" aria-hidden="true" />
            )}
            <PageLink
              displayName={displayTitle}
              icon={TreeDocumentIcon}
              pageName={node.document.title}
            />
          </div>
        </div>
        <MenuButton
          actions={[
            {
              label: t("common.open"),
              onSelect: () => onOpen?.(node.document),
            },
            {
              label: t("common.delete"),
              onSelect: () => onDelete(node.document.documentId),
            },
          ]}
          ariaLabel={t("document.openMenu", {
            documentTitle: node.document.title,
          })}
        />
      </div>

      {hasChildren &&
        isOpen &&
        node.children?.map((child) => (
          <DocumentTreeItem
            key={child.document.documentId}
            node={child}
            level={level + 1}
            onDelete={onDelete}
            onOpen={onOpen}
            onOpenInNewTab={onOpenInNewTab}
          />
        ))}
    </div>
  );
}

function getDocumentTreeDisplayTitle(title: string, level: number) {
  const characterLimit =
    documentTitleCharacterLimitByLevel[level] ??
    fallbackDocumentTitleCharacterLimit;

  if (title.length <= characterLimit) {
    return title;
  }

  return `${title.slice(0, characterLimit)}...`;
}

function filterDocumentNodes(
  nodes: DocumentTreeNode[],
  query: string,
): DocumentTreeNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return nodes;
  }

  return nodes.flatMap((node) => {
    const children = filterDocumentNodes(node.children ?? [], query);

    if (
      node.document.title.toLowerCase().includes(normalizedQuery) ||
      children.length
    ) {
      return [{ ...node, children: children.length ? children : node.children }];
    }

    return [];
  });
}
