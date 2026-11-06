import { Bell } from "lucide-react";
import { Card, PageHeader } from "@/components/erp/ui";
import { useNotificationsQuery } from "@/hooks/use-api-data";

export function NotifPage() {
  const { data: notifications = [], isLoading } = useNotificationsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Stay updated with academic and administrative alerts." />
      <Card>
        <ul className="divide-y divide-border">
          {notifications.map((n: any, i: number) => (
            <li key={i} className="flex items-start gap-3 p-4 transition hover:bg-accent/40">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.time_ago} · {n.type}</p>
              </div>
              {i < 3 && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
