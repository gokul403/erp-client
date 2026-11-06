import React, { useState, useEffect } from "react";
import { X, Check, FileText, Upload, AlertCircle, Sparkles, Receipt, Shield, DollarSign } from "lucide-react";
import { Card } from "@/components/erp/ui";
import { useClassesQuery, useFeeAllocationsQuery } from "@/hooks/use-api-data";

interface AdmissionFormProps {
  admissionId?: string | null; // null if new, string if reviewing
  initialData?: any; // Basic data from table
  onClose: () => void;
  onSave: (basicData: { id: string; applicant: string; grade: string; status: string; applied_on?: string }) => void;
  isSaving: boolean;
}

export function AdmissionForm({ admissionId, initialData, onClose, onSave, isSaving }: AdmissionFormProps) {
  // 1. Wizard Tabs State
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2" | "phase3">("phase1");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Pending");

  const { data: dbClasses = [] } = useClassesQuery();
  const { data: dbAllocations = [] } = useFeeAllocationsQuery();

  const classesList = dbClasses.length > 0
    ? (Array.from(new Set(dbClasses.map((c: any) => c.grade))) as string[])
    : Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

  // 2. Comprehensive Form State (Phases 1, 2, and 3)
  const [formData, setFormData] = useState({
    // Phase 1: Admission Details
    appNo: "",
    academicYear: "2025-2026",
    campus: "Main Campus",
    admissionDate: new Date().toISOString().split("T")[0],
    admissionType: "Regular",
    applyingGrade: "Grade 10",

    // Phase 1: Student Information
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    nationality: "Indian",
    studentPhotoName: "",

    // Phase 1: Parent Information
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    parentEmail: "",

    // Phase 1: Address
    address: "",
    city: "",
    state: "",
    pinCode: "",

    // Phase 1: Previous School
    prevSchoolName: "",
    lastStudiedClass: "",
    board: "CBSE",

    // Phase 1: Upload Documents
    birthCertificateName: "",

    // Phase 2: Identity & Demographics
    aadhaarPassport: "",
    religion: "",
    categoryCaste: "General",
    bloodGroup: "O+",
    scholarshipRequest: "No",
    transportRequirement: "No",
    hostelRequirement: "No",
    medicalInfo: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    transferCertificateName: "",
    reportCardName: "",
    addressProofName: "",

    // Phase 3: Fee Details
    registrationFee: 1000,
    admissionFee: 15000,
    tuitionFee: 45000,
    hostelFee: 0,
    transportFee: 0,
    scholarshipDiscount: 0,
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    receiptNumber: "",
  });

  // 3. Load / Initialize Data
  useEffect(() => {
    if (admissionId) {
      // Review mode: Load from local storage if exists, fallback to initial data
      const savedData = localStorage.getItem(`admission_details_${admissionId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
          setStatus(initialData?.status || parsed.paymentStatus === "Paid" ? "Approved" : "Pending");
        } catch (e) {
          console.error("Error parsing saved details", e);
        }
      } else if (initialData) {
        // Build first-name/last-name from initial applicant name
        const names = (initialData.applicant || "").split(" ");
        const first = names[0] || "";
        const last = names.slice(1).join(" ") || "";
        setFormData((prev) => ({
          ...prev,
          appNo: initialData.id,
          firstName: first,
          lastName: last,
          applyingGrade: initialData.grade || "Grade 10",
          admissionDate: new Date(initialData.applied_on || Date.now()).toISOString().split("T")[0],
        }));
        setStatus(initialData.status || "Pending");
      }
    } else {
      // Create mode: Auto-generate Application Number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const appNo = `APP-2026-${randomNum}`;
      setFormData((prev) => ({
        ...prev,
        appNo: appNo,
      }));
      setStatus("Pending");
    }
  }, [admissionId, initialData]);

  // Sync default grade once classes list is loaded
  useEffect(() => {
    if (classesList.length > 0 && !admissionId && (!formData.applyingGrade || !classesList.includes(formData.applyingGrade))) {
      setFormData((prev) => ({
        ...prev,
        applyingGrade: classesList[0],
      }));
    }
  }, [classesList, admissionId, formData.applyingGrade]);

  // Load allocations for the applying class when reaching Phase 3
  useEffect(() => {
    if (activeTab === "phase3") {
      const classAllocations = dbAllocations.filter(
        (a) => a.classLabel === formData.applyingGrade
      );
      
      if (classAllocations.length > 0) {
        // Read components from localStorage to map IDs to codes
        const savedComps = localStorage.getItem("fee_components");
        let componentsList = [];
        if (savedComps) {
          try {
            componentsList = JSON.parse(savedComps);
          } catch (e) {}
        }
        if (!Array.isArray(componentsList) || componentsList.length === 0) {
          componentsList = [
            { id: "FC-01", code: "TUITION" },
            { id: "FC-02", code: "ADMISSION" },
            { id: "FC-03", code: "REGISTRATION" },
          ];
        }

        let tuition = 0;
        let admission = 0;
        let registration = 0;

        classAllocations.forEach((alloc) => {
          const comp = componentsList.find((c: any) => c.id === alloc.componentId);
          const code = comp?.code?.toUpperCase() || "";
          if (code === "TUITION") {
            tuition = Number(alloc.amount) || 0;
          } else if (code === "ADMISSION") {
            admission = Number(alloc.amount) || 0;
          } else if (code === "REGISTRATION") {
            registration = Number(alloc.amount) || 0;
          }
        });

        setFormData((prev) => ({
          ...prev,
          tuitionFee: tuition || prev.tuitionFee,
          admissionFee: admission || prev.admissionFee,
          registrationFee: registration || prev.registrationFee,
        }));
      }
    }
  }, [activeTab, formData.applyingGrade, dbAllocations]);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate receipt number if phase 3 payment becomes paid
      if (name === "paymentStatus" && value === "Paid" && !prev.receiptNumber) {
        updated.receiptNumber = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (name === "paymentStatus" && value !== "Paid") {
        updated.receiptNumber = "";
      }

      // Auto-set hostel / transport fees based on requirements
      if (name === "hostelRequirement") {
        updated.hostelFee = value === "Yes" ? 25000 : 0;
      }
      if (name === "transportRequirement") {
        updated.transportFee = value !== "No" ? 12000 : 0;
      }

      return updated;
    });
  };

  // Mock File Uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
    }
  };

  // Form Submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for Phase 1 (Mandatory)
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("Student First Name and Last Name are mandatory (Phase 1).");
      setActiveTab("phase1");
      return;
    }
    if (!formData.dob) {
      setErrorMessage("Student Date of Birth is mandatory (Phase 1).");
      setActiveTab("phase1");
      return;
    }
    if (!formData.applyingGrade) {
      setErrorMessage("Applying for Grade/Class is mandatory (Phase 1).");
      setActiveTab("phase1");
      return;
    }
    if (!formData.fatherName.trim() && !formData.motherName.trim()) {
      setErrorMessage("At least one parent's name is mandatory (Phase 1).");
      setActiveTab("phase1");
      return;
    }

    // Save full details in Local Storage
    localStorage.setItem(`admission_details_${formData.appNo}`, JSON.stringify(formData));

    // Save basic summary data back to DB using the callback
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    
    // Automatically transition status to approved if paid
    let finalStatus = status;
    if (formData.paymentStatus === "Paid") {
      finalStatus = "Approved";
    }

    onSave({
      id: formData.appNo,
      applicant: fullName,
      grade: formData.applyingGrade,
      status: finalStatus,
      applied_on: formData.admissionDate,
    });
  };

  // Calculate Net Fees
  const totalFees = 
    Number(formData.registrationFee) + 
    Number(formData.admissionFee) + 
    Number(formData.tuitionFee) + 
    Number(formData.hostelFee) + 
    Number(formData.transportFee);
  
  const discountAmount = Number(formData.scholarshipDiscount);
  const netFees = Math.max(0, totalFees - discountAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-elegant)] border border-border">
        
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {admissionId ? `Reviewing Application: ${formData.appNo}` : "New Admission Application"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Process admissions through a structured workflow.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content / Wizard Steps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Review Header (Only in Review mode) */}
          {admissionId && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-warning">
                <Shield className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Application Review Mode</p>
                  <p className="text-sm font-medium text-foreground">Update status and verify details to complete enrollment.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Application Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 rounded-md border border-input bg-card px-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Interview">Schedule Interview</option>
                  <option value="Documents">Request Documents</option>
                  <option value="Approved">Approve Admission</option>
                  <option value="Rejected">Reject Application</option>
                </select>
              </div>
            </div>
          )}

          {/* Validation Alert */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Wizard Steps indicator */}
          <div className="grid grid-cols-3 gap-2 border-b border-border pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("phase1")}
              className={`flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition border ${
                activeTab === "phase1"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent hover:bg-accent/40"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phase 1</span>
              <span className="text-sm font-bold">Initial Form</span>
              <span className="text-[10px] text-muted-foreground">Mandatory details</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("phase2")}
              className={`flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition border ${
                activeTab === "phase2"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent hover:bg-accent/40"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phase 2</span>
              <span className="text-sm font-bold">Verification</span>
              <span className="text-[10px] text-muted-foreground">Demographics & Docs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("phase3")}
              className={`flex flex-col items-start gap-1 p-2.5 rounded-lg text-left transition border ${
                activeTab === "phase3"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent hover:bg-accent/40"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phase 3</span>
              <span className="text-sm font-bold">Fee Collection</span>
              <span className="text-[10px] text-muted-foreground">Payments & Receipts</span>
            </button>
          </div>

          <form id="admission-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Phase 1 Pane */}
            {activeTab === "phase1" && (
              <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
                
                {/* Section A: Admission Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    1. Admission Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Application Number</label>
                      <input
                        type="text"
                        name="appNo"
                        value={formData.appNo}
                        className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm outline-none cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Academic Year *</label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>2025-2026</option>
                        <option>2026-2027</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Campus / Branch *</label>
                      <select
                        name="campus"
                        value={formData.campus}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>Main Campus</option>
                        <option>North Campus</option>
                        <option>South Campus</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Admission Date *</label>
                      <input
                        type="date"
                        name="admissionDate"
                        value={formData.admissionDate}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Admission Type *</label>
                      <select
                        name="admissionType"
                        value={formData.admissionType}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>Regular</option>
                        <option>Transfer</option>
                        <option>Scholarship</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Applying for Class / Grade *</label>
                      <select
                        name="applyingGrade"
                        value={formData.applyingGrade}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        {classesList.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Student Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    2. Student Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Nationality *</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Student Photograph</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "studentPhotoName")}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{formData.studentPhotoName || "Select photo file..."}</span>
                          <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Parent Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    3. Parent / Guardian Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Father's Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Richard Doe"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Father's Mobile Number</label>
                      <input
                        type="tel"
                        name="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Mother's Name</label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Mother's Mobile Number</label>
                      <input
                        type="tel"
                        name="motherPhone"
                        value={formData.motherPhone}
                        onChange={handleChange}
                        placeholder="98765 12340"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground">Parent Email ID *</label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleChange}
                        placeholder="parents@email.com"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    4. Address Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Current Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Door / Flat No, Street, Locality"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">PIN Code *</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="560001"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section E: Previous School */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    5. Academic History / Previous School
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Previous School Name</label>
                      <input
                        type="text"
                        name="prevSchoolName"
                        value={formData.prevSchoolName}
                        onChange={handleChange}
                        placeholder="St. Joseph's School"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Last Studied Class / Grade</label>
                      <input
                        type="text"
                        name="lastStudiedClass"
                        value={formData.lastStudiedClass}
                        onChange={handleChange}
                        placeholder="Grade 9"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Education Board</label>
                      <select
                        name="board"
                        value={formData.board}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>CBSE</option>
                        <option>ICSE</option>
                        <option>State Board</option>
                        <option>IB</option>
                        <option>IGCSE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section F: Documents */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    6. Mandatory Documents
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Birth Certificate *</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "birthCertificateName")}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{formData.birthCertificateName || "Attach Birth Certificate PDF/Image..."}</span>
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Phase 2 Pane */}
            {activeTab === "phase2" && (
              <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
                
                {/* Section A: Identity & Background */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    1. Identity & Demographics
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Aadhaar / Passport Number</label>
                      <input
                        type="text"
                        name="aadhaarPassport"
                        value={formData.aadhaarPassport}
                        onChange={handleChange}
                        placeholder="12-digit Aadhaar / Passport ID"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Religion</label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        placeholder="e.g. Hinduism, Islam, Christianity"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Category / Caste</label>
                      <select
                        name="categoryCaste"
                        value={formData.categoryCaste}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>General</option>
                        <option>OBC</option>
                        <option>SC</option>
                        <option>ST</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>O+</option>
                        <option>O-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Scholarship Request?</label>
                      <select
                        name="scholarshipRequest"
                        value={formData.scholarshipRequest}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>No</option>
                        <option>Academic Merit</option>
                        <option>Need-Based</option>
                        <option>Sports Quota</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Facility Requirements */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    2. Campus Facility Requirements
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Transport Requirement</label>
                      <select
                        name="transportRequirement"
                        value={formData.transportRequirement}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option value="No">No Transport (Self Drop)</option>
                        <option value="Route A">Bus Route A (North Bengaluru)</option>
                        <option value="Route B">Bus Route B (East Bengaluru)</option>
                        <option value="Route C">Bus Route C (Central Bengaluru)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Hostel / Boarding Requirement</label>
                      <select
                        name="hostelRequirement"
                        value={formData.hostelRequirement}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option value="No">No (Day Scholar)</option>
                        <option value="Yes">Yes (Full Boarding/Residency)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section C: Medical & Emergency */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    3. Medical & Emergency Info
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Medical Information / Allergies</label>
                      <textarea
                        name="medicalInfo"
                        value={formData.medicalInfo}
                        onChange={handleChange}
                        placeholder="List allergies, chronic conditions, regular medications, or write None"
                        className="h-20 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus:border-ring resize-none"
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Emergency Contact Name</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          placeholder="e.g. Uncle / Guardian Name"
                          className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Emergency Contact Mobile</label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          placeholder="Emergency Phone"
                          className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section D: Verification Uploads */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    4. Verification Documents
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Transfer Certificate (TC)</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "transferCertificateName")}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{formData.transferCertificateName || "Attach TC..."}</span>
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Previous Report Card</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "reportCardName")}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{formData.reportCardName || "Attach Grade sheet..."}</span>
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Address Proof</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "addressProofName")}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{formData.addressProofName || "Attach proof..."}</span>
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Phase 3 Pane */}
            {activeTab === "phase3" && (
              <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
                
                {/* Section A: Fee Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    1. Fee Items & Allocations
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Registration Fee (₹)</label>
                      <input
                        type="number"
                        name="registrationFee"
                        value={formData.registrationFee}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Admission Fee (₹)</label>
                      <input
                        type="number"
                        name="admissionFee"
                        value={formData.admissionFee}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Tuition Fee (Annual) (₹)</label>
                      <input
                        type="number"
                        name="tuitionFee"
                        value={formData.tuitionFee}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Hostel Fee (₹)</label>
                      <input
                        type="number"
                        name="hostelFee"
                        value={formData.hostelFee}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm outline-none cursor-not-allowed"
                        readOnly
                      />
                      <p className="text-[10px] text-muted-foreground">Set via Hostel requirement in Phase 2</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Transport Fee (₹)</label>
                      <input
                        type="number"
                        name="transportFee"
                        value={formData.transportFee}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm outline-none cursor-not-allowed"
                        readOnly
                      />
                      <p className="text-[10px] text-muted-foreground">Set via Transport requirement in Phase 2</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Scholarship / Discount (₹)</label>
                      <input
                        type="number"
                        name="scholarshipDiscount"
                        value={formData.scholarshipDiscount}
                        onChange={handleChange}
                        placeholder="0"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Billing Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                    2. Payment & Receipts
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option>Cash</option>
                        <option>Card</option>
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                        <option>Net Banking</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Payment Status</label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid (Full)</option>
                        <option value="Partially Paid">Partially Paid</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Receipt Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="receiptNumber"
                          value={formData.receiptNumber}
                          className="h-10 w-full rounded-md border border-input bg-muted px-3 pr-8 text-sm outline-none cursor-not-allowed"
                          readOnly
                          placeholder="Auto-generated on Paid"
                        />
                        <Receipt className="absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary Panel */}
                <div className="rounded-2xl bg-muted/60 p-5 border border-border space-y-3">
                  <div className="flex items-center gap-1.5 text-primary">
                    <DollarSign className="h-5 w-5" />
                    <h4 className="font-bold text-sm">Fee Collection Summary</h4>
                  </div>
                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between border-b border-border pb-1.5 text-muted-foreground">
                      <span>Total Allocated Fees</span>
                      <span>₹{totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-1.5 text-muted-foreground">
                      <span>Scholarship Deduction</span>
                      <span className="text-destructive">- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                      <span>Net Outstanding Amount</span>
                      <span className="text-primary">₹{netFees.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </form>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {activeTab === "phase1" && "* Mandatory field required to start the application."}
            {activeTab === "phase2" && "Verification details can be completed now or later."}
            {activeTab === "phase3" && "Fee collection is completed once approved."}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-input bg-card px-4 text-xs font-semibold hover:bg-accent transition"
            >
              Cancel
            </button>
            
            {activeTab !== "phase3" ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "phase1" ? "phase2" : "phase3")}
                className="inline-flex h-9 items-center gap-1 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 px-4 text-xs font-semibold transition"
              >
                Next Phase →
              </button>
            ) : null}

            <button
              type="submit"
              form="admission-form"
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 px-4 text-xs font-semibold transition disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {admissionId ? "Save Changes" : "Submit Application"}
            </button>
          </div>
        </div>

      </Card>
    </div>
  );
}
