export type Role =
  | "super_admin"
  | "school_admin"
  | "principal"
  | "teacher"
  | "student"
  | "librarian";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  principal: "Principal",
  teacher: "Teacher",
  student: "Student",
  librarian: "Librarian",
};

export const ROLE_USERS: Record<Role, { name: string; email: string; avatar: string }> = {
  super_admin: { name: "Ananya Kapoor", email: "ananya@edusync.io", avatar: "AK" },
  school_admin: { name: "Rohit Mehta", email: "rohit@greenfield.edu", avatar: "RM" },
  principal: { name: "Dr. Priya Sharma", email: "principal@greenfield.edu", avatar: "PS" },
  teacher: { name: "Vikram Iyer", email: "vikram@greenfield.edu", avatar: "VI" },
  student: { name: "Aarav Singh", email: "aarav.s@greenfield.edu", avatar: "AS" },
  librarian: { name: "Meena Joseph", email: "meena@greenfield.edu", avatar: "MJ" },
};

export const STATS = {
  totalStudents: 2487,
  totalTeachers: 184,
  activeClasses: 62,
  newAdmissions: 138,
  feeCollection: 8542000,
  pendingFees: 1245000,
  attendancePercent: 94.2,
};

export const ENROLLMENT_TREND = [
  { month: "Jan", students: 2210, admissions: 42 },
  { month: "Feb", students: 2245, admissions: 51 },
  { month: "Mar", students: 2298, admissions: 73 },
  { month: "Apr", students: 2336, admissions: 60 },
  { month: "May", students: 2378, admissions: 68 },
  { month: "Jun", students: 2412, admissions: 55 },
  { month: "Jul", students: 2455, admissions: 88 },
  { month: "Aug", students: 2487, admissions: 92 },
];

export const FEE_COLLECTION = [
  { month: "Mar", collected: 6.8, pending: 1.4 },
  { month: "Apr", collected: 7.2, pending: 1.2 },
  { month: "May", collected: 7.8, pending: 1.0 },
  { month: "Jun", collected: 8.1, pending: 1.1 },
  { month: "Jul", collected: 8.3, pending: 1.3 },
  { month: "Aug", collected: 8.5, pending: 1.2 },
];

export const ATTENDANCE_BY_GRADE = [
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

export const PERFORMANCE_DIST = [
  { name: "A+ (90-100)", value: 412 },
  { name: "A (75-89)", value: 822 },
  { name: "B (60-74)", value: 768 },
  { name: "C (40-59)", value: 386 },
  { name: "Below 40", value: 99 },
];

export const RECENT_ACTIVITIES = [
  { id: 1, type: "admission", title: "New admission: Ishaan Verma — Grade 6-B", time: "2 min ago" },
  { id: 2, type: "fee", title: "Fee payment received from Ananya Rao (₹24,500)", time: "18 min ago" },
  { id: 3, type: "exam", title: "Mid-term marks published for Grade 10", time: "1 hour ago" },
  { id: 4, type: "notice", title: "PTA meeting scheduled for Saturday", time: "3 hours ago" },
  { id: 5, type: "attendance", title: "Attendance marked for 58 classes today", time: "5 hours ago" },
  { id: 6, type: "library", title: "12 new books added to library catalog", time: "Yesterday" },
];

export const SCHOOLS = [
  { id: "SCH-001", name: "Greenfield International", city: "Bengaluru", students: 2487, plan: "Enterprise", status: "Active" },
  { id: "SCH-002", name: "Sunrise Public School", city: "Mumbai", students: 1842, plan: "Pro", status: "Active" },
  { id: "SCH-003", name: "Mount Carmel Academy", city: "Delhi", students: 3210, plan: "Enterprise", status: "Active" },
  { id: "SCH-004", name: "Riverdale High", city: "Pune", students: 1276, plan: "Pro", status: "Trial" },
  { id: "SCH-005", name: "Holy Cross Convent", city: "Chennai", students: 2104, plan: "Enterprise", status: "Active" },
  { id: "SCH-006", name: "Vidya Niketan", city: "Hyderabad", students: 968, plan: "Starter", status: "Active" },
  { id: "SCH-007", name: "Lotus Valley School", city: "Noida", students: 1542, plan: "Pro", status: "Suspended" },
  { id: "SCH-008", name: "Bright Horizons", city: "Kolkata", students: 1108, plan: "Starter", status: "Active" },
];

export const STUDENTS = [
  { id: "STU-1042", name: "Aarav Singh", grade: "Grade 10", section: "A", roll: 12, guardian: "Rajesh Singh", phone: "98214 33210", status: "Active" },
  { id: "STU-1043", name: "Ananya Rao", grade: "Grade 9", section: "B", roll: 24, guardian: "Sunita Rao", phone: "98765 11220", status: "Active" },
  { id: "STU-1044", name: "Ishaan Verma", grade: "Grade 6", section: "B", roll: 7, guardian: "Manoj Verma", phone: "99003 87241", status: "Active" },
  { id: "STU-1045", name: "Diya Patel", grade: "Grade 11", section: "A", roll: 3, guardian: "Kiran Patel", phone: "97412 09183", status: "Active" },
  { id: "STU-1046", name: "Kabir Khan", grade: "Grade 8", section: "C", roll: 18, guardian: "Salma Khan", phone: "98101 22388", status: "Active" },
  { id: "STU-1047", name: "Saanvi Iyer", grade: "Grade 7", section: "A", roll: 5, guardian: "Ramesh Iyer", phone: "99988 04412", status: "Active" },
  { id: "STU-1048", name: "Arjun Nair", grade: "Grade 12", section: "B", roll: 21, guardian: "Geeta Nair", phone: "98765 88231", status: "Alumni" },
  { id: "STU-1049", name: "Myra Kapoor", grade: "Grade 5", section: "A", roll: 9, guardian: "Anil Kapoor", phone: "98123 45901", status: "Active" },
  { id: "STU-1050", name: "Vihaan Reddy", grade: "Grade 4", section: "B", roll: 14, guardian: "Lakshmi Reddy", phone: "98231 09812", status: "Active" },
  { id: "STU-1051", name: "Anika Bose", grade: "Grade 10", section: "C", roll: 28, guardian: "Subir Bose", phone: "98711 23498", status: "Active" },
];

export const STAFF = [
  { id: "EMP-201", name: "Vikram Iyer", role: "Mathematics Teacher", dept: "Sr. Secondary", phone: "98452 11023", joined: "2018-06-12", status: "Active" },
  { id: "EMP-202", name: "Dr. Priya Sharma", role: "Principal", dept: "Administration", phone: "98765 33421", joined: "2015-04-01", status: "Active" },
  { id: "EMP-203", name: "Neha Aggarwal", role: "Science Teacher", dept: "Sr. Secondary", phone: "98231 09182", joined: "2020-07-15", status: "Active" },
  { id: "EMP-204", name: "Sandeep Rao", role: "Sports Coach", dept: "Athletics", phone: "97412 98230", joined: "2021-08-02", status: "Active" },
  { id: "EMP-205", name: "Meena Joseph", role: "Librarian", dept: "Library", phone: "98109 22134", joined: "2019-11-09", status: "Active" },
  { id: "EMP-206", name: "Ravi Kumar", role: "English Teacher", dept: "Primary", phone: "97211 08231", joined: "2022-01-20", status: "On Leave" },
  { id: "EMP-207", name: "Sneha Pillai", role: "Accountant", dept: "Finance", phone: "98230 41023", joined: "2017-03-18", status: "Active" },
];

export const ADMISSIONS = [
  { id: "ADM-2025-091", applicant: "Aanya Gupta", grade: "Grade 1", appliedOn: "2025-06-12", status: "Approved" },
  { id: "ADM-2025-092", applicant: "Reyansh Joshi", grade: "Grade 6", appliedOn: "2025-06-13", status: "Pending" },
  { id: "ADM-2025-093", applicant: "Aadhya Menon", grade: "Grade 9", appliedOn: "2025-06-13", status: "Interview" },
  { id: "ADM-2025-094", applicant: "Vivaan Saxena", grade: "Grade 4", appliedOn: "2025-06-14", status: "Approved" },
  { id: "ADM-2025-095", applicant: "Mira Chowdhury", grade: "Grade 11", appliedOn: "2025-06-15", status: "Rejected" },
  { id: "ADM-2025-096", applicant: "Krish Bansal", grade: "Grade 2", appliedOn: "2025-06-15", status: "Documents" },
  { id: "ADM-2025-097", applicant: "Tara Sinha", grade: "Grade 7", appliedOn: "2025-06-16", status: "Pending" },
];

export const FEES = [
  { id: "INV-30421", student: "Aarav Singh", grade: "Grade 10-A", amount: 32500, due: "2025-07-05", status: "Paid" },
  { id: "INV-30422", student: "Ananya Rao", grade: "Grade 9-B", amount: 28500, due: "2025-07-05", status: "Paid" },
  { id: "INV-30423", student: "Ishaan Verma", grade: "Grade 6-B", amount: 24000, due: "2025-07-10", status: "Pending" },
  { id: "INV-30424", student: "Diya Patel", grade: "Grade 11-A", amount: 36000, due: "2025-07-10", status: "Overdue" },
  { id: "INV-30425", student: "Kabir Khan", grade: "Grade 8-C", amount: 26500, due: "2025-07-12", status: "Paid" },
  { id: "INV-30426", student: "Saanvi Iyer", grade: "Grade 7-A", amount: 25500, due: "2025-07-12", status: "Partial" },
  { id: "INV-30427", student: "Myra Kapoor", grade: "Grade 5-A", amount: 22500, due: "2025-07-15", status: "Pending" },
];

export const TIMETABLE = [
  { time: "08:00 — 08:45", mon: "Mathematics", tue: "English", wed: "Science", thu: "Mathematics", fri: "History" },
  { time: "08:45 — 09:30", mon: "English", tue: "Mathematics", wed: "Hindi", thu: "Science", fri: "Mathematics" },
  { time: "09:30 — 10:15", mon: "Science", tue: "Geography", wed: "English", thu: "Computer", fri: "Science" },
  { time: "10:15 — 10:30", mon: "— Break —", tue: "— Break —", wed: "— Break —", thu: "— Break —", fri: "— Break —" },
  { time: "10:30 — 11:15", mon: "Computer", tue: "Science", wed: "Mathematics", thu: "English", fri: "Art" },
  { time: "11:15 — 12:00", mon: "Hindi", tue: "Computer", wed: "Geography", thu: "Hindi", fri: "P.E." },
  { time: "12:00 — 12:45", mon: "P.E.", tue: "Music", wed: "Library", thu: "P.E.", fri: "English" },
];

export const BOOKS = [
  { id: "BK-1001", title: "The Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", copies: 12, available: 8 },
  { id: "BK-1002", title: "Wings of Imagination", author: "Ruskin Bond", category: "Fiction", copies: 8, available: 3 },
  { id: "BK-1003", title: "Fundamentals of Physics", author: "Halliday & Resnick", category: "Reference", copies: 6, available: 2 },
  { id: "BK-1004", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", copies: 4, available: 4 },
  { id: "BK-1005", title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History", copies: 10, available: 6 },
  { id: "BK-1006", title: "Harry Potter & The Sorcerer's Stone", author: "J.K. Rowling", category: "Fiction", copies: 15, available: 5 },
  { id: "BK-1007", title: "Atomic Habits", author: "James Clear", category: "Self-help", copies: 7, available: 7 },
];

export const ISSUED_BOOKS = [
  { id: "ISS-7821", book: "Wings of Imagination", student: "Ananya Rao", grade: "Grade 9-B", issued: "2025-06-20", due: "2025-07-04", status: "Issued" },
  { id: "ISS-7822", book: "Harry Potter & The Sorcerer's Stone", student: "Ishaan Verma", grade: "Grade 6-B", issued: "2025-06-22", due: "2025-07-06", status: "Overdue" },
  { id: "ISS-7823", book: "Fundamentals of Physics", student: "Diya Patel", grade: "Grade 11-A", issued: "2025-06-25", due: "2025-07-09", status: "Issued" },
  { id: "ISS-7824", book: "The Discovery of India", student: "Arjun Nair", grade: "Grade 12-B", issued: "2025-06-26", due: "2025-07-10", status: "Issued" },
];

export const ASSIGNMENTS = [
  { id: "ASG-401", title: "Quadratic Equations Worksheet", subject: "Mathematics", class: "Grade 10-A", due: "2025-07-05", submitted: 28, total: 34 },
  { id: "ASG-402", title: "Photosynthesis Lab Report", subject: "Science", class: "Grade 9-B", due: "2025-07-07", submitted: 22, total: 32 },
  { id: "ASG-403", title: "Essay on Climate Change", subject: "English", class: "Grade 8-C", due: "2025-07-04", submitted: 30, total: 30 },
  { id: "ASG-404", title: "Map Work: Indian Rivers", subject: "Geography", class: "Grade 7-A", due: "2025-07-08", submitted: 18, total: 28 },
];

export const NOTIFICATIONS = [
  { id: 1, title: "Parent-Teacher meeting on Saturday", time: "2 hours ago", type: "notice" },
  { id: 2, title: "Mid-term results published", time: "Yesterday", type: "exam" },
  { id: 3, title: "Library: New arrivals this week", time: "2 days ago", type: "library" },
  { id: 4, title: "Annual day rehearsals start Monday", time: "3 days ago", type: "event" },
];

export const SUBJECTS_PROGRESS = [
  { subject: "Mathematics", marks: 88, grade: "A" },
  { subject: "Science", marks: 82, grade: "A" },
  { subject: "English", marks: 91, grade: "A+" },
  { subject: "Social Studies", marks: 76, grade: "B" },
  { subject: "Hindi", marks: 85, grade: "A" },
  { subject: "Computer Science", marks: 94, grade: "A+" },
];

export const SUBSCRIPTIONS = [
  { id: "SUB-9001", school: "Greenfield International", plan: "Enterprise", seats: 2500, mrr: 142000, renews: "2026-01-15", status: "Active" },
  { id: "SUB-9002", school: "Sunrise Public School", plan: "Pro", seats: 2000, mrr: 84000, renews: "2025-11-02", status: "Active" },
  { id: "SUB-9003", school: "Mount Carmel Academy", plan: "Enterprise", seats: 3500, mrr: 168000, renews: "2026-03-22", status: "Active" },
  { id: "SUB-9004", school: "Riverdale High", plan: "Pro", seats: 1500, mrr: 0, renews: "2025-07-30", status: "Trial" },
  { id: "SUB-9005", school: "Lotus Valley School", plan: "Pro", seats: 1800, mrr: 78000, renews: "2025-09-12", status: "Past Due" },
];
