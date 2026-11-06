import { ClipboardList, Plus } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/erp/ui";
import { useAssignmentsQuery } from "@/hooks/use-api-data";

export function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useAssignmentsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = assignments.length;
  const totalSubmissions = assignments.reduce((sum: number, a: any) => sum + a.submitted, 0);
  const totalStudentsCount = assignments.reduce((sum: number, a: any) => sum + a.total, 0);
  const submissionRate = totalStudentsCount > 0 ? Math.round((totalSubmissions / totalStudentsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Create, distribute and grade student work."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> New Assignment
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active" value={activeCount.toString()} icon={ClipboardList} tone="primary" />
        <StatCard label="Due this week" value="2" icon={ClipboardList} tone="warning" />
        <StatCard label="Submitted Rate" value={`${submissionRate}%`} icon={ClipboardList} tone="success" />
        <StatCard label="Graded Rate" value="62%" icon={ClipboardList} tone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assignments.map((a: any) => {
          const pct = Math.round((a.submitted / a.total) * 100);
          return (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{a.subject}</p>
                  <h3 className="mt-1 font-semibold leading-snug">{a.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{a.class} · Due {new Date(a.due).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">{pct}%</p>
                  <p className="text-[11px] text-muted-foreground">submitted</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.submitted} / {a.total} submissions</span>
                <button className="font-semibold text-primary hover:underline">Review →</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
