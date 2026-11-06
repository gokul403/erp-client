import { Card, PageHeader } from "@/components/erp/ui";

const SECTIONS = [
  { title: "Organization Profile", desc: "Name, logo, address, academic calendar" },
  { title: "Branding", desc: "Theme, colors, email & report templates" },
  { title: "Academic Year", desc: "Sessions, terms and grading scales" },
  { title: "Fee Structure", desc: "Categories, late fees, payment gateways" },
  { title: "Notifications", desc: "Email, SMS and in-app channel preferences" },
  { title: "Integrations", desc: "Google Workspace, Microsoft 365, payment providers" },
  { title: "Security", desc: "Password policy, 2FA, session timeout" },
  { title: "Backup & Audit", desc: "Automated backups and activity logs" },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your organization and academic preferences." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-5 transition hover:shadow-[var(--shadow-elegant)]">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            <button className="mt-4 text-xs font-semibold text-primary hover:underline">Configure →</button>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">General preferences</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="School name" value="Greenfield International School" />
          <Field label="Academic year" value="2025 — 2026" />
          <Field label="Timezone" value="Asia / Kolkata (GMT+5:30)" />
          <Field label="Default language" value="English" />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
