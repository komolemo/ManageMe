import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CreateNewButton } from "@/components/app/CreateNewButton";
import { Item } from "@/components/app/ItemCard";
import { ListSortMenu, type SortCriterion, type SortDirection } from "@/components/app/ListSortMenu";
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

export type WorkplaceListItem = {
  createdAt: string;
  description: string;
  id: string;
  isStarred: boolean;
  name: string;
  updatedAt: string;
};

type WorkplaceListProps = {
  breadcrumbLabel: string;
  createDescription: string;
  createItemDescription: string;
  entityLabel: string;
  icon: LucideIcon;
  idPrefix: string;
  initialItems: WorkplaceListItem[];
  onOpenInNewTab: (item: WorkplaceListItem) => void;
  onSelect: (item: WorkplaceListItem) => void;
};

export function WorkplaceList({
  breadcrumbLabel,
  createDescription,
  createItemDescription,
  entityLabel,
  icon,
  idPrefix,
  initialItems,
  onOpenInNewTab,
  onSelect,
}: WorkplaceListProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState(initialItems);
  const [sortCriterion, setSortCriterion] = useState<SortCriterion>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>(1);
  const [starred, setStarred] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const sortedItems = useMemo(() => {
    const nextItems = [...items];

    if (starred) {
      return nextItems.sort(
        (a, b) =>
          Number(b.isStarred) - Number(a.isStarred) ||
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

  const updateItem = (itemId: string, update: Partial<WorkplaceListItem>) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, ...update, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };
  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewItemName("");
  };
  const createItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    setItems((currentItems) => [
      ...currentItems,
      {
        createdAt: now,
        description: createItemDescription,
        id: `${idPrefix}-${Date.now()}`,
        isStarred: false,
        name,
        updatedAt: now,
      },
    ]);
    closeCreateDialog();
  };
  const duplicateItem = (item: WorkplaceListItem) => {
    const now = new Date().toISOString();
    setItems((currentItems) => {
      const names = new Set(currentItems.map((currentItem) => currentItem.name));
      const baseName = t("workplace.copyName", { itemName: item.name });
      let name = baseName;
      let number = 2;
      while (names.has(name)) name = `${baseName} ${number++}`;
      const index = currentItems.findIndex((currentItem) => currentItem.id === item.id);
      const duplicate = { ...item, createdAt: now, id: `${idPrefix}-${Date.now()}`, name, updatedAt: now };
      return [...currentItems.slice(0, index + 1), duplicate, ...currentItems.slice(index + 1)];
    });
  };

  return (
    <PageShell breadcrumbs={[{ label: breadcrumbLabel }, { label: "1" }]}>
      <div>
        <div className="mb-3 flex items-center justify-end gap-3">
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
        <div className="grid gap-3 border-b pt-[16px]">
          {sortedItems.map((item) => (
            <Item
              Icon={icon}
              actions={[
                { text: t("common.duplicate"), onClick: () => duplicateItem(item) },
                { text: t("common.copyUrl"), onClick: () => void navigator.clipboard.writeText(window.location.href) },
                { text: t("common.delete"), onClick: () => setItems((current) => current.filter((entry) => entry.id !== item.id)) },
              ]}
              isStarred={item.isStarred}
              itemDescription={item.description}
              itemName={item.name}
              key={item.id}
              onOpenInNewTab={() => onOpenInNewTab(item)}
              onSaveEditing={(name) => updateItem(item.id, { name })}
              onSelect={() => onSelect(item)}
              onToggleStar={() => updateItem(item.id, { isStarred: !item.isStarred })}
            />
          ))}
        </div>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => open ? setIsCreateDialogOpen(true) : closeCreateDialog()}>
        <DialogContent className="max-w-[425px] gap-[16px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="my-[4px] text-lg font-semibold uppercase">{t("workplace.createEntity", { entity: entityLabel })}</DialogTitle>
            <DialogDescription>{createDescription}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-[16px]" onSubmit={(event) => { event.preventDefault(); createItem(); }}>
            <Input
              aria-label={t("workplace.entityName", { entity: entityLabel })}
              autoFocus
              className="h-[36px] rounded-md px-[8px]"
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder={t("workplace.entityName", { entity: entityLabel })}
              value={newItemName}
            />
            <DialogFooter className="flex-row justify-end gap-[16px]">
              <Button className="w-[80px] rounded-md" onClick={closeCreateDialog} type="button" variant="outline">{t("common.cancel")}</Button>
              <Button className="w-[80px] rounded-md bg-[#238636] text-white hover:bg-[#2ea043]" disabled={!newItemName.trim()} type="submit">{t("common.create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
