import { Building2, Plus } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, Pagination, StatCard, TableToolbar, statusTone } from "@/components/erp/ui";
import { useSchoolsQuery } from "@/hooks/use-api-data";

export function SchoolsPage() {
  const { data: schools = [], isLoading } = useSchoolsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = schools.filter((s: any) => s.status === "Active").length;
  const trialCount = schools.filter((s: any) => s.status === "Trial").length;
  const suspendedCount = schools.filter((s: any) => s.status === "Suspended").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        subtitle="Manage onboarded schools across the platform."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Add School
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Schools" value={schools.length.toString()} icon={Building2} tone="primary" />
        <StatCard label="Active" value={activeCount.toString()} icon={Building2} tone="success" />
        <StatCard label="Trial" value={trialCount.toString()} icon={Building2} tone="warning" />
        <StatCard label="Suspended" value={suspendedCount.toString()} icon={Building2} tone="destructive" />
      </div>

      <Card>
        <TableToolbar placeholder="Search schools by name or city…" />
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "School name" },
            { key: "city", label: "City" },
            { key: "students_count", label: "Students", align: "right" },
            { key: "plan", label: "Plan", render: (r) => <Badge tone="info">{r.plan}</Badge> },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          ]}
          rows={schools}
        />
        <Pagination />
      </Card>
    </div>
  );
}
