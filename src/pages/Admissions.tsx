import { useState } from "react";
import {
  Plus,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  FileCheck,
  Clock,
  ArrowUpDown,
  FileText,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  Card,
  DataTable,
  PageHeader,
  Pagination,
  StatCard,
  statusTone,
} from "@/components/erp/ui";
import {
  useAdmissionsQuery,
  useAddAdmissionMutation,
  useUpdateAdmissionMutation,
} from "@/hooks/use-api-data";
import { AdmissionForm } from "@/components/AdmissionForm";
import { AdmissionReviewModal } from "@/components/AdmissionReviewModal";
import { toast } from "sonner";

export function AdmissionsPage() {
  const { data: admissions = [], isLoading } = useAdmissionsQuery();
  const addAdmission = useAddAdmissionMutation();
  const updateAdmission = useUpdateAdmissionMutation();

  // Workflow Pipeline Filter State
  const [activePipelineTab, setActivePipelineTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReviewAdmission, setSelectedReviewAdmission] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Pipeline Metric Counts
  const approvedCount = admissions.filter((a: any) => a.status === "Approved").length;
  const pendingCount = admissions.filter((a: any) => a.status === "Pending").length;
  const interviewCount = admissions.filter((a: any) => a.status === "Interview").length;
  const documentsCount = admissions.filter((a: any) => a.status === "Documents").length;
  const rejectedCount = admissions.filter((a: any) => a.status === "Rejected").length;

  // Filtered Admissions
  const filteredAdmissions = admissions.filter((a: any) => {
    const matchesSearch =
      !search ||
      a.applicant?.toLowerCase().includes(search.toLowerCase()) ||
      a.id?.toLowerCase().includes(search.toLowerCase()) ||
      a.guardian?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = gradeFilter === "all" || a.grade === gradeFilter;

    let matchesPipeline = true;
    if (activePipelineTab === "pending") matchesPipeline = a.status === "Pending";
    else if (activePipelineTab === "interview") matchesPipeline = a.status === "Interview";
    else if (activePipelineTab === "documents") matchesPipeline = a.status === "Documents";
    else if (activePipelineTab === "approved") matchesPipeline = a.status === "Approved";
    else if (activePipelineTab === "rejected") matchesPipeline = a.status === "Rejected";

    return matchesSearch && matchesGrade && matchesPipeline;
  });

  // Unique Grades for dropdown
  const uniqueGrades = Array.from(new Set(admissions.map((a: any) => a.grade))).filter(Boolean);

  // Quick Inline Status Update
  const handleQuickStatusChange = async (admissionId: string, newStatus: string) => {
    try {
      await updateAdmission.mutateAsync({
        id: admissionId,
        data: {
          status: newStatus,
          enrollStudent: newStatus === "Approved",
          review_notes: `Status changed to ${newStatus} from admission overview.`,
        },
      });
      toast.success(`Application status updated to ${newStatus}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Full Review Update Callback from Modal
  const handleReviewModalUpdate = async (id: string, updatePayload: any) => {
    await updateAdmission.mutateAsync({
      id,
      data: updatePayload,
    });
    // Update local state of currently viewed admission
    setSelectedReviewAdmission((prev: any) =>
      prev ? { ...prev, ...updatePayload } : null
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Review & Workflow"
        subtitle="End-to-end applicant screening, verification, interviews, and enrolment decisions."
        actions={
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> New Application
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Applications"
          value={admissions.length.toString()}
          icon={UserPlus}
          tone="primary"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount.toString()}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="In Interview"
          value={interviewCount.toString()}
          icon={Calendar}
          tone="info"
        />
        <StatCard
          label="Approved / Admitted"
          value={approvedCount.toString()}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount.toString()}
          icon={XCircle}
          tone="destructive"
        />
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        {/* Pipeline Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/70 text-xs">
          {[
            { id: "all", label: "All Applicants", count: admissions.length },
            { id: "pending", label: "Pending Review", count: pendingCount, color: "text-amber-600 bg-amber-500/10" },
            { id: "interview", label: "Interview", count: interviewCount, color: "text-blue-600 bg-blue-500/10" },
            { id: "documents", label: "Docs Needed", count: documentsCount, color: "text-purple-600 bg-purple-500/10" },
            { id: "approved", label: "Approved", count: approvedCount, color: "text-emerald-600 bg-emerald-500/10" },
            { id: "rejected", label: "Rejected", count: rejectedCount, color: "text-rose-600 bg-rose-500/10" },
          ].map((tab) => {
            const isActive = activePipelineTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePipelineTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-primary-foreground"
                      : tab.color || "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student, guardian, phone or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Grades</option>
              {uniqueGrades.map((g: any) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Applicants DataTable */}
        <DataTable
          columns={[
            {
              key: "id",
              label: "Application ID",
              render: (r) => (
                <span className="font-mono text-xs font-semibold text-primary">
                  {r.id}
                </span>
              ),
            },
            {
              key: "applicant",
              label: "Applicant",
              render: (r) => (
                <div>
                  <p className="font-semibold text-foreground text-xs">{r.applicant}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Guardian: {r.guardian || r.details?.fatherName || "Parent"} • {r.phone || "No phone"}
                  </p>
                </div>
              ),
            },
            {
              key: "grade",
              label: "Class Applying",
              render: (r) => (
                <span className="font-medium text-xs text-foreground">{r.grade}</span>
              ),
            },
            {
              key: "applied_on",
              label: "Applied On",
              render: (r) => (
                <span className="text-xs text-muted-foreground">
                  {new Date(r.applied_on).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "status",
              label: "Review Status",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  <select
                    value={r.status}
                    onChange={(e) => handleQuickStatusChange(r.id, e.target.value)}
                    className="text-[11px] border border-border/60 rounded px-1.5 py-0.5 bg-background focus:ring-1 focus:ring-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Documents">Documents</option>
                    <option value="Interview">Interview</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                  </select>
                </div>
              ),
            },
            {
              key: "act",
              label: "Actions",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReviewAdmission(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition"
                  >
                    Review Dossier
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredAdmissions}
        />
        <Pagination />
      </Card>

      {/* Comprehensive Admission Review Modal */}
      {selectedReviewAdmission && (
        <AdmissionReviewModal
          admission={selectedReviewAdmission}
          isOpen={!!selectedReviewAdmission}
          onClose={() => setSelectedReviewAdmission(null)}
          onUpdateStatus={handleReviewModalUpdate}
          isUpdating={updateAdmission.isPending}
        />
      )}

      {/* Multi-phase New Application Wizard Form */}
      {isFormOpen && (
        <AdmissionForm
          admissionId={null}
          initialData={null}
          onClose={() => setIsFormOpen(false)}
          onSave={async (basicData: any) => {
            try {
              await addAdmission.mutateAsync(basicData);
              toast.success("New application created successfully!");
              setIsFormOpen(false);
            } catch (err: any) {
              toast.error(err.message || "Failed to create application");
            }
          }}
          isSaving={addAdmission.isPending}
        />
      )}
    </div>
  );
}
