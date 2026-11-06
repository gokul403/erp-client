import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/erp/ui";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — EduSync" }] }),
  component: SettingsPage,
});

const SECTIONS = [
  { title: "Organization Profile", desc: "Name, logo, address, academic calendar", href: "/organization" },
  { title: "Permissions", desc: "Manage granular access rights that control which actions a user can perform within the system ", href: "/permissions" },
  { title: "Academic Year", desc: "Sessions, terms and grading scales", href: "/academic-year" },
  { title: "Fee Structure", desc: "Categories, late fees, payment gateways", href: "/fee-structure" },
  { title: "Departments", desc: "Configure and oversee the academic and administrative units of the institution", href: "/departments" },
  { title: "Notifications", desc: "Email, SMS and in-app channel preferences" },
  { title: "Roles", desc: "Define user roles and assign specific permission sets to each role.", href: "/roles" },
  { title: "Security", desc: "Password policy, 2FA, session timeout" },
  { title: "Class Section", desc: "Configure and manage class divisions or sections", href: "/classes" },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your organization and academic preferences." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const CardContent = (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
              <div>
                {s.href ? (
                  <span className="inline-block mt-4 text-xs font-semibold text-primary hover:underline">
                    Configure →
                  </span>
                ) : (
                  <button className="mt-4 text-xs font-semibold text-primary hover:underline">Configure →</button>
                )}
              </div>
            </div>
          );

          if (s.href) {
            return (
              <Link key={s.title} to={s.href} className="block h-full">
                <Card className="p-5 transition hover:shadow-[var(--shadow-elegant)] cursor-pointer h-full">
                  {CardContent}
                </Card>
              </Link>
            );
          }

          return (
            <Card key={s.title} className="p-5 transition hover:shadow-[var(--shadow-elegant)]">
              {CardContent}
            </Card>
          );
        })}
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
