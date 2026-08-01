import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Item } from "@/components/app/ItemCard";
import { ListSortMenu, type SortCriterion, type SortDirection } from "@/components/app/ListSortMenu";
import { SidebarItem } from "@/components/app/SidebarItem";
import { DetailSidebarToolbar } from "@/layout/DetailSidebar/DetailSidebarToolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/pages/PageShell";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/features/workspace/workspaceStore";
import type {
  Workspace,
  WorkspaceType,
} from "@/features/workspace/types";
import { WORKSPACE_TYPE } from "@/features/workspace/types";

type WorkspaceListProps = {
  breadcrumbLabel: string;
  createDescription: string;
  createItemDescription: string;
  entityLabel: string;
  icon: LucideIcon;
  iconId: string;
  workspaceType: WorkspaceType;
  detailSidebar?: ReactNode;
  detailSidebarHeader?: ReactNode;
  showWorkspaceListInDetailSidebar?: boolean;
  onOpenInNewTab: (item: Workspace) => void;
  onSelect: (item: Workspace) => void;
};

type WorkspaceListViewProps = Pick<
  WorkspaceListProps,
  "icon" | "onOpenInNewTab" | "onSelect" | "workspaceType"
> & {
  items?: Workspace[];
};

export function WorkspaceListView({
  icon,
  items: suppliedItems,
  onOpenInNewTab,
  onSelect,
  workspaceType,
}: WorkspaceListViewProps) {
  const { t } = useTranslation();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const isLoading = useWorkspaceStore(
    (state) => state.loadingTypes[workspaceType] ?? false,
  );
  const error = useWorkspaceStore((state) => state.error);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const filteredItems = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.workspaceType === workspaceType,
      ),
    [workspaces, workspaceType],
  );
  const items = suppliedItems ?? filteredItems;

  useEffect(() => {
    void loadWorkspaces(workspaceType).catch(() => undefined);
  }, [loadWorkspaces, workspaceType]);

  const duplicateItem = async (item: Workspace) => {
    const names = new Set(items.map((currentItem) => currentItem.name));
    const baseName = t("workspace.copyName", { itemName: item.name });
    let name = baseName;
    let number = 2;
    while (names.has(name)) name = `${baseName} ${number++}`;
    const id = crypto.randomUUID();
    await createWorkspace({
      workspaceId: id,
      workspaceKey: `${workspaceType}-${id}`,
      workspaceType,
      name,
      description: item.description,
      iconId: item.iconId,
    });
  };

  return (
    <div className="grid gap-3 border-b pt-[16px]">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("workspace.notYetRegistered")}
        </p>
      ) : null}
      {error && items.length > 0 ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      {items.map((item) => (
        <Item
          Icon={icon}
          actions={[
            { text: t("common.duplicate"), onClick: () => void duplicateItem(item) },
            { text: t("common.copyUrl"), onClick: () => void navigator.clipboard.writeText(window.location.href) },
            ...(workspaceType === WORKSPACE_TYPE.PROJECT
              ? [{ text: t("common.delete"), onClick: () => void deleteWorkspace(item.workspaceId) }]
              : []),
          ]}
          isStarred={item.isFavorite}
          itemDescription={item.description}
          itemName={item.name}
          key={item.workspaceId}
          onOpenInNewTab={() => onOpenInNewTab(item)}
          onSaveEditing={(name) => void updateWorkspace(item.workspaceId, {
            name,
            description: item.description,
            iconId: item.iconId,
            isFavorite: item.isFavorite,
          })}
          onSelect={() => onSelect(item)}
          onToggleStar={() => void toggleFavorite(item.workspaceId)}
        />
      ))}
    </div>
  );
}

export function WorkspaceList({
  breadcrumbLabel,
  createDescription,
  createItemDescription,
  entityLabel,
  icon,
  iconId,
  workspaceType,
  detailSidebar,
  detailSidebarHeader,
  showWorkspaceListInDetailSidebar = false,
  onOpenInNewTab,
  onSelect,
}: WorkspaceListProps) {
  const { t } = useTranslation();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const [sortCriterion, setSortCriterion] = useState<SortCriterion>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>(1);
  const [starred, setStarred] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const items = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.workspaceType === workspaceType,
      ),
    [workspaces, workspaceType],
  );

  const sortedItems = useMemo(() => {
    const nextItems = [...items];

    if (starred) {
      return nextItems.sort(
        (a, b) =>
          Number(b.isFavorite) - Number(a.isFavorite) ||
          a.name.localeCompare(b.name),
      );
    }

    const order = sortDirection === 2 ? -1 : 1;
    return nextItems.sort((a, b) => {
      switch (sortCriterion) {
        case "name": return a.name.localeCompare(b.name) * order;
        case "updated": return (Date.parse(a.updatedAt) - Date.parse(b.updatedAt)) * order;
        case "created": return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * order;
      }
    });
  }, [items, sortCriterion, sortDirection, starred]);

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateError(null);
    setNewItemName("");
  };
  const createItem = async () => {
    const name = newItemName.trim();
    if (!name || isCreating) return;

    setCreateError(null);
    setIsCreating(true);
    const id = crypto.randomUUID();
    try {
      await createWorkspace({
        workspaceId: id,
        workspaceKey: `${workspaceType}-${id}`,
        workspaceType,
        name,
        description: createItemDescription,
        iconId,
      });
      closeCreateDialog();
    } catch (cause) {
      setCreateError(
        cause instanceof Error ? cause.message : String(cause),
      );
    } finally {
      setIsCreating(false);
    }
  };
  const content = (
    <>
      <div>
        <div
          className={`mb-3 items-center justify-end gap-3 ${
            showWorkspaceListInDetailSidebar ? "hidden" : "flex"
          }`}
        >
          <ListSortMenu
            criterion={sortCriterion}
            direction={sortDirection}
            starred={starred}
            onChange={(criterion, direction, nextStarred) => {
              setSortCriterion(criterion);
              setSortDirection(direction);
              setStarred(nextStarred);
            }}
          />
          <CreateNewButton onClick={() => setIsCreateDialogOpen(true)} />
        </div>
        <WorkspaceListView
          icon={icon}
          items={sortedItems}
          onOpenInNewTab={onOpenInNewTab}
          onSelect={onSelect}
          workspaceType={workspaceType}
        />
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => open ? setIsCreateDialogOpen(true) : closeCreateDialog()}>
        <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="my-[4px] text-lg font-semibold uppercase">{t("workspace.createEntity", { entity: entityLabel })}</DialogTitle>
            <DialogDescription>{createDescription}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-[16px]" onSubmit={(event) => { event.preventDefault(); void createItem(); }}>
            <Input
              aria-label={t("workspace.entityName", { entity: entityLabel })}
              autoFocus
              className="h-[36px] rounded-md px-[8px]"
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder={t("workspace.entityName", { entity: entityLabel })}
              value={newItemName}
            />
            {createError ? (
              <p className="text-sm text-destructive" role="alert">
                {createError}
              </p>
            ) : null}
            <DialogFooter className="flex-row justify-end gap-[16px]">
              <Button className="w-[80px] rounded-md" disabled={isCreating} onClick={closeCreateDialog} type="button" variant="outline">{t("common.cancel")}</Button>
              <Button
                className="w-[80px] rounded-md bg-[#238636] text-white hover:bg-[#2ea043]"
                disabled={!newItemName.trim() || isCreating}
                onClick={() => void createItem()}
                type="button"
              >
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <PageShell
      breadcrumbs={[{ label: breadcrumbLabel }, { label: "1" }]}
      detailSidebar={
        detailSidebar ??
        (showWorkspaceListInDetailSidebar ? (
          <WorkspaceDetailSidebarList
            icon={icon}
            items={sortedItems}
            onCreate={() => setIsCreateDialogOpen(true)}
            onOpenInNewTab={onOpenInNewTab}
            onSelect={onSelect}
            onSortChange={(criterion, direction, nextStarred) => {
              setSortCriterion(criterion);
              setSortDirection(direction);
              setStarred(nextStarred);
            }}
            sortCriterion={sortCriterion}
            sortDirection={sortDirection}
            starred={starred}
          />
        ) : undefined)
      }
      detailSidebarHeader={detailSidebarHeader}
    >
      {content}
    </PageShell>
  );
}

type WorkspaceDetailSidebarListProps = {
  icon: LucideIcon;
  items: Workspace[];
  onCreate: () => void;
  onOpenInNewTab: (item: Workspace) => void;
  onSelect: (item: Workspace) => void;
  onSortChange: (
    criterion: SortCriterion,
    direction: SortDirection,
    starred: boolean,
  ) => void;
  sortCriterion: SortCriterion;
  sortDirection: SortDirection;
  starred: boolean;
};

function WorkspaceDetailSidebarList({
  icon: Icon,
  items,
  onCreate,
  onOpenInNewTab,
  onSelect,
  onSortChange,
  sortCriterion,
  sortDirection,
  starred,
}: WorkspaceDetailSidebarListProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2">
      <DetailSidebarToolbar
        addLabel={t("workspace.createLibrary")}
        leadingAction={
          <ListSortMenu
            criterion={sortCriterion}
            direction={sortDirection}
            iconOnly
            onChange={onSortChange}
            starred={starred}
          />
        }
        onAdd={onCreate}
      />
      <div className="grid gap-1">
        {items.map((item) => (
          <SidebarItem key={item.workspaceId}>
            <button
              className="flex min-w-0 flex-1 items-center gap-1.5 border-0 bg-transparent px-2 py-1.5 text-left text-sm text-current"
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault();
                  onOpenInNewTab(item);
                }
              }}
              onClick={() => onSelect(item)}
              type="button"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.name}</span>
            </button>
          </SidebarItem>
        ))}
      </div>
    </div>
  );
}
