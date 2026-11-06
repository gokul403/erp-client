import { CreditCard } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, TableToolbar, statusTone } from "@/components/erp/ui";
import { useSubscriptionsQuery } from "@/hooks/use-api-data";

export function SubsPage() {
  const { data: subscriptions = [], isLoading } = useSubscriptionsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalMrr = subscriptions.reduce((sum: number, s: any) => sum + Number(s.mrr), 0);
  const activeCount = subscriptions.filter((s: any) => s.status === "Active").length;

  const formatAmount = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${(num / 1000).toFixed(1)}K`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" subtitle="Plans, billing and renewal cycles." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={formatAmount(totalMrr)} icon={CreditCard} tone="primary" />
        <StatCard label="Active" value={activeCount.toString()} icon={CreditCard} tone="success" />
        <StatCard label="Renewing < 30d" value="2" icon={CreditCard} tone="warning" />
        <StatCard label="Churn (90d)" value="0%" icon={CreditCard} tone="info" />
      </div>
      <Card>
        <TableToolbar placeholder="Search subscriptions…" />
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "school", label: "School" },
            { key: "plan", label: "Plan", render: (r) => <Badge tone="info">{r.plan}</Badge> },
            { key: "seats", label: "Seats", align: "right" },
            { key: "mrr", label: "MRR (₹)", align: "right", render: (r) => Number(r.mrr).toLocaleString() },
            { key: "renews", label: "Renews", render: (r) => new Date(r.renews).toLocaleDateString() },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          ]}
          rows={subscriptions}
        />
      </Card>
    </div>
  );
}
