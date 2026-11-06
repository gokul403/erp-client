import { Megaphone, Plus } from "lucide-react";
import { Card, PageHeader } from "@/components/erp/ui";

const NOTICES = [
  { id: 1, title: "Parent-Teacher Meeting · Saturday 5 July", body: "Quarterly PTA across all grades. Slots from 9:00 AM to 1:00 PM in the auditorium.", audience: "All Parents", date: "Today" },
  { id: 2, title: "Mid-term results published", body: "Mid-term scorecards are now available in the student portal. Counselling sessions begin Monday.", audience: "Students & Parents", date: "Yesterday" },
  { id: 3, title: "Inter-school sports week", body: "Selected students must report to the sports complex by 7:30 AM for the opening ceremony.", audience: "Athletics", date: "2 days ago" },
  { id: 4, title: "Library: new arrivals", body: "12 new titles added across fiction, science and biography sections. Reserve online from the library tab.", audience: "All Students", date: "3 days ago" },
  { id: 5, title: "Staff meeting on Friday", body: "Monthly review and academic planning. Conference room A at 4:00 PM. Attendance mandatory.", audience: "Faculty", date: "4 days ago" },
];

export function NoticesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notices & Announcements"
        subtitle="Broadcast updates to students, parents and staff."
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> New Notice
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {NOTICES.map((n) => (
          <Card key={n.id} className="p-5 transition hover:shadow-[var(--shadow-elegant)]">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary-glow/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{n.audience}</span>
                  <span className="text-[11px] text-muted-foreground">{n.date}</span>
                </div>
                <h3 className="mt-1.5 font-semibold leading-snug">{n.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{n.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
