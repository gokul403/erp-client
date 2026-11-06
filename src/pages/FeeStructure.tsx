import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Edit, Check, Settings, ShieldAlert, DollarSign, Layers, BookOpen, Info } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useClassesQuery,
  useFeeAllocationsQuery,
  useSaveFeeAllocationsMutation,
} from "@/hooks/use-api-data";

interface FeeComponent {
  id: string;
  name: string;
  code: string; // e.g. TUITION
  description: string;
  frequency: "One-time" | "Monthly" | "Termly" | "Annually";
}

interface FeeAllocation {
  id: string;
  classLabel: string; // e.g. "Grade 10" (we map by class label or class ID)
  componentId: string;
  amount: number;
}

const DEFAULT_COMPONENTS: FeeComponent[] = [
  { id: "FC-01", name: "Tuition Fee", code: "TUITION", description: "Standard academic instruction fee.", frequency: "Annually" },
  { id: "FC-02", name: "Admission Fee", code: "ADMISSION", description: "One-time fee for new student enrollments.", frequency: "One-time" },
  { id: "FC-03", name: "Registration Fee", code: "REGISTRATION", description: "Processing fee for admissions applications.", frequency: "One-time" },
  { id: "FC-04", name: "Exam Fee", code: "EXAM", description: "Covers semester tests, printing, and grading materials.", frequency: "Termly" },
  { id: "FC-05", name: "Lab Fee", code: "LAB", description: "Allocated fee for practical science and computer lab access.", frequency: "Termly" },
];

const DEFAULT_ALLOCATIONS: FeeAllocation[] = [
  // Grade 10 Allocations
  { id: "FA-01", classLabel: "Grade 10", componentId: "FC-01", amount: 45000 },
  { id: "FA-02", classLabel: "Grade 10", componentId: "FC-02", amount: 15000 },
  { id: "FA-03", classLabel: "Grade 10", componentId: "FC-03", amount: 1000 },
  { id: "FA-04", classLabel: "Grade 10", componentId: "FC-04", amount: 2500 },

  // Grade 9 Allocations
  { id: "FA-05", classLabel: "Grade 9", componentId: "FC-01", amount: 38000 },
  { id: "FA-06", classLabel: "Grade 9", componentId: "FC-02", amount: 12000 },
  { id: "FA-07", classLabel: "Grade 9", componentId: "FC-03", amount: 1000 },
  { id: "FA-08", classLabel: "Grade 9", componentId: "FC-04", amount: 2000 },

  // Class 5 Allocations
  { id: "FA-09", classLabel: "Class 5", componentId: "FC-01", amount: 25000 },
  { id: "FA-10", classLabel: "Class 5", componentId: "FC-02", amount: 8000 },
  { id: "FA-11", classLabel: "Class 5", componentId: "FC-03", amount: 1000 },
  { id: "FA-12", classLabel: "Class 5", componentId: "FC-04", amount: 1500 },
];

export function FeeStructurePage() {
  const [activeTab, setActiveTab] = useState<"components" | "allocations">("components");

  // 1. Data States
  const [components, setComponents] = useState<FeeComponent[]>([]);
  const [allocations, setAllocations] = useState<FeeAllocation[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  const { data: dbClasses = [] } = useClassesQuery();
  const { data: dbAllocations = [], isLoading: isAllocationsLoading } = useFeeAllocationsQuery();
  const saveAllocationsMutation = useSaveFeeAllocationsMutation();

  // 2. Modals States
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isAllocOpen, setIsAllocOpen] = useState(false);

  // Form Fields - Component Modal
  const [compEditingId, setCompEditingId] = useState<string | null>(null);
  const [compName, setCompName] = useState("");
  const [compCode, setCompCode] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compFreq, setCompFreq] = useState<FeeComponent["frequency"]>("Annually");

  // Form Fields - Allocation Modal
  const [allocEditingId, setAllocEditingId] = useState<string | null>(null);
  const [allocCompId, setAllocCompId] = useState("");
  const [allocAmount, setAllocAmount] = useState("");

  // 3. Initial Load from LocalStorage
  useEffect(() => {
    // Load Components with defensive checking
    const savedComps = localStorage.getItem("fee_components");
    if (savedComps) {
      try {
        const parsed = JSON.parse(savedComps);
        if (Array.isArray(parsed)) {
          setComponents(parsed);
        } else {
          setComponents(DEFAULT_COMPONENTS);
        }
      } catch (e) {
        setComponents(DEFAULT_COMPONENTS);
      }
    } else {
      localStorage.setItem("fee_components", JSON.stringify(DEFAULT_COMPONENTS));
      setComponents(DEFAULT_COMPONENTS);
    }

    // Load Allocations with defensive checking
  }, []);

  // Sync allocations from dbAllocations
  useEffect(() => {
    if (dbAllocations && dbAllocations.length > 0) {
      setAllocations(dbAllocations);
    } else {
      const savedAllocs = localStorage.getItem("fee_allocations");
      if (savedAllocs) {
        try {
          const parsed = JSON.parse(savedAllocs);
          if (Array.isArray(parsed)) {
            setAllocations(parsed);
            return;
          }
        } catch (e) {}
      }
      setAllocations(DEFAULT_ALLOCATIONS);
    }
  }, [dbAllocations]);

  // Sync classes from dbClasses
  useEffect(() => {
    const uniqueGrades = dbClasses.length > 0 
      ? Array.from(new Set(dbClasses.map((c: any) => c.grade))) as string[]
      : ["Grade 10", "Grade 9", "Grade 11", "Class 5"];
    
    setClasses(uniqueGrades);
    if (uniqueGrades.length > 0) {
      if (!selectedClass || !uniqueGrades.includes(selectedClass)) {
        setSelectedClass(uniqueGrades[0]);
      }
    }
  }, [dbClasses]);

  // 4. Component Submit / Edit Actions
  const handleOpenAddComp = () => {
    setCompEditingId(null);
    setCompName("");
    setCompCode("");
    setCompDesc("");
    setCompFreq("Annually");
    setIsCompOpen(true);
  };

  const handleOpenEditComp = (c: FeeComponent) => {
    setCompEditingId(c.id);
    setCompName(c.name);
    setCompCode(c.code);
    setCompDesc(c.description);
    setCompFreq(c.frequency);
    setIsCompOpen(true);
  };

  const handleCompSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!compName.trim()) {
      toast.error("Component Name is required");
      return;
    }
    if (!compCode.trim()) {
      toast.error("Component Code is required");
      return;
    }

    let updatedComps = [...components];

    if (compEditingId) {
      updatedComps = updatedComps.map((c) =>
        c.id === compEditingId
          ? { ...c, name: compName.trim(), code: compCode.toUpperCase().trim(), description: compDesc.trim(), frequency: compFreq }
          : c
      );
      toast.success("Fee component updated");
    } else {
      const newComp: FeeComponent = {
        id: `FC-${Date.now().toString().slice(-4)}`,
        name: compName.trim(),
        code: compCode.toUpperCase().trim(),
        description: compDesc.trim(),
        frequency: compFreq,
      };
      updatedComps.push(newComp);
      toast.success("New fee component added to library");
    }

    localStorage.setItem("fee_components", JSON.stringify(updatedComps));
    setComponents(updatedComps);
    setIsCompOpen(false);
  };

  const handleCompDelete = (id: string, name: string) => {
    const isAllocated = Array.isArray(allocations) && allocations.some((a) => a.componentId === id);
    if (isAllocated) {
      toast.error(`Cannot delete! '${name}' is allocated to one or more classes. Remove class allocations first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const updatedComps = components.filter((c) => c.id !== id);
      localStorage.setItem("fee_components", JSON.stringify(updatedComps));
      setComponents(updatedComps);
      toast.success("Component deleted successfully");
    }
  };

  const handleSaveAllocations = async () => {
    if (!selectedClass) {
      toast.error("No class selected");
      return;
    }
    const classAllocations = allocations.filter((a) => a.classLabel === selectedClass);
    try {
      await saveAllocationsMutation.mutateAsync({
        classLabel: selectedClass,
        allocations: classAllocations.map((a) => ({
          id: a.id,
          componentId: a.componentId,
          amount: a.amount,
        })),
      });
      toast.success(`Allocations for ${selectedClass} saved to database successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save allocations");
    }
  };

  // 5. Allocation Matrix Actions
  const handleOpenAddAlloc = () => {
    setAllocEditingId(null);
    const allocatedCompIds = (Array.isArray(allocations) ? allocations : [])
      .filter((a) => a.classLabel === selectedClass)
      .map((a) => a.componentId);
    
    const available = components.find((c) => !allocatedCompIds.includes(c.id));
    setAllocCompId(available ? available.id : components[0]?.id || "");
    setAllocAmount("");
    setIsAllocOpen(true);
  };

  const handleOpenEditAlloc = (a: FeeAllocation) => {
    setAllocEditingId(a.id);
    setAllocCompId(a.componentId);
    setAllocAmount(a.amount ? a.amount.toString() : "");
    setIsAllocOpen(true);
  };

  const handleAllocSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allocCompId) {
      toast.error("Please select a Fee Component");
      return;
    }
    const amt = parseFloat(allocAmount);
    if (isNaN(amt) || amt < 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    let updatedAllocs = [...allocations];

    if (allocEditingId) {
      updatedAllocs = updatedAllocs.map((a) =>
        a.id === allocEditingId ? { ...a, amount: amt } : a
      );
      toast.success("Allocation amount updated");
    } else {
      const isDuplicate = allocations.some(
        (a) => a.classLabel === selectedClass && a.componentId === allocCompId
      );
      if (isDuplicate) {
        toast.error("This fee component is already allocated to this class. Edit its amount instead.");
        return;
      }

      const newAlloc: FeeAllocation = {
        id: `FA-${Date.now().toString().slice(-4)}`,
        classLabel: selectedClass,
        componentId: allocCompId,
        amount: amt,
      };
      updatedAllocs.push(newAlloc);
      toast.success("Fee component allocated to class");
    }

    localStorage.setItem("fee_allocations", JSON.stringify(updatedAllocs));
    setAllocations(updatedAllocs);
    setIsAllocOpen(false);
  };

  const handleAllocDelete = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} allocation from ${selectedClass}?`)) {
      const updatedAllocs = allocations.filter((a) => a.id !== id);
      localStorage.setItem("fee_allocations", JSON.stringify(updatedAllocs));
      setAllocations(updatedAllocs);
      toast.success("Allocation removed");
    }
  };

  // Safe checks for allocations array
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  // Get active allocations table rows for the selected class
  const classRows = safeAllocations
    .filter((a) => a.classLabel === selectedClass)
    .map((a) => {
      const comp = components.find((c) => c.id === a.componentId);
      return {
        allocationId: a.id,
        componentId: a.componentId,
        name: comp ? comp.name : "Unknown Component",
        code: comp ? comp.code : "N/A",
        frequency: comp ? comp.frequency : "N/A",
        amount: a.amount || 0,
      };
    });

  const totalClassFees = classRows.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Back to Settings
        </span>
      </div>

      <PageHeader
        title="Fee Structure & Allocations"
        subtitle="Define global fee item categories and map them to grades/classes with custom amounts."
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("components")}
          className={`px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "components"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" /> Fee Components Library
        </button>
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "allocations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="h-4 w-4" /> Class Allocation Matrix
        </button>
      </div>

      {/* ----------------- VIEW 1: COMPONENTS LIBRARY ----------------- */}
      {activeTab === "components" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Define general components that represent bills. Once added, allocate them to grades with class-specific costs.
            </p>
            <button
              onClick={handleOpenAddComp}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Create Component
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((comp) => (
              <Card
                key={comp.id}
                className="p-5 border border-border flex flex-col justify-between hover:shadow-[var(--shadow-elegant)] transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">{comp.code}</span>
                      <h3 className="text-base font-bold tracking-tight">{comp.name}</h3>
                    </div>
                    <Badge tone="default">{comp.frequency}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground min-h-[32px] line-clamp-2">
                    {comp.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-muted pt-3 mt-4">
                  <button
                    onClick={() => handleOpenEditComp(comp)}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
                    title="Edit Component"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCompDelete(comp.id, comp.name)}
                    className="p-1.5 rounded hover:bg-destructive/15 text-destructive transition cursor-pointer"
                    title="Delete Component"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- VIEW 2: CLASS ALLOCATION MATRIX ----------------- */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-muted/40 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Class/Grade:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-2.5 text-xs font-bold outline-none focus:border-ring cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAllocations}
                disabled={saveAllocationsMutation.isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-green-600 hover:bg-green-700 px-4 text-xs font-semibold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {saveAllocationsMutation.isPending ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {saveAllocationsMutation.isPending ? "Submitting..." : "Submit Allocations"}
              </button>

              <button
                onClick={handleOpenAddAlloc}
                disabled={components.length === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Allocate Component
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Table Matrix list */}
            <Card className="p-6 lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                Allocated Fees for {selectedClass || "Selected Class"}
              </h3>

              {classRows.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground mb-2" />
                  <span>No fee components allocated to {selectedClass || "this class"}. Click "Allocate Component" to start mapping.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
                        <th className="py-2.5">Code</th>
                        <th className="py-2.5">Component Name</th>
                        <th className="py-2.5">Frequency</th>
                        <th className="py-2.5 text-right">Amount (₹)</th>
                        <th className="py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {classRows.map((row) => (
                        <tr key={row.allocationId} className="border-b border-muted hover:bg-muted/10 transition-colors">
                          <td className="py-3 font-mono font-bold text-muted-foreground">{row.code}</td>
                          <td className="py-3 font-semibold text-foreground">{row.name}</td>
                          <td className="py-3">{row.frequency}</td>
                          <td className="py-3 text-right font-bold text-primary">₹{(row.amount || 0).toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditAlloc({ id: row.allocationId, classLabel: selectedClass, componentId: row.componentId, amount: row.amount })}
                                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleAllocDelete(row.allocationId, row.name)}
                                className="p-1 rounded hover:bg-destructive/15 text-destructive transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Fees summary panel */}
            <div className="space-y-4">
              <Card className="p-5 bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <DollarSign className="h-5 w-5" />
                  <h4 className="font-bold text-sm">Class Structure Summary</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The amounts calculated here represent the base outstanding yearly/termly balances required from students enrolled in <strong>{selectedClass || "this class"}</strong>.
                </p>

                <div className="border-t border-primary/20 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">Total Fees Summary</span>
                  <span className="text-base font-bold text-primary">₹{(totalClassFees || 0).toLocaleString()}</span>
                </div>
              </Card>

              <div className="rounded-xl border border-border p-4 bg-card text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>To adjust general schedules, billing periods, or add late-fee category definitions, configure the Fee Components tab.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- DIALOG MODAL 1: FEE COMPONENT FORM ----------------- */}
      <Dialog open={isCompOpen} onOpenChange={setIsCompOpen}>
        <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {compEditingId ? "Edit Fee Component" : "Create Fee Component"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Add global items that can be assigned to different classrooms (e.g. Exam Fee, Lab Fee).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCompSubmit} className="space-y-4 py-2">
            {/* Component Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Component Name *
              </label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. Tuition Fee, Exam Fee"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Component Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Component Code *
              </label>
              <input
                type="text"
                required
                value={compCode}
                onChange={(e) => setCompCode(e.target.value)}
                placeholder="e.g. TUITION, EXAM"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="Enter a brief purpose or scope explanation..."
                className="h-16 w-full rounded-lg border border-input bg-card p-3 text-sm outline-none transition focus:border-ring resize-none"
              />
            </div>

            {/* Billing Frequency */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Billing Frequency *
              </label>
              <select
                value={compFreq}
                onChange={(e) => setCompFreq(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring cursor-pointer"
              >
                <option value="One-time">One-time</option>
                <option value="Monthly">Monthly</option>
                <option value="Termly">Termly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCompOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-card px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                {compEditingId ? "Save Changes" : "Create Component"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ----------------- DIALOG MODAL 2: CLASS ALLOCATION FORM ----------------- */}
      <Dialog open={isAllocOpen} onOpenChange={setIsAllocOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {allocEditingId ? "Edit Allocation Amount" : "Allocate Fee Component"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Map a fee component to <strong>{selectedClass || "Selected Class"}</strong> with a custom class-specific amount.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAllocSubmit} className="space-y-4 py-2">
            {/* Fee Component dropdown selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Select Fee Component *
              </label>
              {allocEditingId ? (
                <input
                  type="text"
                  readOnly
                  value={components.find((c) => c.id === allocCompId)?.name || ""}
                  className="h-10 w-full rounded-lg border border-input bg-muted px-3.5 text-sm outline-none cursor-not-allowed"
                />
              ) : (
                <select
                  value={allocCompId}
                  onChange={(e) => setAllocCompId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring cursor-pointer"
                >
                  {components.map((c) => {
                    const isAllocated = safeAllocations.some(
                      (a) => a.classLabel === selectedClass && a.componentId === c.id
                    );
                    return (
                      <option key={c.id} value={c.id} disabled={isAllocated}>
                        {c.name} ({c.code}){isAllocated ? " - Allocated" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value)}
                placeholder="e.g. 35000"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAllocOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-card px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                {allocEditingId ? "Save Amount" : "Allocate Component"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
