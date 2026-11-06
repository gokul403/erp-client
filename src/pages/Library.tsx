import { BookMarked, Plus } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, TableToolbar } from "@/components/erp/ui";
import { useBooksQuery } from "@/hooks/use-api-data";

export function LibPage() {
  const { data: books = [], isLoading } = useBooksQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalCopies = books.reduce((sum: number, b: any) => sum + b.copies, 0);
  const issuedCount = books.reduce((sum: number, b: any) => sum + (b.copies - b.available), 0);
  const availableCount = books.reduce((sum: number, b: any) => sum + b.available, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Catalog"
        subtitle="Browse and manage the school's collection."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Add Book
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Titles" value={books.length.toString()} icon={BookMarked} tone="primary" />
        <StatCard label="Total Copies" value={totalCopies.toString()} icon={BookMarked} tone="info" />
        <StatCard label="Issued" value={issuedCount.toString()} icon={BookMarked} tone="destructive" />
        <StatCard label="Available" value={availableCount.toString()} icon={BookMarked} tone="success" />
      </div>

      <Card>
        <TableToolbar placeholder="Search by title, author or category…" />
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "title", label: "Title" },
            { key: "author", label: "Author" },
            { key: "category", label: "Category", render: (r) => <Badge tone="info">{r.category}</Badge> },
            { key: "copies", label: "Copies", align: "right" },
            { key: "available", label: "Available", align: "right", render: (r) => (
              <span className={r.available === 0 ? "font-semibold text-destructive" : "font-semibold text-success"}>
                {r.available}
              </span>
            )},
          ]}
          rows={books}
        />
      </Card>
    </div>
  );
}
