import { Users } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, TableToolbar } from "@/components/erp/ui";

const MEMBERS = [
  { id: "LIB-1042", name: "Aarav Singh", type: "Student", grade: "Grade 10-A", issued: 2, since: "2022-06-15", status: "Active" },
  { id: "LIB-1043", name: "Ananya Rao", type: "Student", grade: "Grade 9-B", issued: 1, since: "2023-06-10", status: "Active" },
  { id: "LIB-1044", name: "Vikram Iyer", type: "Faculty", grade: "Sr. Sec.", issued: 4, since: "2018-06-12", status: "Active" },
  { id: "LIB-1045", name: "Ishaan Verma", type: "Student", grade: "Grade 6-B", issued: 3, since: "2024-04-01", status: "Overdue" },
  { id: "LIB-1046", name: "Sneha Pillai", type: "Staff", grade: "Finance", issued: 1, since: "2017-03-18", status: "Active" },
];

export function MembersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Library Members" subtitle="All students and staff registered with the library." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value="2,671" icon={Users} tone="primary" />
        <StatCard label="Active Issuers" value="1,284" icon={Users} tone="success" />
        <StatCard label="Overdue" value="38" icon={Users} tone="destructive" />
        <StatCard label="Faculty" value="184" icon={Users} tone="info" />
      </div>
      <Card>
        <TableToolbar placeholder="Search members…" />
        <DataTable
          columns={[
            { key: "id", label: "Member" },
            { key: "name", label: "Name" },
            { key: "type", label: "Type", render: (r) => <Badge tone="info">{r.type}</Badge> },
            { key: "grade", label: "Class / Dept." },
            { key: "issued", label: "Books out", align: "right" },
            { key: "since", label: "Member since" },
            { key: "status", label: "Status", render: (r) => (
              <Badge tone={r.status === "Active" ? "success" : "destructive"}>{r.status}</Badge>
            )},
          ]}
          rows={MEMBERS}
        />
      </Card>
    </div>
  );
}
