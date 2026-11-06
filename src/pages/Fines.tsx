import { AlertCircle } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, TableToolbar } from "@/components/erp/ui";

const FINES = [
  { id: "FN-2210", student: "Ishaan Verma", grade: "Grade 6-B", book: "Harry Potter & The Sorcerer's Stone", days: 8, amount: 40, status: "Unpaid" },
  { id: "FN-2211", student: "Vikrant Joshi", grade: "Grade 9-A", book: "The Discovery of India", days: 4, amount: 20, status: "Paid" },
  { id: "FN-2212", student: "Saanvi Iyer", grade: "Grade 7-A", book: "Fundamentals of Physics", days: 12, amount: 60, status: "Unpaid" },
  { id: "FN-2213", student: "Riya Menon", grade: "Grade 11-B", book: "Atomic Habits", days: 3, amount: 15, status: "Waived" },
];

export function FinesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fine Management" subtitle="Track overdue books and outstanding fines." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding" value="₹4,280" icon={AlertCircle} tone="destructive" />
        <StatCard label="Collected (mo)" value="₹12,640" icon={AlertCircle} tone="success" />
        <StatCard label="Members w/ Fines" value="42" icon={AlertCircle} tone="warning" />
        <StatCard label="Waived" value="₹620" icon={AlertCircle} tone="info" />
      </div>
      <Card>
        <TableToolbar placeholder="Search fines…" />
        <DataTable
          columns={[
            { key: "id", label: "Fine ID" },
            { key: "student", label: "Student" },
            { key: "grade", label: "Class" },
            { key: "book", label: "Book" },
            { key: "days", label: "Days late", align: "right" },
            { key: "amount", label: "Amount (₹)", align: "right" },
            { key: "status", label: "Status", render: (r) => (
              <Badge tone={r.status === "Paid" ? "success" : r.status === "Unpaid" ? "destructive" : "muted"}>{r.status}</Badge>
            )},
          ]}
          rows={FINES}
        />
      </Card>
    </div>
  );
}
