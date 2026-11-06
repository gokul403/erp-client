import { useState, useRef } from "react";
import {
  Download,
  GraduationCap,
  Plus,
  Upload,
  Users,
  UserCheck,
  Calendar,
  Phone,
  MoreVertical,
  Search,
  Mail,
  MapPin,
  Droplets,
  CreditCard,
  FileText,
  X,
  User as UserIcon,
} from "lucide-react";
import { Badge, PageHeader, Pagination } from "@/components/erp/ui";
import {
  useStudentsQuery,
  useAddStudentMutation,
  useAddBulkStudentsMutation,
} from "@/hooks/use-api-data";
import { useRole } from "@/lib/role-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function StudentsPage() {
  const { role } = useRole();
  const isTeacher = role === "teacher";

  const { data: students = [], isLoading } = useStudentsQuery();
  const addStudent = useAddStudentMutation();
  const addBulkStudents = useAddBulkStudentsMutation();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("Grade 10");
  const [section, setSection] = useState("A");
  const [roll, setRoll] = useState("");
  const [guardian, setGuardian] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");

  // Detailed states for Add Student form
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [aadhaarPassport, setAadhaarPassport] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");

  const [activeDialogTab, setActiveDialogTab] = useState<
    "personal" | "guardian" | "academic"
  >("personal");

  // View Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);

  // Filtering, sorting and pagination states
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [sortOrder, setSortOrder] = useState("Sort: Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageSize = 9;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const getInitials = (studentName: string) => {
    if (!studentName) return "ST";
    const parts = studentName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return studentName.slice(0, 2).toUpperCase();
  };

  const handleExport = () => {
    if (sortedStudents.length === 0) {
      toast.error("No student data available to export.");
      return;
    }
    const exportRows = sortedStudents.map((s: any) => ({
      "Student ID": s.id,
      "Name": s.name,
      "Grade": s.grade,
      "Section": s.section,
      "Roll": s.roll,
      "Guardian": s.guardian,
      "Phone": s.phone,
      "Status": s.status,
      "Email": s.email || "",
      "Blood Group": s.blood_group || "",
      "Admission Date": s.admission_date || "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(
      wb,
      `Students_List_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Student list exported successfully!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Student name is required");
      return;
    }
    const rollNum = parseInt(roll, 10);
    if (isNaN(rollNum) || rollNum <= 0) {
      toast.error("Please enter a valid positive roll number");
      return;
    }
    if (!guardian.trim()) {
      toast.error("Guardian name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Guardian phone is required");
      return;
    }

    addStudent.mutate(
      {
        name: name.trim(),
        grade,
        section,
        roll: rollNum,
        guardian: guardian.trim(),
        phone: phone.trim(),
        status,
        email: email.trim() || undefined,
        dob: dob || undefined,
        gender,
        address: address.trim() || undefined,
        blood_group: bloodGroup,
        admission_date: admissionDate,
        aadhaar_passport: aadhaarPassport.trim() || undefined,
        father_name: fatherName.trim() || undefined,
        mother_name: motherName.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Student profile added successfully!");
          setOpen(false);
          // Reset form fields
          setName("");
          setGrade("Grade 10");
          setSection("A");
          setRoll("");
          setGuardian("");
          setPhone("");
          setStatus("Active");
          setEmail("");
          setDob("");
          setGender("Male");
          setAddress("");
          setBloodGroup("O+");
          setAdmissionDate(new Date().toISOString().split("T")[0]);
          setAadhaarPassport("");
          setFatherName("");
          setMotherName("");
          setActiveDialogTab("personal");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to add student. Please try again.");
        },
      }
    );
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length <= 1) {
          toast.error("The spreadsheet is empty or missing data rows.");
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const headers = data[0].map((h: any) => String(h).trim().toLowerCase());

        const nameIdx = headers.findIndex(
          (h) => h.includes("name") || h.includes("student")
        );
        const gradeIdx = headers.findIndex(
          (h) => h.includes("grade") || h.includes("class")
        );
        const sectionIdx = headers.findIndex(
          (h) => h.includes("section") || h.includes("sec")
        );
        const rollIdx = headers.findIndex((h) => h.includes("roll"));
        const guardianIdx = headers.findIndex(
          (h) => h.includes("guardian") || h.includes("parent")
        );
        const phoneIdx = headers.findIndex(
          (h) => h.includes("phone") || h.includes("contact")
        );
        const statusIdx = headers.findIndex((h) => h.includes("status"));

        if (
          nameIdx === -1 ||
          gradeIdx === -1 ||
          sectionIdx === -1 ||
          rollIdx === -1 ||
          guardianIdx === -1 ||
          phoneIdx === -1
        ) {
          toast.error(
            "Columns not matching. Ensure columns for Name, Grade, Section, Roll, Guardian, and Phone are present."
          );
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const parsedRows: any[] = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[nameIdx]) continue;

          parsedRows.push({
            name: String(row[nameIdx] || "").trim(),
            grade: String(row[gradeIdx] || "").trim(),
            section: String(row[sectionIdx] || "").trim(),
            roll: parseInt(String(row[rollIdx] || "0"), 10) || 1,
            guardian: String(row[guardianIdx] || "").trim(),
            phone: String(row[phoneIdx] || "").trim(),
            status:
              statusIdx !== -1 && row[statusIdx]
                ? String(row[statusIdx]).trim()
                : "Active",
          });
        }

        if (parsedRows.length === 0) {
          toast.error("No valid student data found in the spreadsheet.");
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        addBulkStudents.mutate(parsedRows, {
          onSuccess: (res: any) => {
            toast.success(`Successfully imported ${res.length} students in bulk!`);
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setCurrentPage(1);
          },
          onError: (err: any) => {
            toast.error(
              err.message || "Failed to upload students. Check format & network."
            );
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        });
      } catch (err) {
        console.error("Error reading spreadsheet", err);
        toast.error("Error reading spreadsheet file.");
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      ["Name", "Grade", "Section", "Roll", "Guardian", "Phone", "Status"],
      ["Aarav Singh", "Grade 10", "A", 1, "Rajesh Singh", "9821433210", "Active"],
      ["Meera Nair", "Grade 9", "B", 2, "Suresh Nair", "9876543210", "Active"],
      ["Rohan Gupta", "Grade 11", "A", 3, "Priya Gupta", "9012345678", "On Leave"],
      ["Ananya Sharma", "Grade 8", "C", 4, "Vikram Sharma", "8765432109", "Alumni"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateRows);

    ws["!cols"] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 6 },
      { wch: 20 },
      { wch: 14 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_bulk_upload_template.xlsx");
    toast.success("Sample template downloaded!");
  };

  // Metric counts
  const totalCount = students.length;
  const activeCount = students.filter((s: any) => s.status === "Active").length;
  const onLeaveCount = students.filter((s: any) => s.status === "On Leave").length;
  const alumniCount = students.filter((s: any) => s.status === "Alumni").length;

  // Client-side filtering
  const filteredStudents = students.filter((s: any) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase());

    const matchesClass =
      classFilter === "All Classes" ||
      classFilter === "Classes" ||
      s.grade.toLowerCase() === classFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "All status" ||
      statusFilter === "All Status" ||
      s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Client-side sorting
  const sortedStudents = [...filteredStudents].sort((a: any, b: any) => {
    if (sortOrder === "Sort: A–Z") {
      return a.name.localeCompare(b.name);
    }
    if (sortOrder === "Sort: Oldest") {
      return a.id.localeCompare(b.id);
    }
    // Default: Sort: Newest
    return b.id.localeCompare(a.id);
  });

  // Client-side pagination
  const totalEntries = sortedStudents.length;
  const totalPages = Math.ceil(totalEntries / pageSize);
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium">
              Processing & importing bulk student data...
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Student Management"
        subtitle="Profiles, parent contacts, academic history and more."
        actions={
          <div className="flex items-center gap-2">
            {isTeacher ? (
              <button
                onClick={handleExport}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3.5 text-xs font-semibold hover:bg-accent text-foreground cursor-pointer transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            ) : (
              <>
                <button
                  onClick={handleExport}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-accent text-foreground cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-accent text-foreground cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Sample CSV
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-accent text-foreground cursor-pointer transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" /> Import
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 cursor-pointer transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Add Student
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[650px] overflow-hidden bg-background">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold tracking-tight">
                        Add New Student
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Enter details below to create a comprehensive student profile.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Dialog Tabs */}
                    <div className="grid grid-cols-3 gap-1 border-b border-border pb-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setActiveDialogTab("personal")}
                        className={`pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                          activeDialogTab === "personal"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        1. Personal
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDialogTab("guardian")}
                        className={`pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                          activeDialogTab === "guardian"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        2. Guardian & Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDialogTab("academic")}
                        className={`pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                          activeDialogTab === "academic"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        3. Academic & Status
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                      {/* Tab 1: Personal Details */}
                      {activeDialogTab === "personal" && (
                        <div className="grid grid-cols-2 gap-4 animate-[fade-in_0.15s_ease-out]">
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Student Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Aarav Singh"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Gender
                            </label>
                            <select
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Blood Group
                            </label>
                            <select
                              value={bloodGroup}
                              onChange={(e) => setBloodGroup(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                            >
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "O+",
                                "O-",
                                "AB+",
                                "AB-",
                              ].map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Aadhaar / Passport
                            </label>
                            <input
                              type="text"
                              value={aadhaarPassport}
                              onChange={(e) => setAadhaarPassport(e.target.value)}
                              placeholder="e.g. 12-digit UID"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Guardian & Contact Details */}
                      {activeDialogTab === "guardian" && (
                        <div className="grid grid-cols-2 gap-4 animate-[fade-in_0.15s_ease-out]">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Guardian Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={guardian}
                              onChange={(e) => setGuardian(e.target.value)}
                              placeholder="e.g. Rajesh Singh"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Guardian Phone *
                            </label>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. 98214 33210"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Guardian Email
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. parent@email.com"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Father's Name
                            </label>
                            <input
                              type="text"
                              value={fatherName}
                              onChange={(e) => setFatherName(e.target.value)}
                              placeholder="Father's full name"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Mother's Name
                            </label>
                            <input
                              type="text"
                              value={motherName}
                              onChange={(e) => setMotherName(e.target.value)}
                              placeholder="Mother's full name"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Residential Address
                            </label>
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Full postal address"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Academic & Status */}
                      {activeDialogTab === "academic" && (
                        <div className="grid grid-cols-2 gap-4 animate-[fade-in_0.15s_ease-out]">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Grade *
                            </label>
                            <select
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                            >
                              {Array.from(
                                { length: 12 },
                                (_, i) => `Grade ${i + 1}`
                              ).map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Section *
                            </label>
                            <select
                              value={section}
                              onChange={(e) => setSection(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                            >
                              {["A", "B", "C", "D", "E"].map((sec) => (
                                <option key={sec} value={sec}>
                                  {sec}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Roll Number *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={roll}
                              onChange={(e) => setRoll(e.target.value)}
                              placeholder="e.g. 12"
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Admission Date
                            </label>
                            <input
                              type="date"
                              value={admissionDate}
                              onChange={(e) => setAdmissionDate(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>

                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Status *
                            </label>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                            >
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Alumni">Alumni</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
                        <div className="flex gap-1.5">
                          {activeDialogTab !== "personal" && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDialogTab(
                                  activeDialogTab === "academic"
                                    ? "guardian"
                                    : "personal"
                                )
                              }
                              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-semibold hover:bg-accent transition cursor-pointer"
                            >
                              ← Back
                            </button>
                          )}
                          {activeDialogTab !== "academic" && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDialogTab(
                                  activeDialogTab === "personal"
                                    ? "guardian"
                                    : "academic"
                                )
                              }
                              className="inline-flex h-9 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary px-3 text-xs font-semibold hover:bg-primary/20 transition cursor-pointer"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addStudent.isPending}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                          >
                            {addStudent.isPending ? "Adding..." : "Add Student"}
                          </button>
                        </div>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        }
      />

      {/* Stat Cards - Styled like the reference design */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* TOTAL STUDENTS */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              TOTAL STUDENTS
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* ACTIVE */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ACTIVE
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{activeCount}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* ON LEAVE */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ON LEAVE
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {onLeaveCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* ALUMNI */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ALUMNI
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {alumniCount}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search students by name, ID, guardian..."
            className="h-10 w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Classes Filter */}
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 w-full sm:w-36 rounded-lg border border-input bg-background/50 px-3 text-sm outline-none transition cursor-pointer text-foreground font-medium"
        >
          <option value="All Classes">Classes</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 8">Grade 8</option>
          <option value="Grade 7">Grade 7</option>
          <option value="Grade 6">Grade 6</option>
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 4">Grade 4</option>
          <option value="Grade 12">Grade 12</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 w-full sm:w-36 rounded-lg border border-input bg-background/50 px-3 text-sm outline-none transition cursor-pointer text-foreground font-medium"
        >
          <option value="All status">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Alumni">Alumni</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 w-full sm:w-40 rounded-lg border border-input bg-background/50 px-3 text-sm outline-none transition cursor-pointer text-foreground font-medium"
        >
          <option value="Sort: Newest">Sort: Newest</option>
          <option value="Sort: Oldest">Sort: Oldest</option>
          <option value="Sort: A–Z">Sort: A–Z</option>
        </select>
      </div>

      {/* Student Cards Grid (Exact screenshot match) */}
      {paginatedStudents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground shadow-xs">
          <GraduationCap className="mx-auto h-10 w-10 opacity-40 mb-2" />
          <p className="font-semibold text-foreground">No students found</p>
          <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {paginatedStudents.map((student: any) => (
            <div
              key={student.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
            >
              <div>
                {/* Header: Avatar & Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-950/70 dark:text-blue-300 shadow-2xs">
                    {getInitials(student.name)}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight ${
                      student.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : student.status === "On Leave"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        student.status === "Active"
                          ? "bg-emerald-500"
                          : student.status === "On Leave"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    {student.status.toUpperCase()}
                  </span>
                </div>

                {/* Name & Roll */}
                <div className="mb-4">
                  <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Roll #{student.roll}
                  </p>
                </div>

                {/* Info Items */}
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                    <span className="font-medium text-foreground/80">
                      {student.grade} • Section {student.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                    <span className="font-medium text-foreground/80">
                      {student.guardian}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                    <span className="font-medium text-foreground/80">
                      {student.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(student);
                    setViewProfileOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider transition-colors cursor-pointer"
                >
                  VIEW PROFILE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(student);
                    setViewProfileOpen(true);
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalEntries={totalEntries}
          pageSize={pageSize}
        />
      )}

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background overflow-hidden">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold text-lg dark:bg-blue-950 dark:text-blue-300">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {selectedStudent.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>Roll #{selectedStudent.roll}</span>
                      <span>•</span>
                      <span>{selectedStudent.grade} ({selectedStudent.section})</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">{selectedStudent.id}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                {/* Academic & Status */}
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                  <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
                    Academic Overview
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Class & Section:</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {selectedStudent.grade} - Sec {selectedStudent.section}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            selectedStudent.status === "Active"
                              ? "bg-emerald-500"
                              : selectedStudent.status === "On Leave"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {selectedStudent.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Admission Date:</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {selectedStudent.admission_date || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Blood Group:</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {selectedStudent.blood_group || "O+"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guardian & Contact */}
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                  <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
                    Guardian & Contact Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Guardian Name:</span>
                      <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedStudent.guardian}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone Number:</span>
                      <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedStudent.phone}
                      </p>
                    </div>
                    {selectedStudent.email && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Email Address:</span>
                        <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {selectedStudent.email}
                        </p>
                      </div>
                    )}
                    {selectedStudent.address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Residential Address:</span>
                        <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {selectedStudent.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setViewProfileOpen(false)}
                  className="w-full inline-flex h-9 items-center justify-center rounded-md border border-input bg-card text-xs font-semibold hover:bg-accent cursor-pointer transition-colors"
                >
                  Close Profile
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
