import { useState } from "react";
import { AlertTriangle, Plus, Wallet, Search, CheckCircle2, FileText, X } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, Pagination, StatCard, statusTone } from "@/components/erp/ui";
import { useFeesQuery, useAddFeeMutation, useStudentsQuery } from "@/hooks/use-api-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function FeesPage() {
  const { data: fees = [], isLoading } = useFeesQuery();
  const { data: students = [] } = useStudentsQuery();
  const addFeeMutation = useAddFeeMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form state
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("Grade 10-A");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Pending");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const collected = fees
    .filter((f: any) => f.status === "Paid")
    .reduce((sum: number, f: any) => sum + Number(f.amount), 0);
  const pending = fees
    .filter((f: any) => f.status === "Pending")
    .reduce((sum: number, f: any) => sum + Number(f.amount), 0);
  const overdue = fees
    .filter((f: any) => f.status === "Overdue")
    .reduce((sum: number, f: any) => sum + Number(f.amount), 0);

  const formatAmount = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${(num / 1000).toFixed(1)}K`;
  };

  const filteredFees = fees.filter((f: any) => {
    const matchesSearch =
      !search ||
      f.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.id?.toLowerCase().includes(search.toLowerCase()) ||
      f.grade?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !amount || !due) {
      toast.error("Please fill in student name, amount, and due date.");
      return;
    }

    try {
      await addFeeMutation.mutateAsync({
        student_name: studentName.trim(),
        grade,
        amount: Number(amount),
        due,
        status,
      });

      toast.success("Invoice created successfully!");
      setIsDialogOpen(false);
      setStudentName("");
      setAmount("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        subtitle="Invoices, payments and outstanding balances."
        actions={
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" /> New Invoice
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected (term)" value={formatAmount(collected)} icon={Wallet} tone="success" />
        <StatCard label="Pending" value={formatAmount(pending)} icon={AlertTriangle} tone="warning" />
        <StatCard label="Overdue" value={formatAmount(overdue)} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Refunds" value="₹0" icon={Wallet} tone="info" />
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices, student or class…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={[
            { key: "id", label: "Invoice" },
            { key: "student_name", label: "Student" },
            { key: "grade", label: "Class" },
            {
              key: "amount",
              label: "Amount (₹)",
              align: "right",
              render: (r) => Number(r.amount).toLocaleString(),
            },
            {
              key: "due",
              label: "Due date",
              render: (r) => new Date(r.due).toLocaleDateString(),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
            },
            {
              key: "act",
              label: "",
              render: (r) => (
                <button
                  onClick={() => setSelectedInvoice(r)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View
                </button>
              ),
            },
          ]}
          rows={filteredFees}
        />
        <Pagination />
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Fee Invoice</DialogTitle>
            <DialogDescription>
              Generate a new fee invoice for a student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Student Name</label>
              <input
                type="text"
                required
                list="students-list"
                placeholder="e.g. Aarav Singh"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  const matched = students.find(
                    (s: any) => s.name?.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (matched) {
                    setGrade(`${matched.grade}-${matched.section}`);
                  }
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <datalist id="students-list">
                {students.map((s: any) => (
                  <option key={s.id} value={s.name}>
                    {s.grade} - Section {s.section}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Class / Grade</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10-A"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Due Date</label>
                <input
                  type="date"
                  required
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="h-9 px-4 rounded-md border border-input text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addFeeMutation.isPending}
                className="h-9 px-4 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {addFeeMutation.isPending ? "Saving..." : "Create Invoice"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice {selectedInvoice.id}
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown for invoice {selectedInvoice.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Student</span>
                <span className="font-semibold">{selectedInvoice.student_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Class / Grade</span>
                <span className="font-medium">{selectedInvoice.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-sm text-primary">
                  ₹{Number(selectedInvoice.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Due Date</span>
                <span>{new Date(selectedInvoice.due).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge tone={statusTone(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </Badge>
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full h-9 rounded-md bg-muted text-xs font-medium hover:bg-muted/80"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
