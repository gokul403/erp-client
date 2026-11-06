import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Upload, Trash2, AlertCircle, Plus, Edit3, Globe, Mail, Phone as PhoneIcon, Building } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { toast } from "sonner";
import {
  useOrganizationsQuery,
  useAddOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from "@/hooks/use-api-data";

interface OrganizationData {
  id?: string;
  name: string;
  shortName: string;
  orgType: string;
  orgCode: string;
  primaryEmail: string;
  phoneNumber: string;
  websiteUrl: string;
  logoUrl: string;
  iconUrl: string;
  academicYear?: string;
  curriculum?: string;
}

const DEFAULT_PROFILE: OrganizationData = {
  name: "Greenfield International School",
  shortName: "GIS",
  orgType: "School",
  orgCode: "GIS-2026-001",
  primaryEmail: "admin@greenfield.edu",
  phoneNumber: "+91 98765 43210",
  websiteUrl: "https://www.greenfield.edu",
  logoUrl: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/087cd519-a935-48a3-b585-06c4aab9b5d4/id-preview-32a584c6--3ded0584-63b1-45d8-a245-e6a80d597949.lovable.app-1782816054166.png",
  iconUrl: "",
  academicYear: "2025-26",
  curriculum: "CBSE",
};

const EMPTY_FORM: OrganizationData = {
  name: "",
  shortName: "",
  orgType: "School",
  orgCode: "",
  primaryEmail: "",
  phoneNumber: "",
  websiteUrl: "",
  logoUrl: "",
  iconUrl: "",
  academicYear: "2025-26",
  curriculum: "CBSE",
};

export function OrganizationPage() {
  // 1. Navigation & Toggle State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 2. Organization List State
  const { data: orgList = [], isLoading: isFetching } = useOrganizationsQuery();
  const addMutation = useAddOrganizationMutation();
  const updateMutation = useUpdateOrganizationMutation();
  const deleteMutation = useDeleteOrganizationMutation();
  
  // 3. Form fields State
  const [formData, setFormData] = useState<OrganizationData>(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [iconPreview, setIconPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormData(EMPTY_FORM);
    setLogoPreview("");
    setIconPreview("");
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (id: string) => {
    const item = orgList.find((org) => org.id === id);
    if (!item) return;
    setFormData(item);
    setLogoPreview(item.logoUrl || "");
    setIconPreview(item.iconUrl || "");
    setErrors({});
    setEditingId(id);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "logoUrl" | "iconUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (fieldName === "logoUrl") {
      setLogoPreview(objectUrl);
      setFormData((prev) => ({ ...prev, logoUrl: objectUrl }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.logoUrl;
        return copy;
      });
    } else {
      setIconPreview(objectUrl);
      setFormData((prev) => ({ ...prev, iconUrl: objectUrl }));
    }
    toast.success(`${fieldName === "logoUrl" ? "Logo" : "Icon"} attached successfully`);
  };

  const handleRemoveImage = (fieldName: "logoUrl" | "iconUrl") => {
    if (fieldName === "logoUrl") {
      setLogoPreview("");
      setFormData((prev) => ({ ...prev, logoUrl: "" }));
    } else {
      setIconPreview("");
      setFormData((prev) => ({ ...prev, iconUrl: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Mandatory validations
    if (!formData.name.trim()) {
      newErrors.name = "Organization Name is required";
    }
    if (!formData.shortName.trim()) {
      newErrors.shortName = "Short Name is required";
    }
    if (!formData.logoUrl && !logoPreview) {
      newErrors.logoUrl = "Organization Logo is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId !== null) {
        // Edit Mode
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        toast.success("Organization profile updated successfully!");
      } else {
        // Add Mode
        await addMutation.mutateAsync(formData);
        toast.success("New organization profile created successfully!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save organization profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = orgList.find((org) => org.id === id);
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Organization profile deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete organization profile");
      }
    }
  };

  if (isFetching && !showForm) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!showForm) {
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
          title="Organization Profiles"
          subtitle="Configure multiple institutional setups, branches, and custom naming codes."
          actions={
            <button
              onClick={handleOpenAdd}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Organization
            </button>
          }
        />

        {orgList.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center border border-dashed border-border bg-muted/10">
            <Building className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-bold">No Organizations Profiled</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Get started by adding your institution's profile branch parameters.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add First Organization
            </button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orgList.map((org, index) => (
              <Card
                key={org.id || index}
                onClick={() => handleOpenEdit(org.id || "")}
                className="overflow-hidden hover:shadow-[var(--shadow-elegant)] border border-border cursor-pointer transition flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header (Logo and Badges) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-14 w-14 shrink-0 rounded-lg border border-border bg-white p-1.5 flex items-center justify-center">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Building className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge tone="default">{org.shortName}</Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{org.orgType}</span>
                    </div>
                  </div>

                  {/* Organization Naming */}
                  <div>
                    <h3 className="font-bold text-base leading-snug line-clamp-1">{org.name}</h3>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">Code: {org.orgCode || "—"}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge tone="info">{org.curriculum || "CBSE"}</Badge>
                      <Badge tone="muted">AY: {org.academicYear || "2025-26"}</Badge>
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="space-y-2 pt-2 text-xs text-muted-foreground border-t border-muted">
                    {org.primaryEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{org.primaryEmail}</span>
                      </div>
                    )}
                    {org.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{org.phoneNumber}</span>
                      </div>
                    )}
                    {org.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{org.websiteUrl.replace(/https?:\/\/(www\.)?/, "")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-muted/40 px-5 py-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Configure
                  </span>
                  
                  <button
                    onClick={(e) => handleDelete(org.id || "", e)}
                    className="rounded p-1 hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition"
                    aria-label="Delete profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. Form Mode Rendering
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Back to List
        </span>
      </div>

      <PageHeader
        title={editingId !== null ? "Edit Organization Profile" : "Add Organization Profile"}
        subtitle="Manage details, naming conventions, branding, and contact information for your institution."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Institutional Identification
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Organization Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Greenfield International School"
                  className={`h-10 w-full rounded-md border bg-card px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring ${
                    errors.name ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.name && <p className="text-[11px] text-destructive font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Short Name / Abbreviation <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  placeholder="e.g. GIS"
                  className={`h-10 w-full rounded-md border bg-card px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring ${
                    errors.shortName ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.shortName && <p className="text-[11px] text-destructive font-medium">{errors.shortName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Organization Type</label>
                <select
                  name="orgType"
                  value={formData.orgType}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring cursor-pointer"
                >
                  <option>School</option>
                  <option>College</option>
                  <option>University</option>
                  <option>Training Center</option>
                  <option>Preschool</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Organization Code</label>
                <input
                  type="text"
                  name="orgCode"
                  value={formData.orgCode}
                  onChange={handleChange}
                  placeholder="e.g. SCH-001"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Primary Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://example.edu"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Academic Year</label>
                <select
                  name="academicYear"
                  value={formData.academicYear || "2025-26"}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring cursor-pointer"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Curriculum</label>
                <select
                  name="curriculum"
                  value={formData.curriculum || "CBSE"}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring cursor-pointer"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="IGCSE">IGCSE</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
              Contact & Communication
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Primary Email Address</label>
                <input
                  type="email"
                  name="primaryEmail"
                  value={formData.primaryEmail}
                  onChange={handleChange}
                  placeholder="admin@school.edu"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Institutional Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +91 99999 88888"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Logo & Branding Uploads */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
              Branding Assets
            </h3>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Organization Logo <span className="text-destructive">*</span>
              </label>
              
              {logoPreview ? (
                <div className="relative border border-border rounded-xl p-3 bg-muted/30 flex flex-col items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Organization Logo"
                    className="max-h-24 object-contain rounded-md"
                  />
                  <div className="flex gap-2 w-full justify-center">
                    <label className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-card px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition">
                      <Upload className="h-3 w-3" /> Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logoUrl")}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("logoUrl")}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2.5 text-[11px] font-semibold text-destructive hover:bg-destructive hover:text-white transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-xl p-6 bg-muted/10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/20 transition ${
                  errors.logoUrl ? "border-destructive bg-destructive/5" : "border-border"
                }`}>
                  <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-semibold">Upload Logo</span>
                    <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logoUrl")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {errors.logoUrl && (
                <div className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.logoUrl}</span>
                </div>
              )}
            </div>

            {/* Icon Upload */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Organization Icon (Square)
              </label>
              
              {iconPreview ? (
                <div className="relative border border-border rounded-xl p-3 bg-muted/30 flex flex-col items-center gap-3">
                  <img
                    src={iconPreview}
                    alt="Organization Icon"
                    className="h-12 w-12 object-contain rounded-md"
                  />
                  <div className="flex gap-2 w-full justify-center">
                    <label className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-card px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition">
                      <Upload className="h-3 w-3" /> Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "iconUrl")}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("iconUrl")}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2.5 text-[11px] font-semibold text-destructive hover:bg-destructive hover:text-white transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/20 transition">
                  <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-semibold">Upload Icon</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Square size, e.g. 128x128</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "iconUrl")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full h-11 border border-input bg-card text-foreground font-semibold rounded-lg hover:bg-accent transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
