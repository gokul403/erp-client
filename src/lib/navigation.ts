import type { Role } from "./mock-data";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Settings,
  BarChart3,
  GraduationCap,
  UserPlus,
  School,
  Wallet,
  CalendarDays,
  FileText,
  ClipboardList,
  BookOpen,
  Megaphone,
  TrendingUp,
  User,
  CalendarCheck,
  Receipt,
  Library,
  Bell,
  BookMarked,
  ArrowRightLeft,
  AlertCircle,
  UsersRound,
  PencilRuler,
  Bookmark,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const NAV: Record<Role, NavItem[]> = {
  super_admin: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/schools", label: "Schools", icon: Building2 },
    { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/users", label: "Users & Roles", icon: Users },
    { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    { to: "/settings", label: "System Settings", icon: Settings },
  ],
  school_admin: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admissions", label: "Admissions", icon: UserPlus },
    { to: "/students", label: "Students", icon: GraduationCap },
    { to: "/staff", label: "Staff", icon: UsersRound },
    { to: "/fees", label: "Fees", icon: Wallet },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/events", label: "Event Centre", icon: CalendarDays },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  principal: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Student Performance", icon: TrendingUp },
    { to: "/staff", label: "Staff Overview", icon: UsersRound },
    { to: "/attendance", label: "Attendance Summary", icon: CalendarCheck },
    { to: "/fees", label: "Fee Collection", icon: Wallet },
    { to: "/reports", label: "Academic Reports", icon: BarChart3 },
    { to: "/notices", label: "Notices", icon: Megaphone },
    { to: "/events", label: "Event Centre", icon: CalendarDays },
  ],
  teacher: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/classes", label: "My Classes", icon: School },
    { to: "/students", label: "Student List", icon: GraduationCap },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/marks", label: "Marks Entry", icon: PencilRuler },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/events", label: "Event Centre", icon: CalendarDays },
    { to: "/notices", label: "Announcements", icon: Megaphone },
  ],
  student: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/marks", label: "Exam Results", icon: BookOpen },
    { to: "/fees", label: "Fee Status", icon: Receipt },
    { to: "/library", label: "Library", icon: Library },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ],
  librarian: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/library", label: "Book Catalog", icon: BookMarked },
    { to: "/issue-books", label: "Issue / Return", icon: ArrowRightLeft },
    { to: "/fines", label: "Fines", icon: AlertCircle },
    { to: "/members", label: "Members", icon: Users },
    { to: "/reports", label: "Reports", icon: FileText },
  ],
};

export const ROLE_BADGE_ICON: Record<Role, typeof LayoutDashboard> = {
  super_admin: Bookmark,
  school_admin: Building2,
  principal: GraduationCap,
  teacher: PencilRuler,
  student: User,
  librarian: BookMarked,
};
