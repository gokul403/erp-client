import { useState } from "react";
import {
    Plus,
    FlaskConical,
    BookOpen,
    ShieldCheck,
    Palette,
    Terminal,
    Building,
    User,
    MoreVertical,
    AlertTriangle
} from "lucide-react";
import { PageHeader, Card, Pagination } from "@/components/erp/ui";
import { useDepartmentsQuery, useDeleteDepartmentMutation } from "@/hooks/use-api-data";
import { AddDepartmentDialog } from "../components/departments/AddDepartmentDialog";

// Map department names or codes to icons and colors
const getDeptStyling = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("science")) {
        return {
            icon: FlaskConical,
            bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15",
            desc: "Physical and life sciences, including laboratory management, research, and experimental learning."
        };
    }
    if (n.includes("humanities")) {
        return {
            icon: BookOpen,
            bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15",
            desc: "Literature, languages, history, philosophy, and social sciences focused on cultural and critical study."
        };
    }
    if (n.includes("admin")) {
        return {
            icon: ShieldCheck,
            bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
            desc: "Core institutional operations, human resources, facilities management, registry, and public relations."
        };
    }
    if (n.includes("art")) {
        return {
            icon: Palette,
            bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/15",
            desc: "Fine arts, digital media, music, theater, and performance studies with dedicated studio spaces."
        };
    }
    if (n.includes("tech") || n.includes("computer")) {
        return {
            icon: Terminal,
            bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/15",
            desc: "Computer science, software engineering, information systems, and core technological infrastructure."
        };
    }
    return {
        icon: Building,
        bg: "bg-primary/10 text-primary border-primary/15",
        desc: "Academic or support department focused on specialized subject areas and administrative service."
    };
};

export function DepartmentsPage() {
    const { data: departments = [], isLoading } = useDepartmentsQuery();
    const deleteDeptMutation = useDeleteDepartmentMutation();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTargetDept, setDeleteTargetDept] = useState<any | null>(null);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const handleDeleteClick = (dept: any) => {
        setDeleteTargetDept(dept);
    };

    const confirmDelete = async () => {
        if (!deleteTargetDept) return;
        try {
            await deleteDeptMutation.mutateAsync(deleteTargetDept.id);
            setDeleteTargetDept(null);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to delete department");
        }
    };

    const pageSize = 6;
    const items = [...departments, { isPlaceholder: true }];
    const totalEntries = items.length;
    const totalPages = Math.ceil(totalEntries / pageSize);
    const activePage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedItems = items.slice((activePage - 1) * pageSize, activePage * pageSize);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* Page Header */}
            <PageHeader
                title="Departments"
                subtitle="Configure and oversee the academic and administrative units of the institution. Manage heads of departments and staff allocations."
                actions={
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary-glow),0.2)] hover:opacity-95 cursor-pointer transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Create Department
                    </button>
                }
            />

            {/* Grid of Department Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedItems.map((item: any, idx: number) => {
                    if (item.isPlaceholder) {
                        return (
                            <div
                                key="placeholder"
                                onClick={() => setIsAddDialogOpen(true)}
                                className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] cursor-pointer transition-all group bg-card/20 hover:bg-card/40"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-muted-foreground group-hover:text-primary transition-all">
                                    New Department
                                </p>
                            </div>
                        );
                    }

                    const style = getDeptStyling(item.name);
                    const Icon = style.icon;

                    return (
                        <Card key={item.id} className="p-6 relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 flex flex-col justify-between border-border/60">

                            {/* Option Menu */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenId(menuOpenId === item.id ? null : item.id);
                                    }}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-all"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                                
                                {menuOpenId === item.id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setMenuOpenId(null)}
                                        />
                                        <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-xl border border-border/85 bg-card p-1 shadow-lg z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingDept(item);
                                                    setIsAddDialogOpen(true);
                                                    setMenuOpenId(null);
                                                }}
                                                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-foreground hover:bg-accent transition-all cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(item);
                                                    setMenuOpenId(null);
                                                }}
                                                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Header Icon */}
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.bg}`}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Info */}
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">{item.name}</h3>
                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                        {style.desc}
                                    </p>

                                    {/* Associated Classes & Sections */}
                                    {(() => {
                                        let classList: string[] = [];
                                        if (item.classes) {
                                            if (Array.isArray(item.classes)) {
                                                classList = item.classes;
                                            } else if (typeof item.classes === "string") {
                                                try {
                                                    classList = JSON.parse(item.classes);
                                                } catch (e) {}
                                            }
                                        }
                                        if (classList.length === 0) return null;
                                        return (
                                            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/20 pt-2.5">
                                                {classList.map((cls: string) => (
                                                    <span key={cls} className="inline-flex items-center rounded-lg bg-primary/5 px-2 py-0.5 text-[9px] font-bold text-primary border border-primary/10">
                                                        {cls}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                                {/* Head of Department */}
                                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-[140px]">
                                        {item.head_name || "No head assigned"}
                                    </span>
                                </div>

                                {/* Staff count badge */}
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                                    {item.staff_count ?? 0} Staff
                                </span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={activePage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalEntries={totalEntries}
                    pageSize={pageSize}
                />
            )}

            {/* Create/Edit Department Modal Dialog */}
            <AddDepartmentDialog
                isOpen={isAddDialogOpen}
                onClose={() => {
                    setIsAddDialogOpen(false);
                    setEditingDept(null);
                }}
                initialData={editingDept}
            />

            {/* Premium Confirmation Modal */}
            {deleteTargetDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="flex flex-col w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3.5 border-b border-border/40 pb-4 mb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/15">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Delete Department</h3>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Warning: Action is permanent</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Are you sure you want to delete the <span className="font-bold text-foreground">"{deleteTargetDept.name}"</span> department? This will unassign it from any staff members.
                        </p>

                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                onClick={() => setDeleteTargetDept(null)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteDeptMutation.isPending}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:shadow-[0_0_15px_rgba(var(--destructive-glow),0.3)] hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {deleteDeptMutation.isPending ? "Deleting..." : "Delete Department"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
