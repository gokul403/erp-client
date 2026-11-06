import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTeacherTimetablesQuery } from "@/hooks/use-api-data";
import { useRole } from "../lib/role-context";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { ExamBoardModal } from "@/components/dashboard/ExamBoardModal";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Megaphone,
  TrendingUp,
  AlertTriangle,
  Award,
  Upload
} from "lucide-react";
import { Badge, Card } from "@/components/erp/ui";
import { toast } from "sonner";

// --- MOCK DATA FOR CAROUSEL ---
const BANNER_SLIDES = [
  {
    id: 1,
    badge: "URGENT · ANNOUNCEMENT",
    title: "Mid-term marks entry deadline: July 30",
    desc: "All subject teachers must submit marks on the Exam Board before 6 PM Thursday. Portal locks automatically after deadline.",
    cta: "Go to Exam Board →",
    gradient: "from-teal-500 via-teal-600 to-emerald-700",
    glowColor: "bg-teal-400/20"
  },
  {
    id: 2,
    badge: "GENERAL · NOTIFICATION",
    title: "Parent-Teacher Meeting (PTM) Scheduled",
    desc: "The second term parent-teacher meeting is scheduled for August 5. View your slots allocations and schedule parameters.",
    cta: "View Slot Allocations →",
    gradient: "from-indigo-500 via-indigo-600 to-purple-700",
    glowColor: "bg-indigo-400/20"
  },
  {
    id: 3,
    badge: "CONGRATULATIONS 🎉",
    title: "Grade 10-A achieved 98% Math attendance!",
    desc: "Kudos to Vikram Iyer and Grade 10-A students for achieving record-breaking weekly attendance and engagement score.",
    cta: "View Engagement Stats →",
    gradient: "from-amber-500 via-orange-600 to-rose-700",
    glowColor: "bg-orange-400/20"
  }
];

// --- STATS CARDS DATA ---
const STATS_DATA = [
  {
    id: 1,
    label: "Classes today",
    value: "4",
    delta: "Mon, Tue, Thu",
    icon: Calendar,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
  },
  {
    id: 2,
    label: "Total students",
    value: "128",
    delta: "Across 4 sections",
    icon: Users,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    id: 3,
    label: "Attendance today",
    value: "92%",
    delta: "▲ 2.1% vs yesterday",
    icon: CheckCircle,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
    trend: true
  },
  {
    id: 4,
    label: "Pending tasks",
    value: "7",
    delta: "3 ungraded exams",
    icon: Clock,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    alert: true
  }
];

// --- TIMETABLE UTILITIES ---
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const startPart = timeStr.split("-")[0].trim();
  const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);
  const modifier = match[3];
  
  if (modifier) {
    const modUpper = modifier.toUpperCase();
    if (modUpper === "PM" && hours < 12) hours += 12;
    if (modUpper === "AM" && hours === 12) hours = 0;
  }
  
  return hours * 60 + minutes;
}

function endTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const endPart = timeStr.split("-")[1]?.trim();
  if (!endPart) return 0;
  
  const match = endPart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);
  const modifier = match[3];
  
  if (modifier) {
    const modUpper = modifier.toUpperCase();
    if (modUpper === "PM" && hours < 12) hours += 12;
    if (modUpper === "AM" && hours === 12) hours = 0;
  }
  
  return hours * 60 + minutes;
}

// --- CLASS CARDS LIST ---
const CLASSES_LIST = [
  { id: "10A", name: "Grade 10-A", subject: "Mathematics", attendance: 96, students: 32, status: "Live" },
  { id: "10B", name: "Grade 10-B", subject: "Mathematics", attendance: 91, students: 30, status: "2:00 PM" },
  { id: "9A", name: "Grade 9-A", subject: "Mathematics", attendance: 88, students: 34, status: "Done" },
  { id: "9B", name: "Grade 9-B", subject: "Mathematics", attendance: 94, students: 32, status: "12:30 PM" }
];

// --- WEEKLY ATTENDANCE TRENDS ---
const ATTENDANCE_TREND_DATA = [
  { day: "Mon", attendance: 92 },
  { day: "Tue", attendance: 95 },
  { day: "Wed", attendance: 90 },
  { day: "Thu", attendance: 93 },
  { day: "Fri", attendance: 96 },
  { day: "Sat", attendance: 91 },
  { day: "Sun", attendance: 94 }
];

// --- EXAM RESULTS TABS ---
const EXAM_RESULTS_BY_CLASS = {
  "10-A": { title: "Mid-Term · Mathematics", date: "Published 2 days ago", students: 32, avgScore: 85, passRate: "96%", highest: 91, lowest: 54 },
  "10-B": { title: "Mid-Term · Mathematics", date: "Published 3 days ago", students: 30, avgScore: 81, passRate: "93%", highest: 89, lowest: 48 },
  "9-A": { title: "Mid-Term · Mathematics", date: "Published 4 days ago", students: 34, avgScore: 78, passRate: "91%", highest: 94, lowest: 45 },
  "9-B": { title: "Mid-Term · Mathematics", date: "Published 5 days ago", students: 32, avgScore: 83, passRate: "94%", highest: 92, lowest: 50 }
};

// --- UPCOMING EXAMS LIST ---
const UPCOMING_EXAMS = [
  { day: "01", month: "AUG", title: "Unit Test 3 · Grade 9-B", subtitle: "Mathematics - 10:00 AM" },
  { day: "05", month: "AUG", title: "Mid-Term Retest · Grade 10-B", subtitle: "Mathematics - 11:30 AM" },
  { day: "12", month: "AUG", title: "Final Prep Quiz · Grade 10-A", subtitle: "Mathematics - 9:00 AM" }
];

// --- SPRING ANIMATION CONSTANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export function TeacherDashboard({ teacherName = "Vikram Iyer" }) {
  const { user } = useRole();
  const currentTeacherName = user?.name || teacherName;
  const { data: timetables = [], isLoading: isTimetablesLoading } = useTeacherTimetablesQuery();

  const [activeResultsTab, setActiveResultsTab] = useState<keyof typeof EXAM_RESULTS_BY_CLASS>("10-A");
  const selectedResult = EXAM_RESULTS_BY_CLASS[activeResultsTab];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = weekdays[now.getDay()];

  const todayClasses: any[] = [];

  timetables.forEach((t: any) => {
    const slots = t.slots || {};
    const periods = t.periods || [];

    Object.entries(slots).forEach(([key, slotVal]: [string, any]) => {
      if (!key.startsWith(`${todayName}-`)) return;
      if (!slotVal || slotVal.teacher !== currentTeacherName) return;

      const periodId = key.replace(`${todayName}-`, "");
      const periodDef = periods.find((p: any) => p.id === periodId);
      if (!periodDef || periodDef.isBreak) return;

      todayClasses.push({
        periodId,
        periodName: periodDef.name || `Period ${periodId}`,
        time: periodDef.time || "",
        subject: slotVal.subject,
        className: `${t.grade} - Section ${t.section || "A"}`,
        room: slotVal.room || "Classroom",
        originalPeriod: periodDef
      });
    });
  });

  todayClasses.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const classesWithStatus = todayClasses.map((cls) => {
    const startMins = timeToMinutes(cls.time);
    const endMins = endTimeToMinutes(cls.time);
    
    let status: "Upcoming" | "Ongoing" | "Completed" = "Upcoming";
    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      status = "Ongoing";
    } else if (currentMinutes > endMins) {
      status = "Completed";
    }
    
    return {
      ...cls,
      status,
      active: status === "Ongoing"
    };
  });

  // States for Exam Board Modal
  const [isExamBoardOpen, setIsExamBoardOpen] = useState(false);
  const [examClass, setExamClass] = useState("10-A");
  const [examType, setExamType] = useState("Mid-Term");
  const [activeModalTab, setActiveModalTab] = useState<"direct" | "excel">("direct");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [studentResults, setStudentResults] = useState([
    { rollNo: "1", name: "Aarav Singh", marks: "88", grade: "A" },
    { rollNo: "2", name: "Ananya Rao", marks: "92", grade: "A+" },
    { rollNo: "3", name: "Ishaan Verma", marks: "76", grade: "B" },
    { rollNo: "4", name: "Diya Patel", marks: "85", grade: "A" },
    { rollNo: "5", name: "Kabir Khan", marks: "68", grade: "C" },
    { rollNo: "6", name: "Saanvi Iyer", marks: "94", grade: "A+" }
  ]);

  const handleMarksChange = (idx: number, newMarks: string) => {
    const updated = [...studentResults];
    updated[idx].marks = newMarks;
    
    // Calculate grade dynamically
    const m = Number(newMarks);
    let g = "F";
    if (m >= 90) g = "A+";
    else if (m >= 80) g = "A";
    else if (m >= 70) g = "B";
    else if (m >= 60) g = "C";
    else if (m >= 40) g = "D";
    
    updated[idx].grade = g;
    setStudentResults(updated);
  };

  const handleSaveResults = () => {
    toast.success("Exam results published and uploaded successfully to the Exam Board!");
    setIsExamBoardOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      toast.success(`Excel file "${file.name}" uploaded successfully! 6 student records parsed.`);
    }
  };

  const parsedMarks = studentResults.map(r => Number(r.marks) || 0);
  const averageScore = parsedMarks.length ? Math.round(parsedMarks.reduce((a, b) => a + b, 0) / parsedMarks.length) : 0;
  const passRate = parsedMarks.length ? `${Math.round((parsedMarks.filter(m => m >= 40).length / parsedMarks.length) * 100)}%` : "0%";
  const highestScore = parsedMarks.length ? Math.max(...parsedMarks) : 0;
  const lowestScore = parsedMarks.length ? Math.min(...parsedMarks) : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1200px] mx-auto pb-10"
    >
      {/* 1. Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between select-none">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Monday, 27 July 2026
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 mt-1">
            Good morning, {teacherName}
            <motion.span
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="inline-block origin-[70%_70%]"
            >
              👋
            </motion.span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students, classes..."
              className="h-10 w-48 sm:w-64 rounded-full border border-border bg-card pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent transition cursor-pointer">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          </button>

          {/* Avatar */}
          <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-primary-foreground shadow-sm cursor-pointer hover:opacity-90">
            VI
          </button>
        </div>
      </div>

      {/* 2. Announcement Carousel Section */}
      <motion.div variants={itemVariants}>
        <AnnouncementCarousel />
      </motion.div>

      {/* 3. Stat Cards Summary Grid */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS_DATA.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
              className="group p-5 border border-border/80 bg-card rounded-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">{stat.label}</span>
                <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</span>
                <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.trend && <span className="text-emerald-500 font-semibold">{stat.delta}</span>}
                  {!stat.trend && stat.delta}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 4. Two-column Row: Timetable & Classes */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Timetable List (55%) */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <Card className="p-5 border border-border/80 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h3 className="text-sm font-bold tracking-tight text-foreground">Today's Timetable</h3>
                <Link to="/timetable" search={{ classId: timetables[0]?.class_id || "CL-01" }} className="text-xs font-bold text-primary hover:underline">Full view</Link>
              </div>
              <div className="mt-4 space-y-4">
                {isTimetablesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : classesWithStatus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/5 border border-dashed border-border rounded-xl">
                    <Calendar className="h-8 w-8 text-muted-foreground/45 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-muted-foreground">No classes scheduled for today.</p>
                  </div>
                ) : (
                  classesWithStatus.map((slot, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-16 text-[10px] font-bold text-muted-foreground py-0.5">{slot.time}</div>
                      <div className="relative pl-4 border-l border-border/80 flex-1 pb-1">
                        {/* Active indicator dot */}
                        {slot.active ? (
                          <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          </span>
                        ) : (
                          <span className="absolute -left-[3px] top-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        )}
                        
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {slot.className} <span className="text-muted-foreground font-normal">· {slot.subject}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" /> {slot.room}
                            </p>
                          </div>
                          <div>
                            {slot.active ? (
                              <Badge tone="success">
                                ONGOING
                              </Badge>
                            ) : slot.status === "Completed" ? (
                              <Badge tone="default">
                                COMPLETED
                              </Badge>
                            ) : (
                              <Badge tone="info">
                                UPCOMING
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* My Classes Grid (45%) */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <Card className="p-5 border border-border/80 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h3 className="text-sm font-bold tracking-tight text-foreground">My Classes</h3>
                <Link to="/classes" className="text-xs font-bold text-primary hover:underline">View all</Link>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-4">
                {CLASSES_LIST.map((cls) => (
                  <div key={cls.id} className="p-3 border border-border/80 bg-card rounded-xl flex items-center justify-between gap-2 transition hover:shadow-sm">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{cls.subject}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-bold text-muted-foreground">{cls.students} students</span>
                        {cls.status === "Live" ? (
                          <Badge tone="success">LIVE</Badge>
                        ) : (
                          <span className="text-[9px] font-semibold text-muted-foreground/80">{cls.status}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <CircularProgress value={cls.attendance} size={42} strokeWidth={3} colorClass="text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 5. Two-column Row: Attendance Trend + Recent Exam Results */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Attendance Area Chart (60%) */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <Card className="p-5 border border-border/80 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h3 className="text-sm font-bold tracking-tight text-foreground">Attendance Trend</h3>
                <button className="text-xs font-bold text-primary hover:underline cursor-pointer">This week</button>
              </div>
              <div className="h-64 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ATTENDANCE_TREND_DATA} margin={{ left: -25, right: 5, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} />
                    <YAxis domain={[80, 100]} stroke="var(--color-muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="attendance" stroke="var(--color-chart-1)" fill="url(#attendanceGlow)" strokeWidth={2.5} name="Attendance (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Exam Results (40%) */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <Card className="p-5 border border-border/80 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h3 className="text-sm font-bold tracking-tight text-foreground">Recent Exam Results</h3>
                <button onClick={() => setIsExamBoardOpen(true)} className="text-xs font-bold text-primary hover:underline cursor-pointer">Exam Board</button>
              </div>

              {/* Sliding highlight tabs */}
              <div className="flex border-b border-border/50 gap-1 p-0.5 bg-muted/20 rounded-lg mt-3 select-none">
                {Object.keys(EXAM_RESULTS_BY_CLASS).map((tabKey) => {
                  const active = activeResultsTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      onClick={() => setActiveResultsTab(tabKey as any)}
                      className="relative flex-1 py-1.5 text-[11px] font-bold text-center text-muted-foreground hover:text-foreground cursor-pointer z-10"
                    >
                      {active && (
                        <motion.div
                          layoutId="slidingResultsTab"
                          className="absolute inset-0 bg-background border border-border/60 rounded-md shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                      )}
                      <span className={active ? "text-primary font-extrabold" : ""}>{tabKey}</span>
                    </button>
                  );
                })}
              </div>

              {/* Results payload container */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="shrink-0">
                  {/* Avg Score Circular Ring */}
                  <CircularProgress value={selectedResult.avgScore} size={64} strokeWidth={4.5} colorClass="text-emerald-500" />
                  <p className="text-[9px] font-bold text-muted-foreground text-center mt-1 uppercase">AVG Score</p>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{selectedResult.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedResult.date} · {selectedResult.students} students</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 select-none">
                    <div className="p-1.5 bg-muted/20 rounded-lg text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Pass Rate</p>
                      <p className="text-xs font-extrabold text-foreground mt-0.5">{selectedResult.passRate}</p>
                    </div>
                    <div className="p-1.5 bg-muted/20 rounded-lg text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Highest</p>
                      <p className="text-xs font-extrabold text-emerald-500 mt-0.5">{selectedResult.highest}</p>
                    </div>
                    <div className="p-1.5 bg-muted/20 rounded-lg text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">Lowest</p>
                      <p className="text-xs font-extrabold text-destructive mt-0.5">{selectedResult.lowest}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
              <button onClick={() => setIsExamBoardOpen(true)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                View full results <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 6. Upcoming Exams Full-width Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 border border-border/80">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <h3 className="text-sm font-bold tracking-tight text-foreground">Upcoming Exams</h3>
            <button onClick={() => setIsExamBoardOpen(true)} className="text-xs font-bold text-primary hover:underline cursor-pointer">Exam Board</button>
          </div>
          <div className="divide-y divide-border/60">
            {UPCOMING_EXAMS.map((exam, idx) => (
              <div key={idx} className="group py-3.5 first:pt-4 last:pb-1 flex items-center justify-between gap-4 transition hover:bg-muted/5 rounded-xl px-2">
                <div className="flex items-center gap-3">
                  {/* Date Badge */}
                  <div className="h-11 w-11 rounded-xl bg-primary/8 dark:bg-primary/20 flex flex-col items-center justify-center shrink-0 border border-primary/10 select-none">
                    <span className="text-[15px] font-black leading-none text-primary">{exam.day}</span>
                    <span className="text-[8px] font-extrabold tracking-wider leading-none text-primary mt-1">{exam.month}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{exam.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{exam.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* 7. Exam Board Modal */}
      <ExamBoardModal
        isOpen={isExamBoardOpen}
        onClose={() => setIsExamBoardOpen(false)}
        examClass={examClass}
        setExamClass={setExamClass}
        examType={examType}
        setExamType={setExamType}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        excelFile={excelFile}
        setExcelFile={setExcelFile}
        studentResults={studentResults}
        onMarksChange={handleMarksChange}
        onSave={handleSaveResults}
      />
    </motion.div>
  );
}


