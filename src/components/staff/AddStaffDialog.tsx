import { useState, useEffect } from "react";
import { X, Copy, Check, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAddStaffMutation, useUpdateStaffMutation } from "@/hooks/use-api-data";
import {
  PersonalInfoTab, ContactInfoTab, EmploymentTab, TeachingTab,
  QualificationsTab, ExperienceTab, SalaryTab, DocumentsTab,
  LeaveTab, LoginTab
} from "./AddStaffDialogTabs";

interface AddStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

const TABS = [
  { id: "personal", label: "Personal Info" },
  { id: "contact", label: "Contact Info" },
  { id: "employment", label: "Employment" },
  { id: "teaching", label: "Teaching Details" },
  { id: "qualifications", label: "Qualifications" },
  { id: "experience", label: "Experience" },
  { id: "salary", label: "Salary Details" },
  { id: "documents", label: "ID & Verification" },
  { id: "leave", label: "Leave Info" },
  { id: "login", label: "Login Access" },
];

export function AddStaffDialog({ isOpen, onClose, initialData }: AddStaffDialogProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [revealPassword, setRevealPassword] = useState(true);
  const [successPayload, setSuccessPayload] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dob: "",
    bloodGroup: "A+",
    email: "",
    phone: "",
    altPhone: "",
    address: "",
    staffId: "",
    role: "",
    designation: "",
    dept: "",
    joinedDate: "",
    status: "Active",
    subjectsTaught: "",
    gradeLevels: "",
    weeklyHours: "24",
    degree: "",
    institution: "",
    gradYear: "",
    specialization: "",
    examName: "",
    examYear: "",
    examScore: "",
    totalExperience: "",
    prevSchool: "",
    prevRole: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    bankAccount: "",
    bankName: "",
    ifscCode: "",
    idProofType: "Aadhaar",
    idProofNumber: "",
    annualLeaves: "15",
    sickLeaves: "10",
    casualLeaves: "8",
    provideLogin: false,
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const addStaffMutation = useAddStaffMutation();
  const updateStaffMutation = useUpdateStaffMutation();

  // Reset or initialize on open (also respond to initialData changes)
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const meta = initialData.metadata || {};
      setFormData(prev => ({
        ...prev,
        fullName: initialData.name || prev.fullName,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        address: initialData.address || prev.address,
        staffId: initialData.id || prev.staffId,
        role: initialData.role || prev.role,
        dept: initialData.dept || prev.dept,
        joinedDate: initialData.joined ? new Date(initialData.joined).toISOString().split("T")[0] : prev.joinedDate,
        status: initialData.status || prev.status,

        // Metadata fields
        designation: meta.designation || prev.designation,
        gender: meta.gender || prev.gender,
        dob: meta.dob || prev.dob,
        bloodGroup: meta.bloodGroup || prev.bloodGroup,
        altPhone: meta.altPhone || prev.altPhone,
        subjectsTaught: meta.subjectsTaught || prev.subjectsTaught,
        gradeLevels: meta.gradeLevels || prev.gradeLevels,
        weeklyHours: meta.weeklyHours || prev.weeklyHours,
        degree: meta.degree || prev.degree,
        institution: meta.institution || prev.institution,
        gradYear: meta.gradYear || prev.gradYear,
        specialization: meta.specialization || prev.specialization,
        totalExperience: meta.totalExperience || prev.totalExperience,
        prevSchool: meta.prevSchool || prev.prevSchool,
        prevRole: meta.prevRole || prev.prevRole,
        basicSalary: meta.basicSalary || prev.basicSalary,
        allowances: meta.allowances || prev.allowances,
        deductions: meta.deductions || prev.deductions,
        bankAccount: meta.bankAccount || prev.bankAccount,
        bankName: meta.bankName || prev.bankName,
        ifscCode: meta.ifscCode || prev.ifscCode,
        idProofType: meta.idProofType || prev.idProofType,
        idProofNumber: meta.idProofNumber || prev.idProofNumber,
        annualLeaves: meta.annualLeaves || prev.annualLeaves,
        sickLeaves: meta.sickLeaves || prev.sickLeaves,
        casualLeaves: meta.casualLeaves || prev.casualLeaves,
        examName: meta.examName || prev.examName,
        examYear: meta.examYear || prev.examYear,
        examScore: meta.examScore || prev.examScore,
      }));
      setActiveTab("personal");
      setSuccessPayload(null);
      setErrors({});
      return;
    }

    const generatedId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    const generatedPassword = `Staff@${Math.floor(100000 + Math.random() * 900000)}`;

    setFormData({
      fullName: "",
      gender: "",
      dob: "",
      bloodGroup: "A+",
      email: "",
      phone: "",
      altPhone: "",
      address: "",
      staffId: generatedId,
      role: "",
      designation: "",
      dept: "",
      joinedDate: new Date().toISOString().split("T")[0],
      status: "Active",
      subjectsTaught: "",
      gradeLevels: "",
      weeklyHours: "24",
      degree: "",
      institution: "",
      gradYear: "",
      specialization: "",
      examName: "",
      examYear: "",
      examScore: "",
      totalExperience: "0",
      prevSchool: "",
      prevRole: "",
      basicSalary: "",
      allowances: "",
      deductions: "",
      bankAccount: "",
      bankName: "",
      ifscCode: "",
      idProofType: "Aadhaar",
      idProofNumber: "",
      annualLeaves: "15",
      sickLeaves: "10",
      casualLeaves: "8",
      provideLogin: false,
      username: "",
      password: generatedPassword,
    });
    setActiveTab("personal");
    setSuccessPayload(null);
    setErrors({});
  }, [isOpen, initialData]);


  // Sync email to username
  useEffect(() => {
    setFormData(prev => ({ ...prev, username: prev.email }));
  }, [formData.email]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Helper: check if a specific tab has all its required fields completed
  const isTabCompleted = (tabId: string): boolean => {
    switch (tabId) {
      case "personal":
        return !!(formData.fullName.trim() && formData.gender && formData.dob);
      case "contact":
        return !!(formData.email.trim() && formData.phone.trim() && formData.address.trim());
      case "employment":
        return !!(formData.staffId.trim() && formData.role.trim() && formData.designation.trim() && formData.dept);
      case "teaching":
        return !!(formData.subjectsTaught.trim() && formData.gradeLevels.trim());
      case "qualifications":
        return !!(formData.degree.trim() && formData.institution.trim());
      case "experience":
        return !!(formData.totalExperience.trim() !== "");
      case "salary":
        return !!(formData.basicSalary.trim() && formData.bankAccount.trim());
      case "documents":
        return !!(formData.idProofNumber.trim());
      case "leave":
        return !!(formData.annualLeaves.trim() && formData.sickLeaves.trim() && formData.casualLeaves.trim());
      case "login":
        return !formData.provideLogin || !!formData.password.trim();
      default:
        return false;
    }
  };

  const getCompletedCount = () => TABS.filter(t => isTabCompleted(t.id)).length;
  const completedCount = getCompletedCount();
  const progressPercent = completedCount * 10;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!formData.address.trim()) nextErrors.address = "Address is required";
    if (!formData.staffId.trim()) nextErrors.staffId = "Staff ID is required";
    if (!formData.role.trim()) nextErrors.role = "Role is required";
    if (!formData.designation.trim()) nextErrors.designation = "Designation is required";
    if (!formData.dept.trim()) nextErrors.dept = "Department is required";

    if (formData.provideLogin) {
      if (!formData.email.trim()) nextErrors.email = "Email/Username is required for login access";
      if (!formData.password.trim()) nextErrors.password = "Password is required for login access";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      if (errors.fullName) setActiveTab("personal");
      else if (errors.email || errors.phone || errors.address) setActiveTab("contact");
      else if (errors.staffId || errors.role || errors.dept) setActiveTab("employment");
      else if (errors.password) setActiveTab("login");
      return;
    }

    const payload = {
      id: formData.staffId,
      name: formData.fullName,
      role: formData.role,
      dept: formData.dept,
      phone: formData.phone,
      joined: formData.joinedDate,
      status: formData.status,
      designation: formData.designation,
      gender: formData.gender,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      altPhone: formData.altPhone,
      address: formData.address,
      subjectsTaught: formData.subjectsTaught,
      gradeLevels: formData.gradeLevels,
      weeklyHours: formData.weeklyHours,
      degree: formData.degree,
      institution: formData.institution,
      gradYear: formData.gradYear,
      specialization: formData.specialization,
      examName: formData.examName,
      examYear: formData.examYear,
      examScore: formData.examScore,
      totalExperience: formData.totalExperience,
      prevSchool: formData.prevSchool,
      prevRole: formData.prevRole,
      basicSalary: formData.basicSalary,
      allowances: formData.allowances,
      deductions: formData.deductions,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      idProofType: formData.idProofType,
      idProofNumber: formData.idProofNumber,
      annualLeaves: formData.annualLeaves,
      sickLeaves: formData.sickLeaves,
      casualLeaves: formData.casualLeaves,
      provideLogin: formData.provideLogin,
      email: formData.email,
      password: formData.password,
    };

    try {
      if (initialData && initialData.id) {
        // update flow
        const res = await updateStaffMutation.mutateAsync({ id: initialData.id, data: payload });
        setSuccessPayload(res);
      } else {
        const res = await addStaffMutation.mutateAsync(payload);
        setSuccessPayload(res);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to register staff");
    }
  };

  const copyPassword = () => {
    if (!formData.password) return;
    navigator.clipboard.writeText(formData.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const copyEmail = () => {
    if (!formData.email) return;
    navigator.clipboard.writeText(formData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/30 backdrop-blur-md animate-in fade-in duration-200">
      {!successPayload ? (
        <div className="flex flex-col w-full max-w-5xl h-[92vh] bg-card/90 backdrop-blur-xl rounded-2xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-gradient-to-r from-accent/20 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">Staff Management</p>
                <h2 className="text-lg font-bold tracking-tight text-foreground mt-0.5">Register New Staff</h2>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={addStaffMutation.isPending || updateStaffMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary-glow),0.3)] hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {addStaffMutation.isPending || updateStaffMutation.isPending ? "Saving..." : initialData ? "Update Staff" : "Save Staff"}
              </button>
            </div>
          </div>

          {/* Main Grid Section */}
          <div className="flex flex-1 overflow-hidden">

            {/* Sidebar with Glass styling (overflow hidden to prevent scroll) */}
            <div className="w-64 border-r border-border/50 bg-accent/10 p-4 flex flex-col gap-3.5 overflow-hidden">

              {/* Compact Modern Realtime Progress Card */}
              <div className="bg-background/40 border border-border/50 rounded-2xl p-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Progress</span>
                  <span className="text-primary font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full bg-accent/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary-glow),0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                  {completedCount} of 10 sections completed
                </p>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex flex-col gap-1 flex-1 overflow-hidden">
                {TABS.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  const isCompleted = isTabCompleted(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded-xl transition-all cursor-pointer ${isActive
                        ? "bg-primary text-primary-foreground shadow-sm scale-[1.01]"
                        : isCompleted
                          ? "text-primary bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-accent/40"
                        }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      {isCompleted && (
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Form container using maximum width to prevent scroll */}
            <div className="flex-1 p-6 overflow-y-auto bg-background/30 backdrop-blur-md flex flex-col justify-stretch">
              <div className="w-full bg-card/60 border border-border/60 rounded-2xl p-6 shadow-sm backdrop-blur-md">

                {/* Dynamically Rendered Tab Forms */}
                {activeTab === "personal" && (
                  <PersonalInfoTab formData={formData} onChange={handleInputChange} errors={errors} />
                )}
                {activeTab === "contact" && (
                  <ContactInfoTab formData={formData} onChange={handleInputChange} errors={errors} />
                )}
                {activeTab === "employment" && (
                  <EmploymentTab formData={formData} onChange={handleInputChange} errors={errors} />
                )}
                {activeTab === "teaching" && (
                  <TeachingTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "qualifications" && (
                  <QualificationsTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "experience" && (
                  <ExperienceTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "salary" && (
                  <SalaryTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "documents" && (
                  <DocumentsTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "leave" && (
                  <LeaveTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "login" && (
                  <LoginTab
                    formData={formData}
                    onChange={handleInputChange}
                    errors={errors}
                    copiedPassword={copiedPassword}
                    onCopyPassword={copyPassword}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer controls with glass styling */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-border/50 bg-gradient-to-r from-accent/5 to-accent/20">
            <button
              onClick={() => {
                if (activeTabIndex > 0) setActiveTab(TABS[activeTabIndex - 1].id);
              }}
              disabled={activeTabIndex === 0}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              &larr; Back
            </button>
            <button
              onClick={() => {
                if (activeTabIndex < TABS.length - 1) {
                  setActiveTab(TABS[activeTabIndex + 1].id);
                } else {
                  handleSave();
                }
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary-glow),0.3)] hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {activeTabIndex < TABS.length - 1 ? (
                <>Next Step &rarr;</>
              ) : (
                addStaffMutation.isPending ? "Saving..." : "Save and Submit"
              )}
            </button>
          </div>

        </div>
      ) : (
        /* Success Payload Modal with premium UI */
        <div className="flex flex-col w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-success/10 text-success">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                <Check className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Credentials Generated</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-success/25 text-success transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>

              <h3 className="text-lg font-bold text-foreground">Staff member has been successfully added to the directory.</h3>

              <p className="text-sm text-muted-foreground mt-1">You can copy the credentials below and share securely.</p>
            </div>

            {formData.provideLogin && (
              <div className="rounded-xl border border-border bg-accent/20 p-5 space-y-4">
                <h4 className="font-semibold text-sm">
                  Login Credentials
                </h4>

                <div className="grid gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Email / Username
                    </label>

                    <div className="mt-1 flex items-center justify-between rounded-lg border bg-background px-3 py-2 font-mono text-sm">
                      <span className="truncate">{formData.email || "-"}</span>
                      <button onClick={copyEmail} className="p-1 rounded hover:bg-accent">
                        {copiedEmail ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">
                      Temporary Password
                    </label>

                    <div className="mt-1 flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                      <span className="font-mono text-sm truncate">
                        {revealPassword ? formData.password : formData.password ? "•".repeat(formData.password.length) : "-"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRevealPassword(prev => !prev)}
                          className="p-1 rounded hover:bg-accent"
                          aria-label={revealPassword ? "Hide password" : "Show password"}
                        >
                          {revealPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={copyPassword}
                          className="p-1 rounded hover:bg-accent"
                        >
                          {copiedPassword ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Please share these credentials securely with the staff member.
                  They should change their password after their first login.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border/50 px-6 py-3 bg-accent/5">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
