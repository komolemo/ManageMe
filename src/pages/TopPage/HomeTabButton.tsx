type HomeTabButtonProps = {
  children: string;
  isSelected: boolean;
  onClick: () => void;
};

export function HomeTabButton({
  children,
  isSelected,
  onClick,
}: HomeTabButtonProps) {
  return (
    <button
      aria-selected={isSelected}
      className="h-[32px] cursor-pointer border-0 bg-transparent px-[8px] text-base font-medium text-foreground/70 hover:text-foreground"
      onClick={onClick}
      role="tab"
      style={{
        borderBottom: isSelected
          ? "2px solid var(--foreground)"
          : "2px solid transparent",
      }}
      type="button"
    >
      {children}
    </button>
  );
}
