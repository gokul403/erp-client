import { Plus, Users as UsersIcon } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, Pagination, StatCard, TableToolbar } from "@/components/erp/ui";
import { ROLE_LABELS, type Role } from "@/lib/mock-data";
import { useUsersQuery } from "@/hooks/use-api-data";

export function UsersPage() {
  const { data: users = [], isLoading } = useUsersQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = users.filter((u: any) => u.status === "Active").length;
  const pendingCount = users.filter((u: any) => u.status === "Invited" || u.status === "Pending").length;
  const suspendedCount = users.filter((u: any) => u.status === "Suspended").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        subtitle="Provision accounts and assign role-based permissions."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Invite User
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={users.length.toString()} icon={UsersIcon} tone="primary" />
        <StatCard label="Active" value={activeCount.toString()} icon={UsersIcon} tone="success" />
        <StatCard label="Pending Invites" value={pendingCount.toString()} icon={UsersIcon} tone="warning" />
        <StatCard label="Suspended" value={suspendedCount.toString()} icon={UsersIcon} tone="destructive" />
      </div>
      <Card>
        <TableToolbar placeholder="Search users by name or email…" />
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (r) => <Badge tone="info">{ROLE_LABELS[r.role as Role] || r.role}</Badge> },
            { key: "school", label: "School", render: (r) => r.school || "—" },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Active" ? "success" : r.status === "Invited" ? "warning" : "destructive"}>{r.status}</Badge> },
          ]}
          rows={users}
        />
        <Pagination />
      </Card>
    </div>
  );
}
