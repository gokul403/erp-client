import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  FileCheck,
  User,
  Users,
  GraduationCap,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Check,
  AlertCircle,
  CreditCard,
  Send,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge, statusTone } from "@/components/erp/ui";
import { toast } from "sonner";

interface AdmissionReviewModalProps {
  admission: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, updatePayload: any) => Promise<void>;
  isUpdating: boolean;
}

export function AdmissionReviewModal({
  admission,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdating,
}: AdmissionReviewModalProps) {
  if (!admission) return null;

  const [activeTab, setActiveTab] = useState<
    "overview" | "family" | "academics" | "facilities" | "decision"
  >("overview");

  // Workflow Decision states
  const [decisionAction, setDecisionAction] = useState<
    "approve" | "reject" | "interview" | "documents" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState(admission.review_notes || "");
  const [interviewDate, setInterviewDate] = useState(
    admission.details?.interviewDate || ""
  );
  const [interviewer, setInterviewer] = useState(
    admission.details?.interviewer || "Dr. Priya Sharma (Principal)"
  );
  const [enrollStudent, setEnrollStudent] = useState(true);
  const [missingDocNote, setMissingDocNote] = useState("");

  const details = admission.details || {};
  const documents = details.documents || [
    { name: "Birth Certificate", status: "Verified", date: "2025-06-12" },
    { name: "Previous School Marksheet", status: "Verified", date: "2025-06-12" },
    { name: "Transfer Certificate (TC)", status: "Pending", date: null },
    { name: "Address & Parent ID Proof", status: "Verified", date: "2025-06-12" },
  ];

  // Helper calculation for age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const age = calculateAge(admission.dob);

  // Workflow Stepper active index
  const getWorkflowStep = (status: string) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Documents":
        return 2;
      case "Interview":
        return 3;
      case "Approved":
        return 5;
      case "Rejected":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getWorkflowStep(admission.status);

  // Handle Quick Decision Submission
  const handleExecuteDecision = async () => {
    if (!decisionAction) return;

    let targetStatus = admission.status;
    let updatedDetails = { ...details };
    let finalNotes = reviewNotes.trim();

    if (decisionAction === "approve") {
      targetStatus = "Approved";
      finalNotes = finalNotes || "Application approved by Admissions Committee.";
    } else if (decisionAction === "reject") {
      targetStatus = "Rejected";
      finalNotes = finalNotes || "Application rejected per admission criteria.";
    } else if (decisionAction === "interview") {
      targetStatus = "Interview";
      updatedDetails.interviewDate = interviewDate;
      updatedDetails.interviewer = interviewer;
      finalNotes = finalNotes || `Interview scheduled for ${interviewDate} with ${interviewer}.`;
    } else if (decisionAction === "documents") {
      targetStatus = "Documents";
      finalNotes = finalNotes || `Additional documents requested: ${missingDocNote || "Please submit pending certificates."}`;
    }

    try {
      await onUpdateStatus(admission.id, {
        status: targetStatus,
        review_notes: finalNotes,
        details: updatedDetails,
        enrollStudent: decisionAction === "approve" ? enrollStudent : false,
      });

      toast.success(
        decisionAction === "approve"
          ? `Application for ${admission.applicant} APPROVED successfully!`
          : decisionAction === "reject"
          ? `Application for ${admission.applicant} marked as REJECTED.`
          : `Application status updated to ${targetStatus}.`
      );
      setDecisionAction(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update admission status.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-xl grid place-items-center shadow-md">
              {admission.applicant
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {admission.applicant}
                </h2>
                <Badge tone={statusTone(admission.status)}>{admission.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="font-mono font-medium text-foreground">
                  {admission.id}
                </span>
                <span>•</span>
                <span className="font-semibold text-primary">
                  Applying for {admission.grade}
                </span>
                <span>•</span>
                <span>
                  Applied on {new Date(admission.applied_on).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Decision Workflow Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDecisionAction("approve")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => setDecisionAction("reject")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={() => setDecisionAction("interview")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium shadow-sm transition"
            >
              <Calendar className="h-3.5 w-3.5 text-blue-500" /> Interview
            </button>
            <button
              onClick={() => setDecisionAction("documents")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium shadow-sm transition"
            >
              <FileCheck className="h-3.5 w-3.5 text-purple-500" /> Request Docs
            </button>
          </div>
        </div>

        {/* Workflow Lifecycle Stepper */}
        <div className="bg-muted/40 px-6 py-3 border-b border-border/60">
          <div className="flex items-center justify-between text-xs max-w-2xl mx-auto">
            {[
              { num: 1, label: "Application" },
              { num: 2, label: "Documents" },
              { num: 3, label: "Interview" },
              { num: 4, label: "Decision" },
              { num: 5, label: "Enrolled" },
            ].map((step, idx) => {
              const isPast = currentStep >= step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ${
                      admission.status === "Rejected" && step.num === 4
                        ? "bg-rose-600 text-white"
                        : isPast
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast && step.num < currentStep ? "✓" : step.num}
                  </div>
                  <span
                    className={`hidden sm:inline font-medium ${
                      isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < 4 && (
                    <div
                      className={`h-0.5 w-6 sm:w-12 mx-1 ${
                        currentStep > step.num ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-border bg-background overflow-x-auto">
          {[
            { id: "overview", label: "Student & Bio", icon: User },
            { id: "family", label: "Parents & Contact", icon: Users },
            { id: "academics", label: "Academics & Docs", icon: GraduationCap },
            { id: "facilities", label: "Facilities & Fees", icon: CreditCard },
            { id: "decision", label: "Review & Remarks", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Student Overview & Demographics */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Full Name</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {admission.applicant}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Date of Birth / Age
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {admission.dob
                      ? `${new Date(admission.dob).toLocaleDateString()} (${age} years old)`
                      : "Not recorded"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Gender</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {admission.gender || "Male"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Aadhaar / National ID
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                    {details.aadhaar || "4532-8891-2309"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Blood Group</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {details.bloodGroup || "O+"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Nationality</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {details.nationality || "Indian"}
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  admission.status === "Approved"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    : admission.status === "Rejected"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300"
                }`}
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-sm">
                    Application Status: {admission.status}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {admission.review_notes ||
                      "Application currently pending final assessment by the admissions board."}
                  </p>
                  {admission.reviewed_by && (
                    <p className="mt-1.5 text-[11px] opacity-75">
                      Reviewed by {admission.reviewed_by} on{" "}
                      {new Date(admission.reviewed_at || Date.now()).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Family & Contact Details */}
          {activeTab === "family" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father Info */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                    <User className="h-4 w-4" /> Father's Information
                  </div>
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-semibold">
                        {details.fatherName || admission.guardian || "Sanjay Gupta"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Occupation:</span>
                      <span>{details.fatherOccupation || "Senior Professional"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-mono">{details.fatherPhone || admission.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                    <User className="h-4 w-4" /> Mother's Information
                  </div>
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-semibold">
                        {details.motherName || "Pooja Gupta"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Occupation:</span>
                      <span>{details.motherOccupation || "Executive"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-mono">
                        {details.motherPhone || admission.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Communication */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Communication & Residential Address
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-[11px]">Primary Email</p>
                      <p className="font-medium text-foreground">{admission.email || "parent@gmail.com"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-[11px]">Primary Phone</p>
                      <p className="font-medium text-foreground font-mono">{admission.phone || "+91 98450 12844"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-[11px]">Home Address</p>
                      <p className="font-medium text-foreground">
                        {admission.address || "22 Lavelle Road, Central Bengaluru, Karnataka 560001"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Academic History & Documents */}
          {activeTab === "academics" && (
            <div className="space-y-6">
              {/* Previous Schooling */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Prior Academic Record
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Previous Institution:</span>
                    <p className="font-semibold text-sm mt-0.5">
                      {admission.prev_school || "St. Joseph's Primary School"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Class Passed:</span>
                    <p className="font-semibold text-sm mt-0.5">
                      {details.lastGradePassed || "Standard Grade"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Percentage / GPA:</span>
                    <p className="font-semibold text-sm mt-0.5 text-primary">
                      {details.prevScore || "92.4%"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Document Verification Checklist
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    All required official records
                  </span>
                </div>

                <div className="divide-y divide-border/60">
                  {documents.map((doc: any, i: number) => (
                    <div
                      key={i}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ${
                            doc.status === "Verified"
                              ? "bg-emerald-500/20 text-emerald-600"
                              : doc.status === "Uploaded"
                              ? "bg-blue-500/20 text-blue-600"
                              : "bg-amber-500/20 text-amber-600"
                          }`}
                        >
                          {doc.status === "Verified" ? "✓" : "!"}
                        </div>
                        <span className="font-medium text-foreground">{doc.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          tone={
                            doc.status === "Verified"
                              ? "success"
                              : doc.status === "Uploaded"
                              ? "info"
                              : "warning"
                          }
                        >
                          {doc.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {doc.date ? new Date(doc.date).toLocaleDateString() : "Pending upload"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Facilities & Fee Structure */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              {/* Facilities opted */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">School Transport</p>
                  <p className="text-sm font-semibold mt-1">
                    {details.transportRequired ? "Yes (Opted)" : "No (Own Transport)"}
                  </p>
                  {details.transportRoute && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Route: {details.transportRoute}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Hostel Accommodation</p>
                  <p className="text-sm font-semibold mt-1">
                    {details.hostelRequired ? "Yes (Boarding)" : "No (Day Scholar)"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[11px] font-medium text-muted-foreground">Scholarship Application</p>
                  <p className="text-sm font-semibold mt-1">
                    {details.scholarshipRequested ? "Requested (Merit)" : "Standard Fee"}
                  </p>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Applicable Admission Fee Schedule
                </p>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Application & Registration Fee</span>
                    <span className="font-mono">
                      ₹{(details.feeBreakdown?.registrationFee || 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">One-time Admission Fee</span>
                    <span className="font-mono">
                      ₹{(details.feeBreakdown?.admissionFee || 15000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Annual Tuition Fee ({admission.grade})</span>
                    <span className="font-mono">
                      ₹{(details.feeBreakdown?.tuitionFee || 35000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold border-t border-border">
                    <span>Total Payable</span>
                    <span className="font-mono text-primary">
                      ₹{(details.feeBreakdown?.total || 51000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fee Status:</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        details.feeBreakdown?.paymentStatus === "Paid"
                          ? "success"
                          : "warning"
                      }
                    >
                      {details.feeBreakdown?.paymentStatus || "Pending"}
                    </Badge>
                    {details.feeBreakdown?.receiptNo && (
                      <span className="font-mono text-muted-foreground">
                        #{details.feeBreakdown.receiptNo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Review & Decision History */}
          {activeTab === "decision" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Review Decision & Remarks
                </p>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Committee Reviewer Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add formal remarks, academic evaluation notes, or conditions..."
                      className="w-full mt-1 p-2.5 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Assigned Reviewer
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          admission.reviewed_by || "Rohit Mehta (School Admin)"
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-md border border-input bg-muted/50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Review Date
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          admission.reviewed_at
                            ? new Date(admission.reviewed_at).toLocaleString()
                            : new Date().toLocaleString()
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-md border border-input bg-muted/50 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Status Action Tiles */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Take Workflow Action
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => setDecisionAction("approve")}
                    className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-1" />
                    <p className="font-semibold text-xs text-foreground">Approve</p>
                    <p className="text-[10px] text-muted-foreground">Confirm enrolment</p>
                  </button>

                  <button
                    onClick={() => setDecisionAction("interview")}
                    className="p-3 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-left transition"
                  >
                    <Calendar className="h-5 w-5 text-blue-600 mb-1" />
                    <p className="font-semibold text-xs text-foreground">Interview</p>
                    <p className="text-[10px] text-muted-foreground">Schedule screening</p>
                  </button>

                  <button
                    onClick={() => setDecisionAction("documents")}
                    className="p-3 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-left transition"
                  >
                    <FileCheck className="h-5 w-5 text-purple-600 mb-1" />
                    <p className="font-semibold text-xs text-foreground">Request Docs</p>
                    <p className="text-[10px] text-muted-foreground">Missing certificates</p>
                  </button>

                  <button
                    onClick={() => setDecisionAction("reject")}
                    className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-left transition"
                  >
                    <XCircle className="h-5 w-5 text-rose-600 mb-1" />
                    <p className="font-semibold text-xs text-foreground">Reject</p>
                    <p className="text-[10px] text-muted-foreground">Decline candidate</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-6 py-3.5 bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Current status: <span className="font-bold text-foreground">{admission.status}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Sub-Dialog for Confirming Workflow Decision */}
        {decisionAction && (
          <Dialog open={!!decisionAction} onOpenChange={() => setDecisionAction(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {decisionAction === "approve" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                  {decisionAction === "reject" && (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  )}
                  {decisionAction === "interview" && (
                    <Calendar className="h-5 w-5 text-blue-600" />
                  )}
                  {decisionAction === "documents" && (
                    <FileCheck className="h-5 w-5 text-purple-600" />
                  )}
                  {decisionAction === "approve"
                    ? "Approve Admission Application"
                    : decisionAction === "reject"
                    ? "Reject Admission Application"
                    : decisionAction === "interview"
                    ? "Schedule Interview Assessment"
                    : "Request Additional Documents"}
                </DialogTitle>
                <DialogDescription>
                  Applicant: <strong>{admission.applicant}</strong> ({admission.grade})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {decisionAction === "approve" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-800 dark:text-emerald-300">
                      Approving this application will advance {admission.applicant} to
                      Enrolment status.
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={enrollStudent}
                        onChange={(e) => setEnrollStudent(e.target.checked)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <span>
                        Automatically add {admission.applicant} to the active Student roster
                      </span>
                    </label>
                  </div>
                )}

                {decisionAction === "reject" && (
                  <div className="space-y-2">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-800 dark:text-rose-300">
                      Please specify the primary reason for rejection. This will be recorded
                      in the formal audit log.
                    </div>
                  </div>
                )}

                {decisionAction === "interview" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-muted-foreground font-medium">
                        Interview Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground font-medium">
                        Assigned Interviewer / Panel
                      </label>
                      <input
                        type="text"
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-input bg-background"
                      />
                    </div>
                  </div>
                )}

                {decisionAction === "documents" && (
                  <div className="space-y-2">
                    <label className="text-muted-foreground font-medium">
                      Missing Document Requirements
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Original Transfer Certificate & Immunization Record"
                      value={missingDocNote}
                      onChange={(e) => setMissingDocNote(e.target.value)}
                      className="w-full p-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                )}

                <div>
                  <label className="text-muted-foreground font-medium">
                    Review Remarks / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter final comments..."
                    className="w-full mt-1 p-2 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionAction(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleExecuteDecision}
                  className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm disabled:opacity-50 ${
                    decisionAction === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : decisionAction === "reject"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isUpdating ? "Saving..." : "Confirm Decision"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
