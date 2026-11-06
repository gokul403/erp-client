import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "info" | "destructive";
}) {
  const toneClass = {
    primary: "from-primary/15 to-primary-glow/10 text-primary",
    success: "from-success/15 to-success/5 text-success",
    warning: "from-warning/20 to-warning/5 text-warning",
    info: "from-info/15 to-info/5 text-info",
    destructive: "from-destructive/15 to-destructive/5 text-destructive",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className="mt-1 text-xs font-medium text-success">{delta}</p>
          )}
        </div>
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br",
            toneClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "info" | "destructive" | "muted";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-[oklch(0.35_0.1_75)] dark:text-warning",
    info: "bg-info/15 text-info",
    destructive: "bg-destructive/15 text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): "success" | "warning" | "destructive" | "info" | "muted" | "default" {
  const s = status.toLowerCase();
  if (["active", "paid", "approved", "issued"].includes(s)) return "success";
  if (["pending", "trial", "partial", "documents", "interview"].includes(s)) return "warning";
  if (["overdue", "rejected", "suspended", "past due"].includes(s)) return "destructive";
  if (["alumni", "on leave"].includes(s)) return "muted";
  return "info";
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  onRowClick,
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode; align?: "left" | "right"; clickable?: boolean }[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((c) => (
              <th
                key={c.key as string}
                className={cn(
                  "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                  c.align === "right" && "text-right",
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn("border-b border-border last:border-0 transition-colors", onRowClick ? "hover:bg-accent/40" : "")}
            >
              {columns.map((c) => (
                <td
                  key={c.key as string}
                  onClick={c.clickable && onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "whitespace-nowrap px-4 py-3",
                    c.align === "right" && "text-right",
                    c.clickable && onRowClick ? "cursor-pointer hover:underline" : "",
                  )}
                >
                  {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableToolbar({
  placeholder = "Search…",
  search = "",
  onSearchChange,
  status = "All status",
  onStatusChange,
  statusOptions = ["All status", "Active", "Alumni", "Pending", "Inactive"],
  sort = "Sort: Newest",
  onSortChange,
  actions,
}: {
  placeholder?: string;
  search?: string;
  onSearchChange?: (val: string) => void;
  status?: string;
  onStatusChange?: (val: string) => void;
  statusOptions?: string[];
  sort?: string;
  onSortChange?: (val: string) => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
      <div className="relative min-w-0 flex-1">
        <input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs cursor-pointer outline-none focus:border-ring"
      >
        {statusOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange?.(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs cursor-pointer outline-none focus:border-ring"
      >
        <option value="Sort: Newest">Sort: Newest</option>
        <option value="Sort: Oldest">Sort: Oldest</option>
        <option value="Sort: A–Z">Sort: A–Z</option>
      </select>
      {actions}
    </div>
  );
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalEntries = 0,
  pageSize = 10,
}: {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalEntries?: number;
  pageSize?: number;
}) {
  if (!onPageChange) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-xs text-muted-foreground">
        <p>
          Showing <span className="font-semibold text-foreground">1–10</span> of{" "}
          <span className="font-semibold text-foreground">248</span> entries
        </p>
        <div className="flex items-center gap-1">
          {["‹", "1", "2", "3", "…", "25", "›"].map((p, i) => (
            <button
              key={i}
              className={cn(
                "min-w-8 rounded-md border border-input bg-background px-2 py-1 hover:bg-accent",
                p === "1" && "bg-primary text-primary-foreground border-primary",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const start = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalEntries);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-xs text-muted-foreground">
      <p>
        Showing <span className="font-semibold text-foreground">{start}–{end}</span> of{" "}
        <span className="font-semibold text-foreground">{totalEntries}</span> entries
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => currentPage > 1 && onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="min-w-8 h-8 rounded-md border border-input bg-background px-2 py-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          ‹
        </button>
        {pages.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => typeof p === "number" && onPageChange?.(p)}
            disabled={typeof p !== "number"}
            className={cn(
              "min-w-8 h-8 rounded-md border border-input bg-background px-2 py-1 hover:bg-accent cursor-pointer",
              p === currentPage && "bg-primary text-primary-foreground border-primary hover:bg-primary hover:opacity-90",
              typeof p !== "number" && "border-none hover:bg-transparent cursor-default",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => currentPage < totalPages && onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-w-8 h-8 rounded-md border border-input bg-background px-2 py-1 hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}
