import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useAddDepartmentMutation, useUpdateDepartmentMutation, useStaffQuery } from "@/hooks/use-api-data";

interface AddDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

const CATEGORIES = [
  "Academic",
  "Administrative",
  "Support",
  "Finance",
  "Athletics",
  "Library"
];

export function AddDepartmentDialog({ isOpen, onClose, initialData }: AddDepartmentDialogProps) {
  const { data: staffList = [] } = useStaffQuery();
  const addDepartmentMutation = useAddDepartmentMutation();
  const updateDepartmentMutation = useUpdateDepartmentMutation();

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    head_id: string;
    category: string;
    status: string;
    classes: string[];
  }>({
    name: "",
    code: "",
    head_id: "",
    category: "",
    status: "Active",
    classes: []
  });

  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [isClassesDropdownOpen, setIsClassesDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("school_classes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAvailableClasses(parsed);
            return;
          }
        } catch (e) {}
      }
      // Fallback
      setAvailableClasses([
        { id: "CL-01", grade: "Grade 10", section: "A", code: "G10-A" },
        { id: "CL-02", grade: "Grade 9", section: "B", code: "G9-B" },
        { id: "CL-03", grade: "Grade 11", section: "A", code: "G11-A" },
        { id: "CL-04", grade: "Class 5", section: "C", code: "C5-C" }
      ]);
    }
  }, [isOpen]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          head_id: initialData.head_id || "",
          category: initialData.category || "",
          status: initialData.status || "Active",
          classes: Array.isArray(initialData.classes) ? initialData.classes : []
        });
      } else {
        setFormData({
          name: "",
          code: "",
          head_id: "",
          category: "",
          status: "Active",
          classes: []
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Department name is required";
    if (!formData.code.trim()) nextErrors.code = "Department code/ID is required";
    if (!formData.category) nextErrors.category = "Category is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        head_id: formData.head_id || null,
        category: formData.category,
        status: formData.status,
        classes: formData.classes
      };

      if (initialData && initialData.id) {
        await updateDepartmentMutation.mutateAsync({
          id: initialData.id,
          data: payload
        });
      } else {
        await addDepartmentMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save department");
    }
  };

  const isPending = addDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl bg-card/95 backdrop-blur-xl rounded-2xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-gradient-to-r from-accent/20 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">Settings / Departments</p>
              <h2 className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                {initialData ? "Edit Department" : "Create New Department"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">

            {/* Department Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Mathematics and Statistics"
                className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.name
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border/60 focus:border-primary focus:ring-primary/20"
                  }`}
              />
              {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name}</p>}
            </div>

            {/* Department Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department Code/ID *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. MATH-402"
                className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.code
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border/60 focus:border-primary focus:ring-primary/20"
                  }`}
              />
              {errors.code && <p className="text-[10px] text-destructive font-medium">{errors.code}</p>}
            </div>

            {/* Department Head */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department Head</label>
              <select
                value={formData.head_id}
                onChange={(e) => setFormData(prev => ({ ...prev, head_id: e.target.value }))}
                className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">None / No Head (Optional)</option>
                {staffList.map((staff: any) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role || "Staff"})
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-muted-foreground mt-1">Select a department head from the active staff.</p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.category
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border/60 focus:border-primary focus:ring-primary/20"
                  }`}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-[10px] text-destructive font-medium">{errors.category}</p>}
            </div>

            {/* Classes & Sections Dropdown */}
            <div className="space-y-1.5 relative sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Classes & Sections</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsClassesDropdownOpen(!isClassesDropdownOpen)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs text-left outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">
                    {formData.classes.length === 0
                      ? "Select Classes & Sections"
                      : formData.classes.join(", ")}
                  </span>
                  <span className="text-muted-foreground ml-2 shrink-0">▼</span>
                </button>

                {isClassesDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsClassesDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-full rounded-xl border border-border/80 bg-card p-2 shadow-xl z-40 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
                      {availableClasses.map((cls) => {
                        const label = `${cls.grade} - ${cls.section}`;
                        const isSelected = formData.classes.includes(label);
                        return (
                          <label
                            key={cls.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent text-xs font-semibold text-foreground cursor-pointer transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setFormData(prev => {
                                  const nextClasses = prev.classes.includes(label)
                                    ? prev.classes.filter(c => c !== label)
                                    : [...prev.classes, label];
                                  return { ...prev, classes: nextClasses };
                                });
                              }}
                              className="rounded border-border/60 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                      {availableClasses.length === 0 && (
                        <p className="text-[10px] text-muted-foreground p-2">No classes available.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">Select one or more classes and sections belonging to this department.</p>
            </div>
          </div>

          {/* Initial Status toggle */}
          <div className="border border-border/60 rounded-xl p-4 bg-background/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">INITIAL STATUS</p>
              <p className={`text-xs font-semibold mt-0.5 ${formData.status === "Active" ? "text-primary" : "text-muted-foreground"}`}>
                {formData.status}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: prev.status === "Active" ? "Inactive" : "Active" }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.status === "Active" ? "bg-primary" : "bg-border"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${formData.status === "Active" ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border/50 bg-gradient-to-r from-accent/5 to-accent/20">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary-glow),0.3)] hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isPending ? "SAVING..." : initialData ? "UPDATE DEPARTMENT →" : "CREATE DEPARTMENT →"}
          </button>
        </div>
      </div>
    </div>
  );
}
