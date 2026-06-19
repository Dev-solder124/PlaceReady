"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import {
  BRANCHES,
  SKILL_SUGGESTIONS,
  type Skill,
  type Project,
  type Certification,
  type Internship,
  type Student,
  type StudentInput,
  type StudentStatus,
} from "@/lib/types";

const STATUSES: StudentStatus[] = ["Active", "Looking", "Placed", "Not Looking"];
const SKILL_LEVELS = [
  { value: 1, label: "1 — Beginner" },
  { value: 2, label: "2 — Basic" },
  { value: 3, label: "3 — Intermediate" },
  { value: 4, label: "4 — Advanced" },
  { value: 5, label: "5 — Expert" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  branch: string;
  year: string;
  graduationYear: string;
  cgpa: string;
  tenthPct: string;
  twelfthPct: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  status: StudentStatus;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  internships: Internship[];
  achievements: string[];
}

function emptyForm(): FormState {
  return {
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    branch: "Computer Science",
    year: "4",
    graduationYear: String(new Date().getFullYear() + 1),
    cgpa: "",
    tenthPct: "",
    twelfthPct: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: "",
    status: "Active",
    skills: [],
    projects: [],
    certifications: [],
    internships: [],
    achievements: [],
  };
}

function fromStudent(s: Student): FormState {
  return {
    name: s.name,
    email: s.email,
    phone: s.phone ?? "",
    rollNumber: s.rollNumber ?? "",
    branch: s.branch,
    year: String(s.year),
    graduationYear: String(s.graduationYear),
    cgpa: String(s.cgpa),
    tenthPct: s.tenthPct != null ? String(s.tenthPct) : "",
    twelfthPct: s.twelfthPct != null ? String(s.twelfthPct) : "",
    linkedinUrl: s.linkedinUrl ?? "",
    githubUrl: s.githubUrl ?? "",
    resumeUrl: s.resumeUrl ?? "",
    status: s.status,
    skills: s.skills,
    projects: s.projects,
    certifications: s.certifications,
    internships: s.internships,
    achievements: s.achievements,
  };
}

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: Student | null;
  onSaved?: (s: Student) => void;
}) {
  const isEdit = !!student;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setForm(student ? fromStudent(student) : emptyForm());
      setTechInput({});
    }
  }, [open, student]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address";
    if (!form.branch.trim()) return "Branch is required";
    const cgpa = Number(form.cgpa);
    if (!form.cgpa.trim() || isNaN(cgpa) || cgpa < 0 || cgpa > 10)
      return "CGPA must be a number between 0 and 10";
    const year = Number(form.year);
    if (!form.year.trim() || isNaN(year) || year < 1 || year > 5)
      return "Year must be between 1 and 5";
    if (!form.graduationYear.trim() || isNaN(Number(form.graduationYear)))
      return "Graduation year is required";
    return null;
  };

  const toInput = (): StudentInput => ({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    rollNumber: form.rollNumber.trim() || undefined,
    branch: form.branch,
    year: Number(form.year),
    graduationYear: Number(form.graduationYear),
    cgpa: Number(form.cgpa),
    tenthPct: form.tenthPct.trim() ? Number(form.tenthPct) : undefined,
    twelfthPct: form.twelfthPct.trim() ? Number(form.twelfthPct) : undefined,
    linkedinUrl: form.linkedinUrl.trim() || undefined,
    githubUrl: form.githubUrl.trim() || undefined,
    resumeUrl: form.resumeUrl.trim() || undefined,
    status: form.status,
    skills: form.skills,
    projects: form.projects,
    certifications: form.certifications,
    internships: form.internships,
    achievements: form.achievements,
  });

  const submit = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const input = toInput();
      const saved = isEdit
        ? await api.updateStudent(student!.id, input)
        : await api.createStudent(input);
      toast.success(isEdit ? "Student updated" : "Student added");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the student profile. Fields marked with * are required."
              : "Create a student profile with academic and skill information. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-9rem)] scrollbar-thin">
          <div className="space-y-6 px-6 py-6">
            {/* Personal Info */}
            <FormSection title="Personal Information">
              <Field label="Full Name" required>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="student@college.edu"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Field>
              <Field label="Roll Number">
                <Input
                  value={form.rollNumber}
                  onChange={(e) => set("rollNumber", e.target.value)}
                  placeholder="CS21B001"
                />
              </Field>
            </FormSection>

            {/* Academic Info */}
            <FormSection title="Academic Information">
              <Field label="Branch" required>
                <Select
                  value={form.branch}
                  onValueChange={(v) => set("branch", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Current Year" required>
                <Select value={form.year} onValueChange={(v) => set("year", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Graduation Year" required>
                <Input
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => set("graduationYear", e.target.value)}
                  placeholder="2025"
                />
              </Field>
              <Field label="CGPA (out of 10)" required>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={form.cgpa}
                  onChange={(e) => set("cgpa", e.target.value)}
                  placeholder="8.5"
                />
              </Field>
              <Field label="10th Percentage">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.tenthPct}
                  onChange={(e) => set("tenthPct", e.target.value)}
                  placeholder="92.5"
                />
              </Field>
              <Field label="12th Percentage">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.twelfthPct}
                  onChange={(e) => set("twelfthPct", e.target.value)}
                  placeholder="89.0"
                />
              </Field>
              <Field label="Placement Status">
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as StudentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FormSection>

            {/* Links */}
            <FormSection title="Online Presence">
              <Field label="LinkedIn URL">
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => set("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </Field>
              <Field label="GitHub URL">
                <Input
                  value={form.githubUrl}
                  onChange={(e) => set("githubUrl", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </Field>
              <Field label="Resume URL">
                <Input
                  value={form.resumeUrl}
                  onChange={(e) => set("resumeUrl", e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </Field>
            </FormSection>

            <Separator />

            {/* Skills */}
            <DynamicSection
              title="Technical Skills"
              count={form.skills.length}
              onAdd={() =>
                set("skills", [
                  ...form.skills,
                  { name: "", level: 3 },
                ])
              }
            >
              {form.skills.length === 0 ? (
                <EmptyHint text="No skills added yet. Click 'Add Skill' to begin." />
              ) : (
                <div className="space-y-2">
                  {form.skills.map((sk, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Skill</Label>
                        <Input
                          list="skill-suggestions"
                          value={sk.name}
                          onChange={(e) =>
                            updateSkill(form, setForm, i, {
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g. Python"
                        />
                        <datalist id="skill-suggestions">
                          {SKILL_SUGGESTIONS.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>
                      <div className="w-[160px]">
                        <Label className="text-xs">Proficiency</Label>
                        <Select
                          value={String(sk.level)}
                          onValueChange={(v) =>
                            updateSkill(form, setForm, i, {
                              level: Number(v) as Skill["level"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map((l) => (
                              <SelectItem key={l.value} value={String(l.value)}>
                                {l.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mb-0.5 h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(form, setForm, "skills", i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </DynamicSection>

            {/* Projects */}
            <DynamicSection
              title="Projects"
              count={form.projects.length}
              onAdd={() =>
                set("projects", [
                  ...form.projects,
                  { title: "", description: "", tech: [] },
                ])
              }
            >
              {form.projects.length === 0 ? (
                <EmptyHint text="No projects added yet." />
              ) : (
                <div className="space-y-3">
                  {form.projects.map((p, i) => (
                    <div key={i} className="rounded-lg border bg-card p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={p.title}
                            onChange={(e) =>
                              updateProject(form, setForm, i, {
                                title: e.target.value,
                              })
                            }
                            placeholder="Project title"
                          />
                          <Textarea
                            value={p.description}
                            onChange={(e) =>
                              updateProject(form, setForm, i, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Short description of the project"
                            rows={2}
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              value={techInput[i] ?? ""}
                              onChange={(e) =>
                                setTechInput((t) => ({
                                  ...t,
                                  [i]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  (techInput[i] ?? "").trim()
                                ) {
                                  e.preventDefault();
                                  const tech = (techInput[i] ?? "").trim();
                                  updateProject(form, setForm, i, {
                                    tech: [...p.tech, tech],
                                  });
                                  setTechInput((t) => ({ ...t, [i]: "" }));
                                }
                              }}
                              placeholder="Type a tech & press Enter"
                            />
                          </div>
                          {p.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.tech.map((t, ti) => (
                                <Badge
                                  key={ti}
                                  variant="secondary"
                                  className="gap-1 font-normal text-[10px]"
                                >
                                  {t}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProject(form, setForm, i, {
                                        tech: p.tech.filter(
                                          (_, idx) => idx !== ti,
                                        ),
                                      })
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            removeItem(form, setForm, "projects", i)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DynamicSection>

            {/* Internships */}
            <DynamicSection
              title="Internships"
              count={form.internships.length}
              onAdd={() =>
                set("internships", [
                  ...form.internships,
                  { company: "", role: "", duration: "", description: "" },
                ])
              }
            >
              {form.internships.length === 0 ? (
                <EmptyHint text="No internships added yet." />
              ) : (
                <div className="space-y-3">
                  {form.internships.map((it, i) => (
                    <div key={i} className="rounded-lg border bg-card p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={it.role}
                              onChange={(e) =>
                                updateInternship(form, setForm, i, {
                                  role: e.target.value,
                                })
                              }
                              placeholder="Role"
                            />
                            <Input
                              value={it.company}
                              onChange={(e) =>
                                updateInternship(form, setForm, i, {
                                  company: e.target.value,
                                })
                              }
                              placeholder="Company"
                            />
                          </div>
                          <Input
                            value={it.duration}
                            onChange={(e) =>
                              updateInternship(form, setForm, i, {
                                duration: e.target.value,
                              })
                            }
                            placeholder="Duration (e.g. 3 months)"
                          />
                          <Textarea
                            value={it.description}
                            onChange={(e) =>
                              updateInternship(form, setForm, i, {
                                description: e.target.value,
                              })
                            }
                            placeholder="What did you work on?"
                            rows={2}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            removeItem(form, setForm, "internships", i)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DynamicSection>

            {/* Certifications */}
            <DynamicSection
              title="Certifications"
              count={form.certifications.length}
              onAdd={() =>
                set("certifications", [
                  ...form.certifications,
                  { name: "", issuer: "", date: "" },
                ])
              }
            >
              {form.certifications.length === 0 ? (
                <EmptyHint text="No certifications added yet." />
              ) : (
                <div className="space-y-2">
                  {form.certifications.map((c, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={c.name}
                          onChange={(e) =>
                            updateCert(form, setForm, i, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Certification name"
                        />
                      </div>
                      <div className="w-[140px]">
                        <Label className="text-xs">Issuer</Label>
                        <Input
                          value={c.issuer}
                          onChange={(e) =>
                            updateCert(form, setForm, i, {
                              issuer: e.target.value,
                            })
                          }
                          placeholder="Issuer"
                        />
                      </div>
                      <div className="w-[120px]">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="month"
                          value={c.date}
                          onChange={(e) =>
                            updateCert(form, setForm, i, {
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mb-0.5 h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          removeItem(form, setForm, "certifications", i)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </DynamicSection>

            {/* Achievements */}
            <DynamicSection
              title="Achievements"
              count={form.achievements.length}
              onAdd={() =>
                set("achievements", [...form.achievements, ""])
              }
            >
              {form.achievements.length === 0 ? (
                <EmptyHint text="No achievements added yet." />
              ) : (
                <div className="space-y-2">
                  {form.achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={a}
                        onChange={(e) =>
                          updateAchievement(form, setForm, i, e.target.value)
                        }
                        placeholder="e.g. Winner - Smart India Hackathon 2023"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          removeItem(form, setForm, "achievements", i)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </DynamicSection>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Helpers ----------

function updateSkill(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  i: number,
  patch: Partial<Skill>,
) {
  setForm((f) => ({
    ...f,
    skills: f.skills.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
  }));
}
function updateProject(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  i: number,
  patch: Partial<Project>,
) {
  setForm((f) => ({
    ...f,
    projects: f.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
  }));
}
function updateInternship(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  i: number,
  patch: Partial<Internship>,
) {
  setForm((f) => ({
    ...f,
    internships: f.internships.map((p, idx) =>
      idx === i ? { ...p, ...patch } : p,
    ),
  }));
}
function updateCert(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  i: number,
  patch: Partial<Certification>,
) {
  setForm((f) => ({
    ...f,
    certifications: f.certifications.map((p, idx) =>
      idx === i ? { ...p, ...patch } : p,
    ),
  }));
}
function updateAchievement(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  i: number,
  value: string,
) {
  setForm((f) => ({
    ...f,
    achievements: f.achievements.map((a, idx) => (idx === i ? value : a)),
  }));
}
function removeItem(
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  key: "skills" | "projects" | "certifications" | "internships" | "achievements",
  i: number,
) {
  setForm((f) => ({
    ...f,
    [key]: (f[key] as unknown[]).filter((_, idx) => idx !== i),
  }));
}

// ---------- Small UI helpers ----------

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function DynamicSection({
  title,
  count,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {count > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {count}
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 gap-1 text-xs"
          onClick={onAdd}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
