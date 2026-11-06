import { PencilRuler } from "lucide-react";
import { Card, DataTable, PageHeader, StatCard } from "@/components/erp/ui";
import { STUDENTS, SUBJECTS_PROGRESS } from "@/lib/mock-data";

const SUBJECTS = ["Maths", "Science", "English", "Social", "Hindi"];

export function MarksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Exam Results"
        subtitle="Record exam scores and publish results."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            Publish Results
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg. Class %" value="78.4%" icon={PencilRuler} tone="primary" />
        <StatCard label="Top Score" value="98" icon={PencilRuler} tone="success" />
        <StatCard label="Below 40%" value="6 students" icon={PencilRuler} tone="destructive" />
        <StatCard label="Pending Entry" value="3 subjects" icon={PencilRuler} tone="warning" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">Your latest scorecard</h3>
        <p className="text-xs text-muted-foreground">Mid-Term Examination · 2025-26</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS_PROGRESS.map((s) => (
            <div key={s.subject} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{s.subject}</p>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{s.grade}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{s.marks}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <select className="h-9 rounded-md border border-input bg-background px-2 text-xs">
            <option>Grade 10 – A</option>
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-xs">
            <option>Mid-Term · Mathematics</option>
            <option>Final · Mathematics</option>
          </select>
        </div>
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Student" },
            { key: "roll", label: "Roll", align: "right" },
            ...SUBJECTS.map((s, idx) => ({
              key: s,
              label: s,
              align: "right" as const,
              render: (r: any) => {
                const score = 60 + ((r.roll * 7 + idx * 11) % 38);
                return <span className="font-mono text-sm">{score}</span>;
              },
            })),
          ]}
          rows={STUDENTS}
        />
      </Card>
    </div>
  );
}
