import { Mail, MapPin, Phone, User, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/erp/ui";
import { useRole } from "@/lib/role-context";

export function ProfilePage() {
  const { user } = useRole();

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  // Determine role/profile metadata subtitle
  let subtitle = "";
  if (user.role === "student") {
    subtitle = `Grade 10 – A · Roll #12 · ${user.id}`;
  } else {
    subtitle = `${user.dept || "Staff"} · ${user.custom_role || user.role} · ${user.id}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Personal and academic information." />

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-primary-glow to-info" />
        <div className="px-6 pb-6 -mt-12">
          <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground shadow-[var(--shadow-elegant)] select-none">
            {user.avatar || "US"}
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <button className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent cursor-pointer">
              Edit profile
            </button>
          </div>
        </div>
      </Card>

      {/* Show statistics depending on user type */}
      {user.role === "student" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attendance" value="96.2%" icon={Calendar} tone="success" />
          <StatCard label="GPA" value="8.7 / 10" icon={GraduationCap} tone="primary" />
          <StatCard label="Class Rank" value="#4 of 34" icon={User} tone="info" />
          <StatCard label="Activities" value="5 clubs" icon={User} tone="warning" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Joined Date" value={user.joined || "N/A"} icon={Calendar} tone="primary" />
          <StatCard label="Status" value={user.status || "Active"} icon={Briefcase} tone="success" />
          <StatCard label="Weekly Hours" value={user.metadata?.weeklyHours ? `${user.metadata.weeklyHours}h` : "24h"} icon={User} tone="info" />
          <StatCard label="Experience" value={user.metadata?.totalExperience ? `${user.metadata.totalExperience} Years` : "0 Years"} icon={User} tone="warning" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold">Contact details</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{user.email || "N/A"}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{user.phone || "N/A"}</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{user.address || "N/A"}</span>
            </li>
          </ul>
        </Card>

        {user.role === "student" ? (
          <Card className="p-5">
            <h3 className="font-semibold">Guardian</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Father</p>
                <p className="font-medium">Rajesh Singh · Senior Architect</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mother</p>
                <p className="font-medium">Vandana Singh · Pediatrician</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emergency contact</p>
                <p className="font-medium">98765 11220</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-5">
            <h3 className="font-semibold">Academic & Professional details</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Degree / Education</p>
                <p className="font-medium">{user.metadata?.degree || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Specialization</p>
                <p className="font-medium">{user.metadata?.specialization || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank Account Details</p>
                <p className="font-medium">{user.metadata?.bankName || "N/A"} · {user.metadata?.bankAccount || "N/A"}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
