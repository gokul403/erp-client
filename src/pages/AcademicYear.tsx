import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search, Calendar, Check, Edit, Trash2, CalendarDays } from "lucide-react";
import { Card, PageHeader, Badge, statusTone } from "@/components/erp/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AcademicYearData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Archived" | "Upcoming";
  isCurrent: boolean;
}

const DEFAULT_YEARS: AcademicYearData[] = [
  {
    id: "AY-01",
    name: "2025-26",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    status: "Active",
    isCurrent: true,
  },
  {
    id: "AY-02",
    name: "2024-25",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    status: "Archived",
    isCurrent: false,
  },
  {
    id: "AY-03",
    name: "2026-27",
    startDate: "2026-06-01",
    endDate: "2027-05-31",
    status: "Upcoming",
    isCurrent: false,
  },
];

export function AcademicYearPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYearData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form / Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"Draft" | "Active" | "Archived" | "Upcoming">("Draft");
  const [isCurrent, setIsCurrent] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("academic_years");
    if (saved) {
      try {
        setAcademicYears(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading academic years", e);
      }
    } else {
      localStorage.setItem("academic_years", JSON.stringify(DEFAULT_YEARS));
      setAcademicYears(DEFAULT_YEARS);
    }
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setStartDate("");
    setEndDate("");
    setStatus("Draft");
    setIsCurrent(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (ay: AcademicYearData) => {
    setEditingId(ay.id);
    setName(ay.name);
    setStartDate(ay.startDate);
    setEndDate(ay.endDate);
    setStatus(ay.status);
    setIsCurrent(ay.isCurrent);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Academic Year Name is required");
      return;
    }
    // Simple validation pattern checking e.g., 2025-26
    if (!/^\d{4}-\d{2}$/.test(name.trim())) {
      toast.error("Please enter Name in YYYY-YY format (e.g. 2025-26)");
      return;
    }
    if (!startDate) {
      toast.error("Start Date is required");
      return;
    }
    if (!endDate) {
      toast.error("End Date is required");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Start Date must be before End Date");
      return;
    }

    let updatedList = [...academicYears];

    // If marked as Current, unmark all other academic years
    if (isCurrent) {
      updatedList = updatedList.map((ay) => ({ ...ay, isCurrent: false }));
    }

    if (editingId) {
      // Edit mode
      updatedList = updatedList.map((ay) =>
        ay.id === editingId
          ? { ...ay, name: name.trim(), startDate, endDate, status, isCurrent }
          : ay
      );
      toast.success("Academic year updated successfully!");
    } else {
      // Create mode
      const newAy: AcademicYearData = {
        id: `AY-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        startDate,
        endDate,
        status,
        isCurrent,
      };
      updatedList.push(newAy);
      toast.success("Academic year created successfully!");
    }

    localStorage.setItem("academic_years", JSON.stringify(updatedList));
    setAcademicYears(updatedList);
    setIsOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the academic year ${name}?`)) {
      const updatedList = academicYears.filter((ay) => ay.id !== id);
      localStorage.setItem("academic_years", JSON.stringify(updatedList));
      setAcademicYears(updatedList);
      toast.success(`Academic year ${name} deleted`);
    }
  };

  // Filter list
  const filteredYears = academicYears.filter((ay) => {
    const matchesSearch = ay.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || ay.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        title="Academic Calendar Years"
        subtitle="Manage institute sessions, terms, active years, and historical records."
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Academic Year
          </button>
        }
      />

      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between border border-border">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name (e.g. 2025-26)..."
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Grid List of Academic Years */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredYears.map((ay) => (
          <Card
            key={ay.id}
            className={`overflow-hidden border p-5 flex flex-col justify-between transition relative ${
              ay.isCurrent ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:shadow-sm"
            }`}
          >
            {ay.isCurrent && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                <Check className="h-2.5 w-2.5" /> Current
              </span>
            )}

            <div className="space-y-4">
              {/* Year Name */}
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">{ay.id}</span>
                <h3 className="text-xl font-bold tracking-tight mt-0.5">{ay.name}</h3>
              </div>

              {/* Date Ranges */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-muted">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Start Date: {new Date(ay.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>End Date: {new Date(ay.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-2">
                <Badge tone={statusTone(ay.status)}>{ay.status}</Badge>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2 pt-5 border-t border-muted mt-5">
              <button
                onClick={() => handleOpenEdit(ay)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-input bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
                aria-label="Edit academic year"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(ay.id, ay.name)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-destructive/20 bg-destructive/10 hover:bg-destructive hover:text-white text-destructive transition cursor-pointer"
                aria-label="Delete academic year"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {editingId ? "Edit Academic Year" : "Create Academic Year"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Add a new session name, dates, status state, and current properties.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Year Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Academic Year Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2025-26"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <p className="text-[10px] text-muted-foreground">Format must be YYYY-YY (e.g. 2025-26)</p>
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                />
              </div>
            </div>

            {/* Status Option */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Is Current Year Option */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <label htmlFor="isCurrent" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                Is Current Academic Year?
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-card px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                {editingId ? "Save Changes" : "Create Session"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
