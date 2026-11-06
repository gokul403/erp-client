import { useState, useEffect, useRef } from "react";
import { Plus, UsersRound, MoreVertical, Edit, Trash2, Mail, Phone, Calendar, ShieldAlert } from "lucide-react";
import { Badge, Card, PageHeader, Pagination, StatCard, TableToolbar, statusTone } from "@/components/erp/ui";
import { useStaffQuery, useDeleteStaffMutation } from "@/hooks/use-api-data";
import { AddStaffDialog } from "../components/staff/AddStaffDialog";

export function StaffPage() {
  const { data: staff = [], isLoading } = useStaffQuery();
  const deleteStaffMutation = useDeleteStaffMutation();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [deletingStaffMember, setDeletingStaffMember] = useState<any | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All status");
  const [sort, setSort] = useState("Sort: Newest");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // 6 cards per page is ideal for a responsive grid

  // 3-Dots Dropdown State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Calculate statistics (always based on full staff data)
  const teachingCount = staff.filter((s: any) => {
    const role = s.role?.toLowerCase() || "";
    return role.includes("teacher") || role.includes("faculty") || role.includes("professor") || role.includes("instructor");
  }).length;
  const adminCount = staff.filter((s: any) => {
    const dept = s.dept?.toLowerCase() || "";
    const role = s.role?.toLowerCase() || "";
    return dept.includes("admin") || dept.includes("finance") || role.includes("admin") || role.includes("principal") || role.includes("director");
  }).length;
  const inactiveCount = staff.filter((s: any) => s.status === "Inactive").length;

  // Filter & Search Logic
  const filteredStaff = staff.filter((s: any) => {
    const matchesSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase()) ||
      s.dept?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.toLowerCase().includes(search.toLowerCase()) ||
      s.id?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All status" || s.status === status;

    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedStaff = [...filteredStaff].sort((a: any, b: any) => {
    if (sort === "Sort: Newest") {
      return new Date(b.joined || 0).getTime() - new Date(a.joined || 0).getTime();
    }
    if (sort === "Sort: Oldest") {
      return new Date(a.joined || 0).getTime() - new Date(b.joined || 0).getTime();
    }
    if (sort === "Sort: A–Z") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  // Pagination Logic
  const totalEntries = sortedStaff.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const pagedStaff = sortedStaff.slice((activePage - 1) * pageSize, activePage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper to generate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper to generate dynamic, premium gradients based on department
  const getAvatarGradient = (dept: string) => {
    const d = dept?.toLowerCase() || "";
    if (d.includes("math") || d.includes("science") || d.includes("tech") || d.includes("computer")) {
      return "from-indigo-500 via-indigo-600 to-cyan-500 shadow-indigo-500/25 text-white";
    }
    if (d.includes("admin") || d.includes("direct") || d.includes("manage") || d.includes("finance")) {
      return "from-amber-500 via-rose-500 to-red-500 shadow-amber-500/25 text-white";
    }
    if (d.includes("english") || d.includes("humanities") || d.includes("art") || d.includes("lang")) {
      return "from-purple-500 via-pink-500 to-rose-400 shadow-purple-500/25 text-white";
    }
    if (d.includes("sport") || d.includes("phys") || d.includes("gym")) {
      return "from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/25 text-white";
    }
    return "from-blue-600 via-indigo-600 to-violet-500 shadow-blue-500/25 text-white";
  };

  // Execute staff deletion
  const executeDelete = async () => {
    if (!deletingStaffMember) return;
    try {
      await deleteStaffMutation.mutateAsync(deletingStaffMember.id);
      setDeletingStaffMember(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete staff member");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Staff Directory"
        subtitle="Manage faculty details, designations, credentials, and departmental status."
        actions={
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Staff Member
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Staff" value={staff.length.toString()} icon={UsersRound} tone="primary" />
        <StatCard label="Teaching & Faculty" value={teachingCount.toString()} icon={UsersRound} tone="info" />
        <StatCard label="Administration" value={adminCount.toString()} icon={UsersRound} tone="success" />
        <StatCard label="Inactive Staff" value={inactiveCount.toString()} icon={UsersRound} tone="warning" />
      </div>

      <Card className="overflow-hidden bg-card/45 border border-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <TableToolbar
          placeholder="Search staff by name, email, department or ID…"
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1); // Reset page on filter
          }}
          status={status}
          onStatusChange={(val) => {
            setStatus(val);
            setCurrentPage(1); // Reset page on filter
          }}
          statusOptions={["All status", "Active", "Inactive"]}
          sort={sort}
          onSortChange={(val) => {
            setSort(val);
            setCurrentPage(1); // Reset page on filter
          }}
        />

        <div className="p-6">
          {pagedStaff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pagedStaff.map((member: any) => (
                <div
                  key={member.id}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 group"
                >
                  {/* Visual Glow Effect for 2026 feel */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150" />

                  {/* Header Row: Avatar, Identity & Actions */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                      {/* Premium Initials Avatar */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-sm tracking-wider shadow-md ${getAvatarGradient(member.dept)}`}>
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {member.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-primary mt-0.5 uppercase tracking-wide truncate">
                          {member.role || "Staff"}{member.metadata?.designation ? ` • ${member.metadata.designation}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {member.dept || "No Department"}
                        </p>
                      </div>
                    </div>

                    {/* Action 3-dots Dropdown */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === member.id ? null : member.id);
                        }}
                        className={`rounded-lg p-1.5 text-muted-foreground hover:bg-accent/80 hover:text-foreground transition-all cursor-pointer ${activeMenuId === member.id ? "bg-accent text-foreground" : ""}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {activeMenuId === member.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-1.5 w-40 origin-top-right rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                        >
                          <button
                            onClick={() => {
                              setEditingStaff(member);
                              setIsAddDialogOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-foreground hover:bg-accent transition-all cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-primary" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              setDeletingStaffMember(member);
                              setActiveMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Staff
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-border/50" />

                  {/* Body Contact details */}
                  <div className="space-y-2.5 text-xs text-muted-foreground relative z-10">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="truncate text-foreground/80 font-medium">{member.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="text-foreground/80 font-medium">{member.phone || "No phone listed"}</span>
                    </div>
                    {member.joined && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="text-foreground/80 font-medium">
                          Joined: {new Date(member.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer details */}
                  <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between relative z-10">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {member.id}
                    </span>
                    <Badge tone={statusTone(member.status)}>{member.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center border border-dashed border-border/80 bg-background/30 rounded-2xl py-14 px-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-accent/30 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-base text-foreground">No staff members match</h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                We couldn't find any staff records matching your search queries or filter categories.
              </p>
              {(search || status !== "All status") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatus("All status");
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Responsive Pagination */}
        {totalEntries > 0 && (
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalEntries={totalEntries}
            pageSize={pageSize}
          />
        )}
      </Card>

      <AddStaffDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingStaff(null);
        }}
        initialData={editingStaff}
      />

      {/* 2026 style alert dialog for deletion */}
      {deletingStaffMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl border border-destructive/20 shadow-[0_20px_50px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Top Bar / Warning indicator */}
            <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4 bg-gradient-to-r from-destructive/15 to-destructive/5 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-sm border border-destructive/15">
                <Trash2 className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Confirm Deletion</h3>
                <p className="text-[10px] font-medium text-destructive/80 uppercase tracking-wider mt-0.5">Warning: Action irreversible</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <p className="text-xs text-foreground/80 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-foreground">{deletingStaffMember.name}</span> from the directory?
              </p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                This will permanently delete their staff record (ID: <span className="font-mono font-semibold text-foreground">{deletingStaffMember.id}</span>), including contact details, login access credentials, and payroll configurations.
              </p>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-end gap-3 border-t border-border/50 px-6 py-4 bg-accent/5">
              <button
                onClick={() => setDeletingStaffMember(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleteStaffMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleteStaffMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
