import React from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Download, 
  ExternalLink, 
  Check, 
  Archive, 
  Trash2, 
  Edit3, 
  ArrowLeft 
} from "lucide-react";
import { Card, Badge } from "@/components/erp/ui";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop";

interface EventDetailViewProps {
  event: any;
  onClose: () => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canPublish: boolean;
  isSchoolAdmin: boolean;
  isTeacher: boolean;
  currentUserId: string;
}

export function EventDetailView({
  event,
  onClose,
  onPublish,
  onArchive,
  onEdit,
  onDelete,
  canPublish,
  isSchoolAdmin,
  isTeacher,
  currentUserId
}: EventDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Back to List
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-border bg-card">
            {/* Banner Cover */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative bg-muted">
              <img 
                src={event.cover_image || DEFAULT_COVER} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge tone={event.category === "Events" ? "info" : event.category === "Announcements" ? "warning" : "success"}>
                  {event.category.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge tone={event.status === "Published" ? "success" : event.status === "Draft" ? "warning" : "default"}>
                  {event.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    By: {event.creator_name || "System"} ({event.creator_role || "Admin"})
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/45" />
                  <span>Academic Year: {event.academic_year}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/45" />
                  <span>Audience: {event.audience_type}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-bold text-foreground mb-2">Description</h3>
                <p className="text-xs text-muted-foreground/90 whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>

              {event.external_link && (
                <div className="pt-2">
                  <a 
                    href={event.external_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:opacity-90 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View External Link
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Controls */}
        <div className="space-y-6">
          {/* Calendar, Time, Venue */}
          <Card className="p-6 border border-border bg-card space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Activity Details</h3>
            
            <div className="space-y-3.5">
              <div className="flex gap-3">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Date Range</span>
                  <span className="text-xs font-semibold text-foreground">
                    {new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Time Schedule</span>
                  <span className="text-xs font-semibold text-foreground">
                    {event.start_time} – {event.end_time}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Venue / Location</span>
                  <span className="text-xs font-semibold text-foreground">
                    {event.venue || "Campus General / Online"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Attachments list */}
          {event.attachments && event.attachments.length > 0 && (
            <Card className="p-6 border border-border bg-card space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Attachments ({event.attachments.length})</h3>
              <div className="space-y-2">
                {event.attachments.map((a: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60 text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[150px]" title={a.name}>
                      {a.name}
                    </span>
                    <a 
                      href={a.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1 rounded-md text-primary hover:bg-primary/10 transition"
                      title="Open Link"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Controls Actions */}
          {(isSchoolAdmin || (isTeacher && event.created_by === currentUserId)) && (
            <Card className="p-6 border border-border bg-card space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Manage Event</h3>
              <div className="flex flex-col gap-2">
                {event.status === "Draft" && canPublish && (
                  <button
                    onClick={() => onPublish(event.id)}
                    className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 text-xs font-bold text-white hover:bg-green-700 transition cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Publish Event
                  </button>
                )}

                {event.status === "Published" && (
                  <button
                    onClick={() => onArchive(event.id)}
                    className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gray-500 px-4 text-xs font-bold text-white hover:bg-gray-600 transition cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive Event
                  </button>
                )}

                <button
                  onClick={() => onEdit(event.id)}
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent text-xs font-semibold transition cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Record
                </button>

                {(!isTeacher || event.status === "Draft") && (
                  <button
                    onClick={() => onDelete(event.id)}
                    className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Event
                  </button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
