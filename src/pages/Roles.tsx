import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search, Shield, Check, Lock, Edit, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
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

interface RoleData {
  id: string; // Auto-generated ROLE-XXX
  name: string;
  description: string;
  roleType: "System-defined" | "Custom";
  status: "Active" | "Inactive";
  isDefault: boolean;
}

const DEFAULT_ROLES: RoleData[] = [
  {
    id: "ROLE-001",
    name: "Admin",
    description: "Full administrative access to all core modules, database settings, and system configurations.",
    roleType: "System-defined",
    status: "Active",
    isDefault: false,
  },
  {
    id: "ROLE-002",
    name: "Teacher",
    description: "Access to student lists, attendance logging, academic marks grading, and classroom schedules.",
    roleType: "System-defined",
    status: "Active",
    isDefault: false,
  },
  {
    id: "ROLE-003",
    name: "Student",
    description: "Standard portal access for personal profiles, homework assignments, marks sheets, and library books.",
    roleType: "System-defined",
    status: "Active",
    isDefault: true,
  },
  {
    id: "ROLE-004",
    name: "Parent",
    description: "Portal view access for tracking wards' progress, academic reports, attendance, and fee payments.",
    roleType: "System-defined",
    status: "Active",
    isDefault: false,
  },
];

export function RolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Form / Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState(""); // ROLE-00X
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [isDefault, setIsDefault] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("system_roles");
    if (saved) {
      try {
        setRoles(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading system roles", e);
      }
    } else {
      localStorage.setItem("system_roles", JSON.stringify(DEFAULT_ROLES));
      setRoles(DEFAULT_ROLES);
    }
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    // Auto-generate code e.g. ROLE-302
    const randomCode = `ROLE-${Math.floor(100 + Math.random() * 900)}`;
    setCode(randomCode);
    setDescription("");
    setStatus("Active");
    setIsDefault(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (role: RoleData) => {
    // System-defined roles are locked and cannot be edited
    if (role.roleType === "System-defined") {
      toast.warning("System-defined roles are protected and cannot be modified.");
      return;
    }
    setEditingId(role.id);
    setName(role.name);
    setCode(role.id);
    setDescription(role.description);
    setStatus(role.status);
    setIsDefault(role.isDefault);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role Name is required");
      return;
    }

    let updatedList = [...roles];

    // Business Logic: If marked as Default, clear other roles' default flag
    if (isDefault) {
      updatedList = updatedList.map((r) => ({ ...r, isDefault: false }));
    }

    if (editingId) {
      // Edit mode (Custom role)
      updatedList = updatedList.map((r) =>
        r.id === editingId
          ? { ...r, name: name.trim(), description: description.trim(), status, isDefault }
          : r
      );
      toast.success("Role configuration updated successfully!");
    } else {
      // Create mode (Always custom type)
      const newRole: RoleData = {
        id: code,
        name: name.trim(),
        description: description.trim(),
        roleType: "Custom",
        status,
        isDefault,
      };
      updatedList.push(newRole);
      toast.success("New user role created successfully!");
    }

    localStorage.setItem("system_roles", JSON.stringify(updatedList));
    setRoles(updatedList);
    setIsOpen(false);
  };

  const handleDelete = (id: string, roleName: string, roleType: string) => {
    if (roleType === "System-defined") {
      toast.error("Protected role! System defaults cannot be deleted.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete the user role ${roleName}?`)) {
      const updatedList = roles.filter((r) => r.id !== id);
      localStorage.setItem("system_roles", JSON.stringify(updatedList));
      setRoles(updatedList);
      toast.success(`Role ${roleName} deleted`);
    }
  };

  // Filter list
  const filteredRoles = roles.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || r.roleType === typeFilter;
    return matchesSearch && matchesType;
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
        title="User Roles & Access Control"
        subtitle="Manage user groups, define permissions levels, and set default login templates."
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Create New Role
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
            placeholder="Search by role name or description..."
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="System-defined">System-defined</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </Card>

      {/* Grid of Role Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <Card
            key={role.id}
            className={`overflow-hidden border p-5 flex flex-col justify-between transition relative ${
              role.isDefault ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:shadow-sm"
            }`}
          >
            <div className="space-y-4">
              {/* Header: ID, Type and Lock / Edit indicators */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">{role.id}</span>
                  <h3 className="text-lg font-bold tracking-tight mt-0.5 flex items-center gap-1.5">
                    {role.name}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={role.roleType === "System-defined" ? "info" : "warning"}>
                    {role.roleType}
                  </Badge>
                  {role.isDefault && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground min-h-[40px] line-clamp-3">
                {role.description || "No description provided."}
              </p>

              {/* Status */}
              <div className="flex items-center justify-between border-t border-muted pt-3">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                <Badge tone={statusTone(role.status)}>{role.status}</Badge>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-muted mt-4">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {role.roleType === "System-defined" ? (
                  <>
                    <Lock className="h-3 w-3 text-muted-foreground" /> Protected Default
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3 w-3 text-primary" /> Customizable
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {role.roleType === "System-defined" ? (
                  <button
                    disabled
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-muted-foreground/10 bg-muted/40 text-muted-foreground opacity-50 cursor-not-allowed"
                    title="System-defined roles cannot be edited"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-input bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
                    aria-label="Edit role"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                )}

                {role.roleType === "System-defined" ? (
                  <button
                    disabled
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-muted-foreground/10 bg-muted/40 text-muted-foreground opacity-50 cursor-not-allowed"
                    title="System-defined roles cannot be deleted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(role.id, role.name, role.roleType)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-destructive/20 bg-destructive/10 hover:bg-destructive hover:text-white text-destructive transition cursor-pointer"
                    aria-label="Delete role"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {editingId ? "Edit User Role" : "Create User Role"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Add custom roles like Admissions Officer, Class Teacher, or Accountant.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Role Code/ID */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Code / ID (Auto-generated)
              </label>
              <input
                type="text"
                readOnly
                value={code}
                className="h-10 w-full rounded-lg border border-input bg-muted px-3.5 text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* Role Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Admissions Officer"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the role's purpose, permission scope, or functional departments..."
                className="h-20 w-full rounded-lg border border-input bg-card p-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
              />
            </div>

            {/* Role Type (Locked to Custom) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Type
              </label>
              <input
                type="text"
                readOnly
                value="Custom"
                className="h-10 w-full rounded-lg border border-input bg-muted px-3.5 text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Is Default Option */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                Is this a default role for new users?
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
                {editingId ? "Save Changes" : "Create Role"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
