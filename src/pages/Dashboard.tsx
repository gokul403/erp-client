import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Building2,
  CalendarCheck,
  GraduationCap,
  School,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  AlertTriangle,
  BookMarked,
} from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard, statusTone } from "@/components/erp/ui";
import { TeacherDashboard } from "./TeacherDashboard";
import { useRole } from "@/lib/role-context";
import {
  useSchoolsQuery,
  useSubscriptionsQuery,
  useStudentsQuery,
  useStaffQuery,
  useAdmissionsQuery,
  useFeesQuery,
  useTimetableQuery,
  useNotificationsQuery,
} from "@/hooks/use-api-data";

// Client-side chart visual fallbacks
const ENROLLMENT_TREND = [
  { month: "Jan", students: 2210, admissions: 42 },
  { month: "Feb", students: 2245, admissions: 51 },
  { month: "Mar", students: 2298, admissions: 73 },
  { month: "Apr", students: 2336, admissions: 60 },
  { month: "May", students: 2378, admissions: 68 },
  { month: "Jun", stroke: "var(--color-chart-1)", students: 2412, admissions: 55 },
  { month: "Jul", students: 2455, admissions: 88 },
  { month: "Aug", students: 2487, admissions: 92 },
];

const PERFORMANCE_DIST = [
  { name: "A+ (90-100)", value: 412 },
  { name: "A (75-89)", value: 822 },
  { name: "B (60-74)", value: 768 },
  { name: "C (40-59)", value: 386 },
  { name: "Below 40", value: 99 },
];

const SUBJECTS_PROGRESS = [
  { subject: "Mathematics", marks: 88, grade: "A" },
  { subject: "Science", marks: 82, grade: "A" },
  { subject: "English", marks: 91, grade: "A+" },
  { subject: "Social Studies", marks: 76, grade: "B" },
  { subject: "Hindi", marks: 85, grade: "A" },
  { subject: "Computer Science", marks: 94, grade: "A+" },
];

const ATTENDANCE_BY_GRADE = [
  { grade: "Grade 1", attendance: 96 },
  { grade: "Grade 2", attendance: 95 },
  { grade: "Grade 3", attendance: 94 },
  { grade: "Grade 4", attendance: 93 },
  { grade: "Grade 5", attendance: 95 },
  { grade: "Grade 6", attendance: 91 },
  { grade: "Grade 7", attendance: 92 },
  { grade: "Grade 8", attendance: 93 },
  { grade: "Grade 9", attendance: 90 },
  { grade: "Grade 10", attendance: 94 },
];

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

export function Dashboard() {
  const { role, user } = useRole();

  if (role === "teacher") {
    return <TeacherDashboard teacherName={user?.name} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ? user.name.split(" ")[0] : "User"}`}
        subtitle="Here's what's happening across your school today."
        actions={
          <>
            <button className="hidden h-9 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-accent sm:inline-flex sm:items-center">
              This term
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
              + New Admission
            </button>
          </>
        }
      />

      {role === "super_admin" ? <SuperAdminView /> : role === "student" ? <StudentView /> : <SchoolView />}
    </div>
  );
}

function formatAmount(num: number) {
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${(num / 1000).toFixed(0)}K`;
}

function SuperAdminView() {
  const { data: schools = [] } = useSchoolsQuery();
  const { data: subs = [] } = useSubscriptionsQuery();

  const totalMrr = subs.reduce((sum, s) => sum + Number(s.mrr), 0);
  const trialCount = schools.filter((s: any) => s.status === "Trial").length;
  const activeCount = subs.filter((s: any) => s.status === "Active").length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Schools" value={schools.length.toString()} delta="+1 this week" icon={Building2} tone="primary" />
        <StatCard label="Active Subscriptions" value={activeCount.toString()} delta="100% retention" icon={Activity} tone="success" />
        <StatCard label="Monthly Recurring" value={formatAmount(totalMrr)} delta="+5% MoM" icon={Wallet} tone="info" />
        <StatCard label="Trial Accounts" value={trialCount.toString()} delta="converting" icon={TrendingUp} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ChartHeader title="Platform Revenue Growth" sub="MRR over the last 8 months" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subs.map((s: any, i: number) => ({ month: `SUB-${i}`, mrr: Number(s.mrr) }))}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="mrr" stroke="var(--color-chart-1)" fill="url(#g1)" strokeWidth={2} name="MRR (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartHeader title="Plan Distribution" sub="Active subscriptions" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Enterprise", value: subs.filter((s: any) => s.plan === "Enterprise").length },
                    { name: "Pro", value: subs.filter((s: any) => s.plan === "Pro").length },
                    { name: "Starter", value: subs.filter((s: any) => s.plan === "Starter").length },
                  ]}
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {CHART_COLORS.slice(0, 3).map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
          <div>
            <h3 className="font-semibold">Connected Schools</h3>
            <p className="text-xs text-muted-foreground">Top schools by enrolment</p>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">View all</button>
        </div>
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "School" },
            { key: "city", label: "City" },
            { key: "students_count", label: "Students", align: "right" },
            { key: "plan", label: "Plan" },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          ]}
          rows={schools.slice(0, 6)}
        />
      </Card>
    </>
  );
}

function StudentView() {
  const { data: timetable = [] } = useTimetableQuery();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value="96.2%" delta="Excellent" icon={CalendarCheck} tone="success" />
        <StatCard label="Current GPA" value="8.7 / 10" delta="+0.3 this term" icon={TrendingUp} tone="primary" />
        <StatCard label="Pending Fees" value="₹0" delta="All cleared" icon={Wallet} tone="info" />
        <StatCard label="Books Issued" value="1" delta="Due soon" icon={BookMarked} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ChartHeader title="Subject Performance" sub="Latest exam marks" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECTS_PROGRESS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="marks" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartHeader title="Today's Schedule" />
          <ul className="mt-2 space-y-2">
            {timetable.slice(0, 6).map((row: any, i: number) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                <div className="text-[11px] font-semibold text-muted-foreground w-24 shrink-0">{row.time}</div>
                <div className="font-medium truncate">{row.mon}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function SchoolView() {
  const { data: students = [] } = useStudentsQuery();
  const { data: staff = [] } = useStaffQuery();
  const { data: admissions = [] } = useAdmissionsQuery();
  const { data: fees = [] } = useFeesQuery();
  const { data: notifications = [] } = useNotificationsQuery();

  const collected = fees.filter((f: any) => f.status === "Paid").reduce((sum: number, f: any) => sum + Number(f.amount), 0);
  const pending = fees.filter((f: any) => f.status === "Pending" || f.status === "Overdue").reduce((sum: number, f: any) => sum + Number(f.amount), 0);
  const teachersCount = staff.filter((s: any) => s.role.toLowerCase().includes("teacher")).length;

  const schoolFeeCollectionChart = [
    { month: "Mar", collected: 6.8, pending: 1.4 },
    { month: "Apr", collected: 7.2, pending: 1.2 },
    { month: "May", collected: 7.8, pending: 1.0 },
    { month: "Jun", collected: 8.1, pending: 1.1 },
    { month: "Jul", collected: collected / 100000, pending: pending / 100000 },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length.toString()} delta="+138 this term" icon={GraduationCap} tone="primary" />
        <StatCard label="Total Teachers" value={teachersCount.toString()} delta="+8 hires" icon={Users} tone="info" />
        <StatCard label="Active Classes" value="12" delta="Across 12 grades" icon={School} tone="success" />
        <StatCard label="New Admissions" value={admissions.length.toString()} delta="+22% YoY" icon={UserPlus} tone="warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Fee Collected" value={formatAmount(collected)} delta="87% of target" icon={Wallet} tone="success" />
        <StatCard label="Pending Fees" value={formatAmount(pending)} delta="Invoices" icon={AlertTriangle} tone="destructive" />
        <StatCard label="Attendance" value="94.2%" delta="Last 30 days" icon={CalendarCheck} tone="info" />
        <StatCard label="Avg. Performance" value="78.4%" delta="+2.1% vs last term" icon={TrendingUp} tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ChartHeader title="Enrolment & Admissions" sub="Last 8 months" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENROLLMENT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis yAxisId="l" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="students" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} name="Total students" />
                <Line yAxisId="r" type="monotone" dataKey="admissions" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={false} name="New admissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartHeader title="Performance Distribution" sub="Current term" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PERFORMANCE_DIST} dataKey="value" innerRadius={50} outerRadius={88} paddingAngle={2}>
                  {PERFORMANCE_DIST.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ChartHeader title="Fee Collection vs Pending" sub="₹ Lakhs" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolFeeCollectionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="collected" stackId="a" fill="var(--color-chart-3)" radius={[0, 0, 0, 0]} name="Collected (₹L)" />
                <Bar dataKey="pending" stackId="a" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} name="Pending (₹L)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartHeader title="Attendance by Grade" sub="%" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTENDANCE_BY_GRADE} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" domain={[80, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis dataKey="grade" type="category" stroke="var(--color-muted-foreground)" fontSize={11} width={70} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="attendance" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="font-semibold">Recent Students</h3>
              <p className="text-xs text-muted-foreground">Newly enrolled or updated</p>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "grade", label: "Grade" },
              { key: "section", label: "Sec" },
              { key: "guardian", label: "Guardian" },
              { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            ]}
            rows={students.slice(0, 6)}
          />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Live system feed</p>
          <ul className="mt-4 space-y-3">
            {notifications.slice(0, 5).map((a: any) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.time_ago}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function ChartHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
