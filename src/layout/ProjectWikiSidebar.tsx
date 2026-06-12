type ProjectWikiSidebarProps = {
  isOpen: boolean;
};

export function ProjectWikiSidebar({
  isOpen,
}: ProjectWikiSidebarProps) {
  return (
    <aside
      className={`min-h-[calc(100vh-48px)] shrink-0 overflow-hidden border-r bg-background text-foreground transition-[width] duration-200 ${
        isOpen ? "w-[200px]" : "w-0"
      }`}
      aria-label="Project Wiki sidebar"
    />
  );
}
