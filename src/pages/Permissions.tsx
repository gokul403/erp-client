import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save, RefreshCw, Key, Shield, ShieldCheck, Check, Info } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { toast } from "sonner";

interface RoleData {
  id: string;
  name: string;
  roleType: "System-defined" | "Custom";
  status: "Active" | "Inactive";
}

interface MenuItemPermission {
  id: string;
  label: string;
  description: string;
  category: "General" | "Academics" | "Administrative" | "Financials" | "Library" | "System Settings";
}

const SIDEBAR_MENUS: MenuItemPermission[] = [
  // General
  { id: "dashboard", label: "Dashboard", description: "Main landing panel displaying summary statistics, quick actions, and status trackers.", category: "General" },
  { id: "profile", label: "Profile", description: "Personal user account settings, profiles, security preferences, and calendar views.", category: "General" },
  { id: "notifications", label: "Notifications", description: "System alerts, messaging center, and in-app communications history.", category: "General" },
  
  // Academics
  { id: "classes", label: "Classes & Sections", description: "View list of classroom divisions, sections allocation, and teacher assignments.", category: "Academics" },
  { id: "timetable", label: "Timetable", description: "Configure class schedules, lecture hours, teacher rosters, and room allocations.", category: "Academics" },
  { id: "attendance", label: "Attendance", description: "Log daily/hourly student attendance, leave requests, and generate monthly reports.", category: "Academics" },
  { id: "assignments", label: "Assignments", description: "Publish homework tasks, evaluate student submissions, and post deadlines.", category: "Academics" },
  { id: "marks", label: "Marks Entry", description: "Log exam grades, grade scales, GPA mappings, and print progress sheets.", category: "Academics" },
  { id: "notices", label: "Announcements & Notices", description: "Broadcast institutional alerts, notifications, and events calendars.", category: "Academics" },
  
  // Administrative
  { id: "admissions", label: "Admissions", description: "Manage applicant registrations, multi-phase admission forms, and reviews.", category: "Administrative" },
  { id: "students", label: "Students Directory", description: "Access comprehensive student records, guardian logs, and academic histories.", category: "Administrative" },
  { id: "staff", label: "Staff Directory", description: "Log teacher profiles, payroll roles, department hierarchies, and system settings.", category: "Administrative" },
  { id: "departments", label: "Departments", description: "Configure the academic and administrative units of the institution.", category: "Administrative" },

  // Financials
  { id: "fees", label: "Fees", description: "Set fee structures, track invoice statuses, record payments, and download receipts.", category: "Financials" },
  { id: "fines", label: "Fines", description: "Track library penalties, late returns fees, and outstanding dues logs.", category: "Financials" },
  
  // Library
  { id: "library", label: "Book Catalog", description: "Manage academic textbooks repository, authors list, and items count.", category: "Library" },
  { id: "issue_books", label: "Issue / Return", description: "Log book borrowings, return schedules, and active checkouts logs.", category: "Library" },
  { id: "members", label: "Library Members", description: "Register students and staff card holders for library privileges.", category: "Library" },

  // System Settings
  { id: "schools", label: "Schools (Multi-tenant)", description: "Manage distinct school tenants, addresses, and overall subscription plans.", category: "System Settings" },
  { id: "subscriptions", label: "Subscriptions", description: "Configure active pricing plans, gateways, limits, and Billing logs.", category: "System Settings" },
  { id: "users", label: "Users & Roles", description: "Manage user account status, permissions overrides, and active log sessions.", category: "System Settings" },
  { id: "settings", label: "System Settings", description: "Access global preference variables, timezone limits, and configuration toggles.", category: "System Settings" },
];

// Seed default permissions maps (key is role ID, value is array of menu item IDs)
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  "ROLE-001": SIDEBAR_MENUS.map((m) => m.id), // Admin: All menus
  "ROLE-002": ["dashboard", "profile", "classes", "timetable", "attendance", "assignments", "marks", "notices", "notifications", "students"], // Teacher
  "ROLE-003": ["dashboard", "profile", "timetable", "attendance", "assignments", "marks", "fees", "library", "notifications"], // Student
  "ROLE-004": ["dashboard", "profile", "attendance", "fees", "notices", "notifications", "students"], // Parent
};

export function PermissionsPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionsMap, setPermissionsMap] = useState<Record<string, string[]>>({});
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Initial Load of Roles & Permissions
  useEffect(() => {
    // Load Roles
    const savedRoles = localStorage.getItem("system_roles");
    let currentRoles: RoleData[] = [];
    if (savedRoles) {
      try {
        currentRoles = JSON.parse(savedRoles);
      } catch (e) {}
    }
    
    // If no roles exist in local storage, fallback to mock defaults
    if (currentRoles.length === 0) {
      currentRoles = [
        { id: "ROLE-001", name: "Admin", roleType: "System-defined", status: "Active" },
        { id: "ROLE-002", name: "Teacher", roleType: "System-defined", status: "Active" },
        { id: "ROLE-003", name: "Student", roleType: "System-defined", status: "Active" },
        { id: "ROLE-004", name: "Parent", roleType: "System-defined", status: "Active" },
      ];
    }
    
    // Only display Active roles
    const activeRoles = currentRoles.filter((r) => r.status === "Active");
    setRoles(activeRoles);
    if (activeRoles.length > 0) {
      setSelectedRoleId(activeRoles[0].id);
    }

    // Load Permissions
    const savedPerms = localStorage.getItem("role_permissions");
    if (savedPerms) {
      try {
        const parsed = JSON.parse(savedPerms);
        setPermissionsMap(parsed);
        if (activeRoles.length > 0) {
          setActivePermissions(parsed[activeRoles[0].id] || []);
        }
      } catch (e) {}
    } else {
      localStorage.setItem("role_permissions", JSON.stringify(DEFAULT_PERMISSIONS));
      setPermissionsMap(DEFAULT_PERMISSIONS);
      if (activeRoles.length > 0) {
        setActivePermissions(DEFAULT_PERMISSIONS[activeRoles[0].id] || []);
      }
    }
  }, []);

  // Update checkbox state when selecting a different role
  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    setActivePermissions(permissionsMap[roleId] || []);
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (menuId: string) => {
    setActivePermissions((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  // Toggle whole category at once
  const handleToggleCategory = (category: string, enableAll: boolean) => {
    const categoryMenuIds = SIDEBAR_MENUS.filter((m) => m.category === category).map((m) => m.id);
    setActivePermissions((prev) => {
      if (enableAll) {
        // Add all category IDs that are not already present
        const filtered = prev.filter((id) => !categoryMenuIds.includes(id));
        return [...filtered, ...categoryMenuIds];
      } else {
        // Remove all category IDs
        return prev.filter((id) => !categoryMenuIds.includes(id));
      }
    });
  };

  // Handle Save
  const handleSave = () => {
    setIsSaving(true);
    
    const updatedMap = {
      ...permissionsMap,
      [selectedRoleId]: activePermissions,
    };

    setTimeout(() => {
      localStorage.setItem("role_permissions", JSON.stringify(updatedMap));
      setPermissionsMap(updatedMap);
      setIsSaving(false);
      toast.success("Navigation permission matrix updated successfully!");
    }, 600);
  };

  // Handle Revert
  const handleRevert = () => {
    if (window.confirm("Are you sure you want to revert changes?")) {
      setActivePermissions(permissionsMap[selectedRoleId] || []);
      toast.info("Permissions reverted to last saved state");
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  // Group menus by category
  const categories = ["General", "Academics", "Administrative", "Financials", "Library", "System Settings"] as const;

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
        title="Navigation & Menu Access Controls"
        subtitle="Manage access permissions maps. Select user roles to define which sidebar options are visible."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left column: Role Selector List */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
              <Shield className="h-4 w-4 text-primary" /> Active Roles List
            </h3>
            
            <div className="space-y-1.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition border flex flex-col gap-1 ${
                    selectedRoleId === role.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent hover:bg-accent/40 text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>{role.name}</span>
                    <Badge tone={role.roleType === "System-defined" ? "info" : "warning"}>
                      {role.roleType === "System-defined" ? "System" : "Custom"}
                    </Badge>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{role.id}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Tips Info Panel */}
          <div className="rounded-xl bg-muted/60 p-4 border border-border space-y-2.5">
            <div className="flex items-center gap-1 text-primary">
              <Info className="h-4.5 w-4.5" />
              <h4 className="font-bold text-xs">Permission Guidelines</h4>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Changes applied here will immediately take effect on the sidebar rendering maps. revoking a path limits routing visibility.
            </p>
          </div>
        </div>

        {/* Right column: Permissions matrix */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-1.5">
                  <Key className="h-5 w-5 text-primary" /> Menu Permissions — {selectedRole?.name || "..."}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Assign which sidebar navigation paths are visible for the <strong>{selectedRole?.name}</strong> group.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleRevert}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-card px-3 text-xs font-semibold hover:bg-accent transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Revert
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 text-xs font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {isSaving ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </div>

            {/* Checklist Category Groups */}
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryMenus = SIDEBAR_MENUS.filter((m) => m.category === category);
                const categoryEnabledIds = categoryMenus.filter((m) => activePermissions.includes(m.id));
                const allCategoryEnabled = categoryEnabledIds.length === categoryMenus.length;
                const someCategoryEnabled = categoryEnabledIds.length > 0 && !allCategoryEnabled;

                return (
                  <div key={category} className="space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg border border-border">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{category}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(category, true)}
                          className="text-[10px] font-bold text-primary hover:underline transition"
                        >
                          Select All
                        </button>
                        <span className="text-muted-foreground text-[10px]">|</span>
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(category, false)}
                          className="text-[10px] font-bold text-destructive hover:underline transition"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Permissions list */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {categoryMenus.map((menu) => {
                        const isChecked = activePermissions.includes(menu.id);
                        return (
                          <div
                            key={menu.id}
                            onClick={() => handleTogglePermission(menu.id)}
                            className={`flex items-start gap-3 rounded-lg border p-3.5 transition cursor-pointer select-none ${
                              isChecked
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-accent/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="h-4.5 w-4.5 rounded border-input text-primary focus:ring-ring shrink-0 mt-0.5 pointer-events-none"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block leading-none">{menu.label}</span>
                              <span className="text-[10px] text-muted-foreground mt-1.5 block leading-normal line-clamp-2">
                                {menu.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
