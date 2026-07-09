import { useState } from "react";
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
import { CommandBarDock } from "@/pages/DocumentPage/CommandBarDock";
import { DocumentEditor } from "@/pages/DocumentPage/DocumentEditor";
import { PageShell } from "@/pages/PageShell";

type DocumentNode = {
  title: string;
  children?: DocumentNode[];
};

const documentPages: DocumentNode[] = [
  {
    title: "ph-1-0-001-detailed-function-requirements-eng",
    children: [
      {
        title: "ph-1-0-001-api-contract-eng",
        children: [{ title: "ph-1-0-001-task-status-model-eng" }],
      },
      { title: "ph-1-0-001-screen-flow-eng" },
    ],
  },
  {
    title: "ph-1-0-002-er-diagram-eng",
    children: [{ title: "ph-1-0-002-entity-notes-eng" }],
  },
  {
    title: "issue-rule-eng",
  },
  {
    title: "あいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえお",
  },
  {
    title: "ph-1-0-001-detailed-function-requirements-eng",
    children: [
      {
        title: "ph-1-0-001-api-contract-eng",
        children: [{ title: "ph-1-0-001-task-status-model-eng" }],
      },
      { title: "ph-1-0-001-screen-flow-eng" },
    ],
  },
  {
    title: "ph-1-0-002-er-diagram-eng",
    children: [{ title: "ph-1-0-002-entity-notes-eng" }],
  },
  {
    title: "issue-rule-eng",
  },
  {
    title: "あいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえおあいうえお",
  },
];

const documentTitleCharacterLimitByLevel = [22, 10, 10];
const fallbackDocumentTitleCharacterLimit = 14;

type DocumentIconOption = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const documentIconOptions: DocumentIconOption[] = [
  { icon: FileText, label: "Document", value: "document" },
  { icon: BookOpenText, label: "Reference", value: "reference" },
  { icon: ClipboardList, label: "Checklist", value: "checklist" },
  { icon: FilePenLine, label: "Draft", value: "draft" },
];

const initialDocumentContent =
  "# Overview\n\nProject document content is edited here.\n\n# Linked tasks\n\n- Document pages follow the task hierarchy shown in Sidebar 2.\n- **Bold**, *italic*, and lists are supported in Markdown Input mode.\n- [ ] : gasrgarg \n- [x] : gsgarag";

type DocumentPageProps = {
  documentTitle?: string;
};

export function DocumentPage({
  documentTitle = "Project Wiki",
}: DocumentPageProps) {
  const [documentIcon, setDocumentIcon] = useState(
    documentIconOptions[0].value,
  );
  const [isDocumentIconMenuOpen, setIsDocumentIconMenuOpen] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const selectedDocumentIcon =
    documentIconOptions.find((option) => option.value === documentIcon) ??
    documentIconOptions[0];
  const DocumentIcon = selectedDocumentIcon.icon;

  return (
    <PageShell
      breadcrumbs={[{ label: "Wiki" }, { label: documentTitle }]}
      detailSidebar={<DocumentTree pages={documentPages} />}
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <div className="relative shrink-0">
          <button
            aria-expanded={isDocumentIconMenuOpen}
            aria-label="Change document icon"
            className="grid size-[36px] place-items-center bg-transparent border-0 rounded-md text-muted-foreground transition-colors hover:bg-sidebar-foreground/10 hover:text-foreground"
            onClick={() =>
              setIsDocumentIconMenuOpen((isMenuOpen) => !isMenuOpen)
            }
            title={selectedDocumentIcon.label}
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
                      setIsDocumentIconMenuOpen(false);
                    }}
                    type="button"
                  >
                    <OptionIcon className="size-4 shrink-0" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <input
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent py-[2px] text-[24px] font-bold outline-none"
          defaultValue={documentTitle}
        />
      </div>
      <CommandBarDock
        isMarkdownMode={isMarkdownMode}
        onMarkdownModeChange={setIsMarkdownMode}
      />
      <article className="grid min-h-[400px] content-start gap-[12px]">
        <DocumentEditor
          documentId={`project-wiki:${documentTitle}`}
          isMarkdownMode={isMarkdownMode}
          initialContent={initialDocumentContent}
        />
      </article>
    </PageShell>
  );
}

function DocumentTree({ pages }: { pages: DocumentNode[] }) {
  return (
    <div className="grid gap-[4px]">
      <div className="grid gap-[0px]">
        {pages.map((page) => (
          <DocumentTreeItem key={page.title} node={page} level={0} />
        ))}
      </div>
    </div>
  );
}

function DocumentTreeItem({
  node,
  level,
}: {
  node: DocumentNode;
  level: number;
}) {
  const hasChildren = Boolean(node.children?.length);
  const [isOpen, setIsOpen] = useState(true);
  const displayTitle = getDocumentTreeDisplayTitle(node.title, level);
  const ToggleIcon = isOpen ? ChevronDown : ChevronRight;

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
        >
          <div
            className="flex max-w-full min-w-0 flex-1 items-center"
            style={{ marginLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <button
                className="grid size-[24px] shrink-0 cursor-pointer place-items-center border-0 bg-transparent p-[0px] text-current"
                onClick={(event) => {
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
            <PageLink displayName={displayTitle} icon={FileText} pageName={node.title} />
          </div>
        </div>
        <MenuButton
          actions={[
            { label: "Open" },
            { label: "Rename" },
            { label: "Delete" },
          ]}
          ariaLabel={`Open document menu for ${node.title}`}
        />
      </div>

      {hasChildren &&
        isOpen &&
        node.children?.map((child) => (
          <DocumentTreeItem
            key={child.title}
            node={child}
            level={level + 1}
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
