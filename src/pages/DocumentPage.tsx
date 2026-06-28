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
import { PageShell } from "@/pages/PageShell";

type WikiPageNode = {
  title: string;
  children?: WikiPageNode[];
};

const wikiPages: WikiPageNode[] = [
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

const documentTitleCharacterLimitByLevel = [22, 20, 18];
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

type ProjectWikiPageProps = {
  wikiTitle?: string;
};

export function ProjectWikiPage({
  wikiTitle = "Project Wiki",
}: ProjectWikiPageProps) {
  const [documentIcon, setDocumentIcon] = useState(
    documentIconOptions[0].value,
  );
  const [isDocumentIconMenuOpen, setIsDocumentIconMenuOpen] = useState(false);
  const selectedDocumentIcon =
    documentIconOptions.find((option) => option.value === documentIcon) ??
    documentIconOptions[0];
  const DocumentIcon = selectedDocumentIcon.icon;

  return (
    <PageShell
      breadcrumbs={[{ label: "Wiki" }, { label: wikiTitle }]}
      detailSidebar={<WikiPageTree pages={wikiPages} />}
    >
      <article className="grid min-h-[400px] content-start gap-[12px] overflow-x-hidden overflow-y-auto">
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
              <div className="absolute left-0 top-[calc(100%+4px)] z-20 grid min-w-[148px] gap-[2px] rounded-md border bg-popover p-[4px] text-popover-foreground shadow-md">
                {documentIconOptions.map((option) => {
                  const OptionIcon = option.icon;
                  const isSelected = option.value === documentIcon;

                  return (
                    <button
                      className={`flex h-[32px] items-center gap-[8px] rounded-sm px-[8px] text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${
                        isSelected ? "bg-accent text-accent-foreground" : ""
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
            defaultValue={wikiTitle}
          />
        </div>
        <textarea
          className="min-h-80 resize-none border bg-background p-[12px] text-xs leading-6 outline-none focus:ring-1 focus:ring-ring"
          defaultValue={
            "# Overview\n\nProject document content is edited here.\n\n# Linked tasks\n\nDocument pages follow the task hierarchy shown in Sidebar 2."
          }
        />
      </article>
    </PageShell>
  );
}

function WikiPageTree({ pages }: { pages: WikiPageNode[] }) {
  return (
    <div className="grid gap-[4px]">
      <div className="grid gap-[0px]">
        {pages.map((page) => (
          <WikiPageTreeItem key={page.title} node={page} level={0} />
        ))}
      </div>
    </div>
  );
}

function WikiPageTreeItem({
  node,
  level,
}: {
  node: WikiPageNode;
  level: number;
}) {
  const hasChildren = Boolean(node.children?.length);
  const [isOpen, setIsOpen] = useState(true);
  const displayTitle = getDocumentTreeDisplayTitle(node.title, level);
  const ToggleIcon = isOpen ? ChevronDown : ChevronRight;

  return (
    <div className="grid gap-[4px]">
      <button
        className="
          box-border flex h-[40px] max-w-[calc(100%)] cursor-pointer items-center gap-[4px] overflow-hidden
          rounded-lg border-0 bg-transparent px-[0px] py-[8px] text-left text-xs text-sidebar-foreground transition-colors
          hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground
        "
        onClick={() => {
          if (hasChildren) {
            setIsOpen((currentIsOpen) => !currentIsOpen);
          }
        }}
        type="button"
      >
        <div
          className="flex max-w-full min-w-0 items-center"
          style={{ marginLeft: `${level * 10}px` }}
        >
          {hasChildren ? (
            <span
              className="grid size-4 shrink-0 place-items-center"
              aria-hidden="true"
            >
              <ToggleIcon className="size-3 text-current text-muted-foreground" />
            </span>
          ) : (
            <span className="size-[24px] shrink-0" aria-hidden="true" />
          )}
          <FileText className="mr-[4px] size-4 shrink-0 text-current" />
          <span className="min-w-0 truncate" title={node.title}>
            {displayTitle}
          </span>
        </div>
      </button>

      {hasChildren &&
        isOpen &&
        node.children?.map((child) => (
          <WikiPageTreeItem
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
