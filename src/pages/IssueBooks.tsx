import { ArrowRightLeft } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, TableToolbar, statusTone } from "@/components/erp/ui";
import { useIssuedBooksQuery } from "@/hooks/use-api-data";

export function IssuePage() {
  const { data: issuedBooks = [], isLoading } = useIssuedBooksQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeIssues = issuedBooks.filter((i: any) => i.status === "Issued").length;
  const overdueIssues = issuedBooks.filter((i: any) => i.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue & Return"
        subtitle="Manage book circulation and due dates."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            + Issue Book
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Circulation" value={issuedBooks.length.toString()} icon={ArrowRightLeft} tone="primary" />
        <StatCard label="Active Issues" value={activeIssues.toString()} icon={ArrowRightLeft} tone="info" />
        <StatCard label="Overdue" value={overdueIssues.toString()} icon={ArrowRightLeft} tone="destructive" />
        <StatCard label="Due This Week" value="4" icon={ArrowRightLeft} tone="warning" />
      </div>

      <Card>
        <TableToolbar placeholder="Search by book or student…" />
        <DataTable
          columns={[
            { key: "id", label: "Ticket" },
            { key: "book", label: "Book" },
            { key: "student", label: "Student" },
            { key: "grade", label: "Class" },
            { key: "issued", label: "Issued", render: (r) => new Date(r.issued).toLocaleDateString() },
            { key: "due", label: "Due", render: (r) => new Date(r.due).toLocaleDateString() },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { key: "act", label: "", render: () => <button className="text-xs font-semibold text-primary hover:underline">Return</button> },
          ]}
          rows={issuedBooks}
        />
      </Card>
    </div>
  );
}
