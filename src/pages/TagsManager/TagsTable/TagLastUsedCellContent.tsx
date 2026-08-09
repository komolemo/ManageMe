export function TagLastUsedCellContent({
  lastUsedAt,
}: {
  lastUsedAt: string | null;
}) {
  return <>{lastUsedAt ?? "-"}</>;
}
