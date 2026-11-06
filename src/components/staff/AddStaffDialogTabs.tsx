import { type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { useDepartmentsQuery } from "@/hooks/use-api-data";

export interface TabFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

function SectionHeader({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 pb-3 mb-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function PersonalInfoTab({ formData, onChange, errors = {} }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Personal Information"
        description="Provide basic identity details for the staff record."
        icon={<span className="text-sm font-bold">1</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={e => onChange("fullName", e.target.value)}
            placeholder="e.g. Robert Wilson"
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.fullName
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.fullName && <p className="text-[10px] text-destructive font-medium">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Gender *</label>
          <select
            value={formData.gender}
            onChange={e => onChange("gender", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</label>
          <input
            type="date"
            value={formData.dob}
            onChange={e => onChange("dob", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Blood Group</label>
          <select
            value={formData.bloodGroup}
            onChange={e => onChange("bloodGroup", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {/* <div className="sm:col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Profile Photo URL</label>
          <input
            type="text"
            value={formData.profilePhoto}
            onChange={e => onChange("profilePhoto", e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div> */}
      </div>
    </div>
  );
}

export function ContactInfoTab({ formData, onChange, errors = {} }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Contact & Location"
        description="Verify contact numbers, email IDs, and addresses."
        icon={<span className="text-sm font-bold">2</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => onChange("email", e.target.value)}
            placeholder="e.g. robert.wilson@edusync.io"
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.email
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.email && <p className="text-[10px] text-destructive font-medium">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</label>
          <input
            type="text"
            value={formData.phone}
            onChange={e => onChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.phone
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.phone && <p className="text-[10px] text-destructive font-medium">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Alternate Phone</label>
          <input
            type="text"
            value={formData.altPhone}
            onChange={e => onChange("altPhone", e.target.value)}
            placeholder="Emergency contact number"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Home Address *</label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={e => onChange("address", e.target.value)}
            placeholder="Enter complete residential address"
            className="w-full rounded-xl border border-border/60 bg-background/50 p-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function EmploymentTab({ formData, onChange, errors = {} }: TabFormProps) {
  const { data: departments = [] } = useDepartmentsQuery();

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Employment Status"
        description="Enter staff roles, codes, and organization hierarchy."
        icon={<span className="text-sm font-bold">3</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Staff ID *</label>
          <input
            type="text"
            value={formData.staffId}
            onChange={e => onChange("staffId", e.target.value)}
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.staffId
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.staffId && <p className="text-[10px] text-destructive font-medium">{errors.staffId}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role *</label>
          <input
            type="text"
            value={formData.role}
            onChange={e => onChange("role", e.target.value)}
            placeholder="e.g. Teacher, Coach"
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.role
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.role && <p className="text-[10px] text-destructive font-medium">{errors.role}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Designation *</label>
          <input
            type="text"
            value={formData.designation}
            onChange={e => onChange("designation", e.target.value)}
            placeholder="e.g. Senior Lecturer, Vice Principal"
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.designation
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          />
          {errors.designation && <p className="text-[10px] text-destructive font-medium">{errors.designation}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department *</label>
          <select
            value={formData.dept}
            onChange={e => onChange("dept", e.target.value)}
            className={`h-10 w-full rounded-xl border bg-background/50 px-3.5 text-xs outline-none focus:ring-2 transition-all ${errors.dept
              ? "border-destructive focus:ring-destructive/20"
              : "border-border/60 focus:border-primary focus:ring-primary/20"
              }`}
          >
            <option value="">Select Department</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.dept && <p className="text-[10px] text-destructive font-medium">{errors.dept}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Joining Date</label>
          <input
            type="date"
            value={formData.joinedDate}
            onChange={e => onChange("joinedDate", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
          <select
            value={formData.status}
            onChange={e => onChange("status", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function TeachingTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Teaching Assignments"
        description="Define subject expertise and teaching constraints."
        icon={<span className="text-sm font-bold">4</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subjects Taught *</label>
          <input
            type="text"
            value={formData.subjectsTaught}
            onChange={e => onChange("subjectsTaught", e.target.value)}
            placeholder="e.g. Algebra, Trigonometry"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Grade Levels *</label>
          <input
            type="text"
            value={formData.gradeLevels}
            onChange={e => onChange("gradeLevels", e.target.value)}
            placeholder="e.g. Grade 9, Grade 10"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Weekly Teaching Hours</label>
          <input
            type="number"
            value={formData.weeklyHours}
            onChange={e => onChange("weeklyHours", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function QualificationsTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Educational Credentials"
        description="Verify academic degrees and qualifications."
        icon={<span className="text-sm font-bold">5</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Highest Degree *</label>
          <input
            type="text"
            value={formData.degree}
            onChange={e => onChange("degree", e.target.value)}
            placeholder="e.g. M.Sc. in Mathematics"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">University / Board *</label>
          <input
            type="text"
            value={formData.institution}
            onChange={e => onChange("institution", e.target.value)}
            placeholder="e.g. Delhi University"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Year of Graduation</label>
          <input
            type="number"
            value={formData.gradYear}
            onChange={e => onChange("gradYear", e.target.value)}
            placeholder="2018"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Specialization</label>
          <input
            type="text"
            value={formData.specialization}
            onChange={e => onChange("specialization", e.target.value)}
            placeholder="e.g. Calculus, Pure Math"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Separate section for Exams Qualified */}
      <div className="mt-6 pt-5 border-t border-border/50 space-y-4">
        <SectionHeader
          title="Competitive / Professional Exams"
          description="Record national or state level certifications (e.g. NET, GATE, TET, CTET)."
          icon={<span className="text-xs font-bold">✓</span>}
        />
        <div className="rounded-2xl border border-border/60 bg-accent/10 p-5 space-y-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Exam Name</label>
              <input
                type="text"
                value={formData.examName}
                onChange={e => onChange("examName", e.target.value)}
                placeholder="e.g. NET, GATE, TET"
                className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Year of Passing</label>
              <input
                type="number"
                value={formData.examYear}
                onChange={e => onChange("examYear", e.target.value)}
                placeholder="e.g. 2023"
                className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Score / Rank</label>
              <input
                type="text"
                value={formData.examScore}
                onChange={e => onChange("examScore", e.target.value)}
                placeholder="e.g. 98.5 percentile, Rank 152"
                className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperienceTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Work History"
        description="Track professional experience and previous roles."
        icon={<span className="text-sm font-bold">6</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Experience (Years) *</label>
          <input
            type="number"
            value={formData.totalExperience}
            onChange={e => onChange("totalExperience", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Previous Institution</label>
          <input
            type="text"
            value={formData.prevSchool}
            onChange={e => onChange("prevSchool", e.target.value)}
            placeholder="e.g. Greenfield High"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Previous Designation</label>
          <input
            type="text"
            value={formData.prevRole}
            onChange={e => onChange("prevRole", e.target.value)}
            placeholder="e.g. TGT Teacher"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function SalaryTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Compensation & Banking"
        description="Remuneration structure and bank deposit profiles."
        icon={<span className="text-sm font-bold">7</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Basic Salary (Monthly) *</label>
          <input
            type="number"
            value={formData.basicSalary}
            onChange={e => onChange("basicSalary", e.target.value)}
            placeholder="e.g. 45000"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Allowances (Total)</label>
          <input
            type="number"
            value={formData.allowances}
            onChange={e => onChange("allowances", e.target.value)}
            placeholder="e.g. 5000"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PF & Tax Deductions</label>
          <input
            type="number"
            value={formData.deductions}
            onChange={e => onChange("deductions", e.target.value)}
            placeholder="e.g. 3500"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="border-t border-border/50 sm:col-span-2 pt-3 my-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bank Account Information *</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank Name</label>
          <input
            type="text"
            value={formData.bankName}
            onChange={e => onChange("bankName", e.target.value)}
            placeholder="e.g. HDFC Bank"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Number</label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={e => onChange("bankAccount", e.target.value)}
            placeholder="50100123456789"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">IFSC Code</label>
          <input
            type="text"
            value={formData.ifscCode}
            onChange={e => onChange("ifscCode", e.target.value)}
            placeholder="HDFC0001234"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function DocumentsTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="ID & Verification"
        description="Verify employee compliance and national identity codes."
        icon={<span className="text-sm font-bold">8</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID Proof Type</label>
          <select
            value={formData.idProofType}
            onChange={e => onChange("idProofType", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="Aadhaar">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="Passport">Passport</option>
            <option value="Voter ID">Voter ID</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID Proof Number *</label>
          <input
            type="text"
            value={formData.idProofNumber}
            onChange={e => onChange("idProofNumber", e.target.value)}
            placeholder="e.g. 1234-5678-9012"
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function LeaveTab({ formData, onChange }: TabFormProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Leave Allocation"
        description="Set base annual leave allocations."
        icon={<span className="text-sm font-bold">9</span>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Annual Leaves *</label>
          <input
            type="number"
            value={formData.annualLeaves}
            onChange={e => onChange("annualLeaves", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sick Leaves *</label>
          <input
            type="number"
            value={formData.sickLeaves}
            onChange={e => onChange("sickLeaves", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Casual Leaves *</label>
          <input
            type="number"
            value={formData.casualLeaves}
            onChange={e => onChange("casualLeaves", e.target.value)}
            className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

interface LoginTabProps extends TabFormProps {
  copiedPassword: boolean;
  onCopyPassword: () => void;
}

export function LoginTab({ formData, onChange, errors = {}, copiedPassword, onCopyPassword }: LoginTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        title="Portal Login Access"
        description="Enable and configure portal access for the new staff member."
        icon={<span className="text-sm font-bold">10</span>}
      />

      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 transition-all">
          <input
            type="checkbox"
            id="provideLogin"
            checked={formData.provideLogin}
            onChange={e => onChange("provideLogin", e.target.checked)}
            className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20"
          />
          <label htmlFor="provideLogin" className="flex flex-col cursor-pointer select-none">
            <span className="text-xs font-bold text-foreground">Provide ERP Login Access</span>
            <span className="text-[11px] text-muted-foreground">Automatically spins up a portal account using these credentials.</span>
          </label>
        </div>

        {formData.provideLogin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1 animate-in slide-in-from-top-3 duration-300">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Username / Email (Prefilled)</label>
              <input
                type="text"
                value={formData.username}
                disabled
                placeholder="Email address will be used"
                className="h-10 w-full rounded-xl border border-border/40 bg-accent/40 px-3.5 text-xs text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Temporary Password *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.password}
                  onChange={e => onChange("password", e.target.value)}
                  className={`h-10 w-full rounded-xl border bg-background/50 pl-3.5 pr-10 text-xs font-mono outline-none focus:ring-2 transition-all ${errors.password
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border/60 focus:border-primary focus:ring-primary/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={onCopyPassword}
                  className="absolute right-2.5 top-2 p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy password"
                >
                  {copiedPassword ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[9.5px] text-muted-foreground">Temporary credentials that the employee can copy and use to log in initially.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
