import React, { useState, useEffect } from "react";
import { X, Plus, Paperclip } from "lucide-react";
import { toast } from "sonner";

const COVER_TEMPLATES = [
  { name: "General School", url: "https://unsplash.com/photos/notebook-pen-e-reader-on-rock-among-lavender-CHVkF0l7594" },
  { name: "Sports & Athletics", url: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=600&auto=format&fit=crop" },
  { name: "Science & Lab", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" },
  { name: "Art & Music", url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=600&auto=format&fit=crop" },
  { name: "Academic & Seminar", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop" }
];

interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: "Draft" | "Published", payload: any) => void;
  editingEvent: any;
  classesList: any[];
  staffList: any[];
  isTeacher: boolean;
  canTeacherPublish: boolean;
}

export function EventFormDialog({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  classesList,
  staffList,
  isTeacher,
  canTeacherPublish
}: EventFormDialogProps) {
  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Events" | "Announcements" | "Academic Activities">("Events");
  const [description, setDescription] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [audienceType, setAudienceType] = useState<"Entire School" | "Grade" | "Section">("Entire School");
  const [targetGrades, setTargetGrades] = useState<string[]>([]);
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [externalLink, setExternalLink] = useState("");
  
  // Attachments form
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<Array<{ file_name: string; file_url: string }>>([]);

  const uniqueGrades = Array.from(new Set(classesList.map((c: any) => c.grade).filter(Boolean)));

  // Load editing context
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setCategory(editingEvent.category);
      setDescription(editingEvent.description);
      setAcademicYear(editingEvent.academic_year);
      setAudienceType(editingEvent.audience_type);
      setStartDate(editingEvent.start_date ? editingEvent.start_date.split("T")[0] : "");
      setEndDate(editingEvent.end_date ? editingEvent.end_date.split("T")[0] : "");
      setStartTime(editingEvent.start_time);
      setEndTime(editingEvent.end_time);
      setVenue(editingEvent.venue || "");
      setCoverImage(editingEvent.cover_image || "");
      setExternalLink(editingEvent.external_link || "");
      setAttachments(editingEvent.attachments ? editingEvent.attachments.map((a: any) => ({ file_name: a.name, file_url: a.url })) : []);

      const audGrades = editingEvent.audience ? editingEvent.audience.map((a: any) => a.grade).filter(Boolean) : [];
      const audClasses = editingEvent.audience ? editingEvent.audience.map((a: any) => a.class_id).filter(Boolean) : [];
      setTargetGrades(audGrades);
      setTargetClassIds(audClasses);
    } else {
      setTitle("");
      setCategory("Events");
      setDescription("");
      setAcademicYear("2026-2027");
      setAudienceType("Entire School");
      setTargetGrades([]);
      setTargetClassIds([]);
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setVenue("");
      setCoverImage(COVER_TEMPLATES[0].url);
      setExternalLink("");
      setAttachments([]);
    }
  }, [editingEvent, isOpen]);

  const handleAddAttachment = () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) {
      toast.error("Please fill in name and URL for the attachment");
      return;
    }
    setAttachments([...attachments, { file_name: attachmentName.trim(), file_url: attachmentUrl.trim() }]);
    setAttachmentName("");
    setAttachmentUrl("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSave = (statusVal: "Draft" | "Published") => {
    if (!title.trim() || !description.trim() || !startDate || !endDate || !startTime || !endTime) {
      toast.error("Please fill in all required fields (Title, Description, Dates, Times)");
      return;
    }

    if (audienceType === "Grade" && targetGrades.length === 0) {
      toast.error("Please target at least one grade");
      return;
    }

    if (audienceType === "Section" && targetClassIds.length === 0) {
      toast.error("Please target at least one class section");
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      academic_year: academicYear,
      audience_type: audienceType,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      venue: venue.trim(),
      cover_image: coverImage || null,
      external_link: externalLink.trim() || null,
      status: statusVal,
      target_grades: audienceType === "Grade" ? targetGrades : [],
      target_class_ids: audienceType === "Section" ? targetClassIds : [],
      attachments
    };

    onSave(statusVal, payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="h-full w-full max-w-[500px] border-l border-border bg-card shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {editingEvent ? "Edit Activity Record" : "Create New Activity"}
            </h3>
            <span className="text-xs text-muted-foreground">
              Fill in targeting, schedules, and attachments.
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="Events">Events</option>
              <option value="Announcements">Announcements</option>
              <option value="Academic Activities">Academic Activities</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Fair 2026, Annual Sports Day"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description..."
              className="w-full rounded-lg border border-input bg-card p-3 text-xs outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Academic Year */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            {/* Audience Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Audience Scope</label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
              >
                <option value="Entire School">Entire School</option>
                <option value="Grade">Specific Grades</option>
                <option value="Section">Specific Class Sections</option>
              </select>
            </div>
          </div>

          {/* Targeting checklists */}
          {audienceType === "Grade" && (
            <div className="space-y-1.5 border border-border p-3.5 rounded-lg bg-muted/10">
              <label className="text-[11px] font-bold text-foreground">Target Grades</label>
              <div className="grid grid-cols-2 gap-2">
                {uniqueGrades.map(g => (
                  <div key={g} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`form-grade-${g}`}
                      checked={targetGrades.includes(g)}
                      onChange={(e) => {
                        if (e.target.checked) setTargetGrades([...targetGrades, g]);
                        else setTargetGrades(targetGrades.filter(x => x !== g));
                      }}
                      className="h-4 w-4 rounded border-gray-350 text-primary cursor-pointer"
                    />
                    <label htmlFor={`form-grade-${g}`} className="text-xs text-foreground cursor-pointer select-none">{g}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audienceType === "Section" && (
            <div className="space-y-1.5 border border-border p-3.5 rounded-lg bg-muted/10">
              <label className="text-[11px] font-bold text-foreground">Target Class Sections</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {classesList.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`form-class-${c.id}`}
                      checked={targetClassIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setTargetClassIds([...targetClassIds, c.id]);
                        else setTargetClassIds(targetClassIds.filter(x => x !== c.id));
                      }}
                      className="h-4 w-4 rounded border-gray-350 text-primary cursor-pointer"
                    />
                    <label htmlFor={`form-class-${c.id}`} className="text-xs text-foreground cursor-pointer select-none">
                      {c.grade} - {c.section}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates & Times */}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Time *</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Time *</label>
              <input
                type="text"
                placeholder="e.g. 04:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Venue / Location</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium, Seminar Hall B, Zoom"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          {/* Cover image template selection */}
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cover Banner Image</label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pr-1">
              {COVER_TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(t.url)}
                  className={`h-12 w-20 rounded border flex-shrink-0 overflow-hidden relative ${coverImage === t.url ? "ring-2 ring-primary border-primary" : "border-border"}`}
                >
                  <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 text-[7px] bg-black/75 text-white truncate text-center py-0.5">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or enter custom image url address..."
              className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          {/* External link */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">External Information Link (optional)</label>
            <input
              type="text"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="e.g. https://forms.google.com/registration"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          {/* Attachments Section */}
          <div className="border-t border-border pt-4 space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event Attachments</label>
            
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((a, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/80 text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[240px] flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> {a.file_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-[10px] text-destructive font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 border border-dashed border-border/80 p-3 rounded-lg bg-muted/5">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Attachment Name (e.g. Brochure)"
                className="h-8 rounded-lg border border-input bg-card px-2.5 text-[10px] outline-none"
              />
              <input
                type="text"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="Attachment File Link (URL)"
                className="h-8 rounded-lg border border-input bg-card px-2.5 text-[10px] outline-none"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="col-span-2 h-8 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 text-[10px] font-bold cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Append Attachment
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/20 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className="px-4 py-2.5 text-xs font-bold rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("Published")}
            disabled={isTeacher && !canTeacherPublish}
            className="px-4 py-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            title={isTeacher && !canTeacherPublish ? "Teachers need permission to publish directly. Save as Draft." : ""}
          >
            Publish Now
          </button>
        </div>

      </div>
    </div>
  );
}
