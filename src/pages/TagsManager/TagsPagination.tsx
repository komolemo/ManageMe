import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTagManager } from "./useTagManager";

export function TagsPagination() {
  const { t } = useTranslation();
  const {
    currentPage,
    paginationEntries,
    setCurrentPage,
    tagCount,
    totalPages,
    visibleEnd,
    visibleStart,
  } = useTagManager();

  return (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
      <span className="w-[120px]">
        {t("sort.showing")} {visibleStart}-{visibleEnd} {t("sort.of")} {" "}
        {tagCount}
      </span>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-label={t("a11y.previousTagPage")}
              aria-disabled={currentPage === 1}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              tabIndex={currentPage === 1 ? -1 : 0}
              text=""
            />
          </PaginationItem>
          {paginationEntries.map((entry) => (
            <PaginationItem key={entry}>
              {typeof entry === "number" ? (
                <PaginationLink
                  className="rounded-md"
                  href="#"
                  isActive={entry === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(entry);
                  }}
                >
                  {entry}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              aria-label={t("a11y.nextTagPage")}
              aria-disabled={currentPage === totalPages}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              tabIndex={currentPage === totalPages ? -1 : 0}
              text=""
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
