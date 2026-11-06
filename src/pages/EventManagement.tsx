import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle,
  Megaphone
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { toast } from "sonner";
import { useRole } from "../lib/role-context";
import { Route as EventsRoute } from "../routes/events";
import { 
  useEventsQuery, 
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useDeleteEventMutation, 
  usePublishEventMutation, 
  useArchiveEventMutation, 
  useClassesQuery, 
  useStaffQuery 
} from "@/hooks/use-api-data";

// Subcomponents
import { EventFilters } from "@/components/events/EventFilters";
import { EventDetailView } from "@/components/events/EventDetailView";
import { EventFormDialog } from "@/components/events/EventFormDialog";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop";

export function EventManagementPage() {
  const { user, role } = useRole();
  const isTeacher = role === "teacher";
  const isSchoolAdmin = role === "school_admin" || role === "super_admin" || role === "principal";

  const search = EventsRoute.useSearch() as { eventId?: string };

  // Check custom permission for teacher publishing
  const canTeacherPublish = user?.metadata?.canPublishEvents === true || user?.metadata?.canPublishEvents === "true";
  const canPublish = isSchoolAdmin || (isTeacher && canTeacherPublish);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  
  // Selected detail event view
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (search.eventId) {
      setSelectedEventId(search.eventId);
    }
  }, [search.eventId]);

  // Fetch lists
  const { data: classesList = [] } = useClassesQuery();
  const { data: staffList = [] } = useStaffQuery();

  // Query events with filters
  const eventsFilters = {
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    academic_year: academicYearFilter || undefined,
    grade: gradeFilter || undefined,
    class_id: classFilter || undefined,
    created_by: creatorFilter || undefined,
    start_date: startDateFilter || undefined,
    end_date: endDateFilter || undefined,
    search: searchFilter || undefined,
  };
  const { data: eventsList = [], isLoading } = useEventsQuery(eventsFilters);

  // Mutations
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const deleteMutation = useDeleteEventMutation();
  const publishMutation = usePublishEventMutation();
  const archiveMutation = useArchiveEventMutation();

  const handleOpenForm = (eventId: string | null = null) => {
    setEditingEventId(eventId);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (statusVal: "Draft" | "Published", payload: any) => {
    try {
      if (editingEventId) {
        await updateMutation.mutateAsync({ id: editingEventId, data: payload });
        toast.success(`Event updated as ${statusVal} successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Event created as ${statusVal} successfully!`);
      }
      setIsFormOpen(false);
      setSelectedEventId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Event deleted successfully");
        if (selectedEventId === id) setSelectedEventId(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete event");
      }
    }
  };

  const handlePublishEvent = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
      toast.success("Event published successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish event");
    }
  };

  const handleArchiveEvent = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success("Event archived successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to archive event");
    }
  };

  const selectedEvent = eventsList.find(e => e.id === selectedEventId);
  const editingEvent = eventsList.find(e => e.id === editingEventId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {selectedEvent ? (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onPublish={handlePublishEvent}
          onArchive={handleArchiveEvent}
          onEdit={(id) => handleOpenForm(id)}
          onDelete={handleDeleteEvent}
          canPublish={canPublish}
          isSchoolAdmin={isSchoolAdmin}
          isTeacher={isTeacher}
          currentUserId={user?.id || ""}
        />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="School Event Centre"
            subtitle="Centralized management of events, academic activities, and official school announcements."
            actions={
              <button
                onClick={() => handleOpenForm(null)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary-glow),0.15)] hover:opacity-95 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> Create Activity
              </button>
            }
          />

          <EventFilters
            category={categoryFilter} setCategory={setCategoryFilter}
            status={statusFilter} setStatus={setStatusFilter}
            academicYear={academicYearFilter} setAcademicYear={setAcademicYearFilter}
            grade={gradeFilter} setGrade={setGradeFilter}
            classId={classFilter} setClassId={setClassFilter}
            creator={creatorFilter} setCreator={setCreatorFilter}
            startDate={startDateFilter} setStartDate={setStartDateFilter}
            endDate={endDateFilter} setEndDate={setEndDateFilter}
            search={searchFilter} setSearch={setSearchFilter}
            viewMode={viewMode} setViewMode={setViewMode}
            classesList={classesList}
            staffList={staffList}
          />

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : eventsList.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 border border-border bg-card text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <span className="text-sm font-bold text-foreground">No records match criteria</span>
              <span className="text-xs text-muted-foreground mt-1">
                Try modifying your filters or create a new announcement.
              </span>
            </Card>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsList.map((e: any) => (
                <Card 
                  key={e.id}
                  className="border border-border bg-card shadow-sm flex flex-col justify-between hover:border-primary/30 transition duration-300 overflow-hidden"
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    <img 
                      src={e.cover_image || DEFAULT_COVER} 
                      alt={e.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge tone={e.category === "Events" ? "info" : e.category === "Announcements" ? "warning" : "success"}>
                        {e.category.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge tone={e.status === "Published" ? "success" : e.status === "Draft" ? "warning" : "default"}>
                        {e.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {e.academic_year} • {e.audience_type}
                      </span>
                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-1">
                        {e.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                        {e.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>
                          {new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>{e.start_time} - {e.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 truncate" />
                        <span className="truncate">{e.venue || "Campus General"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">
                      By: {e.creator_name || "System"}
                    </span>
                    <button
                      onClick={() => setSelectedEventId(e.id)}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/15 border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase select-none">
                      <th className="p-4 w-44">Category</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Date Range</th>
                      <th className="p-4">Venue</th>
                      <th className="p-4 w-28">Status</th>
                      <th className="p-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {eventsList.map((e: any) => (
                      <tr key={e.id} className="hover:bg-muted/5 transition">
                        <td className="p-4">
                          <Badge tone={e.category === "Events" ? "info" : e.category === "Announcements" ? "warning" : "success"}>
                            {e.category}
                          </Badge>
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          <div className="truncate max-w-sm" title={e.title}>{e.title}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-muted-foreground truncate max-w-[150px]">{e.venue || "Campus"}</td>
                        <td className="p-4">
                          <Badge tone={e.status === "Published" ? "success" : e.status === "Draft" ? "warning" : "default"}>
                            {e.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedEventId(e.id)}
                            className="text-primary font-bold hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      <EventFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        classesList={classesList}
        staffList={staffList}
        isTeacher={isTeacher}
        canTeacherPublish={canTeacherPublish}
      />
    </div>
  );
}
