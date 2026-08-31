"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * DataTable — a full-featured, responsive data table.
 *
 * Column definition:
 * @typedef {{ key: string, header: string, sortable?: boolean, width?: string, cell?: (row) => React.ReactNode }} Column
 *
 * @param {Column[]} columns - column definitions
 * @param {object[]} data - array of row data objects
 * @param {boolean} [loading=false] - show skeleton loading rows
 * @param {boolean} [searchable=true] - show search bar
 * @param {string} [searchPlaceholder="Search..."]
 * @param {string[]} [searchKeys] - which keys to search (defaults to all non-function columns)
 * @param {number} [defaultPageSize=10]
 * @param {React.ReactNode} [emptyState] - custom empty state node
 * @param {string} [className]
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = "Search…",
  searchKeys,
  defaultPageSize = 10,
  emptyState,
  rightActions,
  getRowClassName,
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Keys to search against
  const resolvedSearchKeys = useMemo(
    () =>
      searchKeys ??
      columns
        .filter((c) => !c.cell || typeof c.cell !== "function")
        .map((c) => c.key),
    [searchKeys, columns],
  );

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      resolvedSearchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, search, resolvedSearchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      {(searchable || rightActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {searchable ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-subtext pointer-events-none" />
                <Input
                  value={search}
                  onChange={handleSearch}
                  placeholder={searchPlaceholder}
                  className="pl-8 h-8 text-xs border-brand-border bg-brand-bg text-brand-text placeholder:text-brand-subtext/60"
                />
              </div>
              <span className="text-xs text-brand-subtext shrink-0">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <div />
          )}

          {rightActions && (
            <div className="flex items-center gap-2 shrink-0">
              {rightActions}
            </div>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-brand-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-surface border-brand-border hover:bg-brand-surface">
              {columns.map((col, colIdx) => {
                const dataKey = col.key || col.accessorKey;
                return (
                  <TableHead
                    key={colIdx}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "text-[10px] font-medium text-slate-500 uppercase tracking-wider py-2 px-2.5",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                    )}
                  >
                    {col.sortable && dataKey ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(dataKey)}
                        className={cn(
                          "flex items-center gap-1 hover:text-brand-text transition-colors cursor-pointer",
                          col.align === "center" && "justify-center mx-auto",
                          col.align === "right" && "justify-end ml-auto",
                        )}
                      >
                        {col.header}
                        <ArrowUpDown
                          className={cn(
                            "w-3 h-3",
                            sortKey === dataKey
                              ? "text-brand-blue"
                              : "text-brand-border",
                          )}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map(
                (_, i) => (
                  <TableRow
                    key={`loading-${i}`}
                    className="border-brand-border"
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={`skeleton-${colIdx}`}
                        className="py-3 px-3"
                      >
                        <Skeleton className="h-4 w-full rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-xs text-brand-subtext"
                >
                  {emptyState ?? "No results found."}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, rowIndex) => {
                const customRowClass = getRowClassName ? getRowClassName(row, rowIndex) : "";
                return (
                  <TableRow
                    key={row.id ?? row._id ?? `row-${rowIndex}`}
                    className={cn(
                      "border-brand-border transition-colors",
                      customRowClass || "hover:bg-brand-surface/60",
                    )}
                  >
                    {columns.map((col, colIdx) => {
                      const dataKey = col.key || col.accessorKey;
                      return (
                        <TableCell
                          key={colIdx}
                          className={cn(
                            "py-2 px-2.5 text-xs text-brand-text",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                          )}
                        >
                          {col.cell ? col.cell(row) : (row[dataKey] ?? "—")}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`mobile-loading-${i}`}
              className="rounded-lg border border-brand-border p-3 space-y-2 bg-brand-bg"
            >
              {columns.slice(0, 3).map((col, colIdx) => (
                <Skeleton
                  key={col.key || col.accessorKey || `mob-skel-${colIdx}`}
                  className="h-4 w-full rounded"
                />
              ))}
            </div>
          ))
        ) : paged.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-subtext">
            {emptyState ?? "No results found."}
          </div>
        ) : (
          paged.map((row, rowIndex) => (
            <div
              key={row.id ?? row._id ?? `mob-row-${rowIndex}`}
              className="rounded-lg border border-brand-border p-3 bg-brand-bg space-y-2"
            >
              {columns.map((col, colIdx) => {
                const cKey =
                  col.key || col.accessorKey || col.id || `mob-cell-${colIdx}`;
                const dataKey = col.key || col.accessorKey;
                return (
                  <div
                    key={cKey}
                    className="flex items-start justify-between gap-2"
                  >
                    <span className="text-[10px] font-bold text-brand-subtext uppercase tracking-wider shrink-0">
                      {col.header}
                    </span>
                    <span className="text-xs text-brand-text text-right">
                      {col.cell ? col.cell(row) : (row[dataKey] ?? "—")}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-brand-subtext">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs border-brand-border bg-brand-bg focus:ring-brand-blue/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border-brand-border">
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-brand-subtext mr-2">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
