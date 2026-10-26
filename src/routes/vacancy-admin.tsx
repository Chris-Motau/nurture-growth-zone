import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Download, Eye, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { PROGRAMS } from "@/routes/vacancies/index";

export const Route = createFileRoute("/vacancy-admin")({
  component: VacancyAdminPage,
  head: () => ({ meta: [{ title: "Vacancy admin — Hamonate LMS" }] }),
});

type Vacancy = Database["public"]["Tables"]["vacancies"]["Row"];
type Application = Database["public"]["Tables"]["vacancy_applications"]["Row"];
type Program = Database["public"]["Enums"]["program_type"];
type ApplicationStatus = "submitted" | "under_review" | "approved" | "declined";

const documentLabels: Record<string, string> = {
  proof_of_account: "Proof of account",
  sars_document: "SARS document",
  id_document: "ID",
  unemployment_affidavit: "Confirmation of unemployment affidavit",
  resume: "Resume",
  matric_certificate: "Matric certificate",
  qualification: "Qualification",
  academic_record: "Academic record",
  other_certificates: "Other certificates",
};

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  declined: "Declined",
};

function asDocuments(value: Json): Record<string, string> {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function VacancyAdminPage() {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null | undefined>(undefined);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vacancy-admin"],
    queryFn: async () => {
      const [vacanciesResult, applicationsResult] = await Promise.all([
        supabase.from("vacancies").select("*").order("created_at", { ascending: false }),
        supabase.from("vacancy_applications").select("*").order("created_at", { ascending: false }),
      ]);
      if (vacanciesResult.error) throw vacanciesResult.error;
      if (applicationsResult.error) throw applicationsResult.error;
      return { vacancies: vacanciesResult.data ?? [], applications: applicationsResult.data ?? [] };
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["vacancy-admin"] });

  const saveVacancy = useMutation({
    mutationFn: async (values: Database["public"]["Tables"]["vacancies"]["Insert"]) => {
      const { error } = editingVacancy
        ? await supabase.from("vacancies").update(values).eq("id", editingVacancy.id)
        : await supabase.from("vacancies").insert(values);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      setEditingVacancy(undefined);
      toast.success(editingVacancy ? "Vacancy updated." : "Vacancy published.");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateVacancy = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Vacancy> }) => {
      const { error } = await supabase.from("vacancies").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (error) => toast.error(error.message),
  });

  const deleteVacancy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vacancies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Vacancy deleted.");
    },
    onError: (error) => toast.error(error.message),
  });

  const setApplicationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase.from("vacancy_applications").update({ status }).eq("id", id);
      if (error) throw error;
      return status;
    },
    onSuccess: async (status) => {
      await refresh();
      setSelectedApplicant((current) => (current ? { ...current, status } : current));
      toast.success(`Application marked ${statusLabels[status].toLowerCase()}.`);
    },
    onError: (error) => toast.error(error.message),
  });

  function submitVacancy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveVacancy.mutate({
      title: String(form.get("title") ?? "").trim(),
      program: String(form.get("program")) as Program,
      description: String(form.get("description") ?? "").trim(),
      closing_date: String(form.get("closing_date") ?? "") || null,
      duration: String(form.get("duration") ?? "").trim(),
      location: null,
      is_open: editingVacancy?.is_open ?? true,
    });
  }

  async function openApplicant(application: Application) {
    setSelectedApplicant(application);
    if (application.status === "submitted") {
      setApplicationStatus.mutate({ id: application.id, status: "under_review" });
    }
  }

  async function openDocument(path: string, download = false) {
    const { data: signed, error } = await supabase.storage
      .from("applications")
      .createSignedUrl(path, 60 * 10, download ? { download: true } : undefined);
    if (error || !signed) {
      toast.error(error?.message ?? "Could not open this document.");
      return;
    }
    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  }

  const vacancies = data?.vacancies ?? [];
  const applications = data?.applications ?? [];
  const selectedVacancyIds = new Set(
    vacancies.filter((vacancy) => vacancy.program === selectedProgram).map((vacancy) => vacancy.id),
  );
  const categoryApplications = applications.filter((application) =>
    selectedVacancyIds.has(application.vacancy_id),
  );
  const applicantVacancy = vacancies.find(
    (vacancy) => vacancy.id === selectedApplicant?.vacancy_id,
  );
  const documents = selectedApplicant ? asDocuments(selectedApplicant.documents) : {};

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Temporary testing access</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Vacancy admin dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Publish opportunities and review applications.
          </p>
        </div>
        <Button onClick={() => setEditingVacancy(null)}>
          <Plus className="mr-2 h-4 w-4" /> Post vacancy
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading dashboard…</p>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {PROGRAMS.map((program) => {
              const count = applications.filter((application) =>
                vacancies.some(
                  (vacancy) =>
                    vacancy.id === application.vacancy_id && vacancy.program === program.value,
                ),
              ).length;
              return (
                <button
                  key={program.value}
                  type="button"
                  onClick={() => setSelectedProgram(program.value)}
                  className="text-left"
                >
                  <Card className="h-full transition hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <Briefcase className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{program.label}</CardTitle>
                      <CardDescription>{program.blurb}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="font-display text-3xl font-bold">{count}</span> applications
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Vacancy posts</h2>
            <div className="mt-4 space-y-3">
              {vacancies.length === 0 ? (
                <p className="text-muted-foreground">No vacancies posted yet.</p>
              ) : (
                vacancies.map((vacancy) => (
                  <Card key={vacancy.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{vacancy.title}</h3>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                            {vacancy.is_open ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {PROGRAMS.find((p) => p.value === vacancy.program)?.label} ·{" "}
                          {vacancy.duration || "Duration not set"} ·{" "}
                          {applications.filter((a) => a.vacancy_id === vacancy.id).length}{" "}
                          applications
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateVacancy.mutate({
                              id: vacancy.id,
                              values: { is_open: !vacancy.is_open },
                            })
                          }
                        >
                          {vacancy.is_open ? "Hide" : "Show"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${vacancy.title}`}
                          onClick={() => setEditingVacancy(vacancy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label={`Delete ${vacancy.title}`}
                          onClick={() => {
                            if (
                              window.confirm(`Delete “${vacancy.title}” and all its applications?`)
                            )
                              deleteVacancy.mutate(vacancy.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {selectedProgram && (
            <section className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {PROGRAMS.find((p) => p.value === selectedProgram)?.label} applicants
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProgram(null)}>
                  Close list
                </Button>
              </div>
              <ol className="mt-4 space-y-2">
                {categoryApplications.length === 0 ? (
                  <p className="text-muted-foreground">No applications in this category.</p>
                ) : (
                  categoryApplications.map((application, index) => (
                    <li key={application.id}>
                      <button
                        type="button"
                        onClick={() => void openApplicant(application)}
                        className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary"
                      >
                        <span>
                          <span className="mr-3 text-muted-foreground">{index + 1}.</span>
                          <span className="font-medium">{application.full_name}</span>
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                          {statusLabels[application.status as ApplicationStatus] ??
                            application.status}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ol>
            </section>
          )}
        </>
      )}

      <Dialog
        open={editingVacancy !== undefined}
        onOpenChange={(open) => !open && setEditingVacancy(undefined)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingVacancy ? "Edit vacancy" : "Post a vacancy"}</DialogTitle>
            <DialogDescription>Enter the programme details applicants will see.</DialogDescription>
          </DialogHeader>
          <form key={editingVacancy?.id ?? "new"} onSubmit={submitVacancy} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program title</Label>
              <Input id="title" name="title" defaultValue={editingVacancy?.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program category</Label>
              <select
                id="program"
                name="program"
                defaultValue={editingVacancy?.program ?? "work_integrated_learning"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                {PROGRAMS.map((program) => (
                  <option key={program.value} value={program.value}>
                    {program.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Program description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingVacancy?.description}
                rows={5}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="closing_date">Closing date</Label>
                <Input
                  id="closing_date"
                  name="closing_date"
                  type="date"
                  defaultValue={editingVacancy?.closing_date ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Program duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g. 12 months"
                  defaultValue={editingVacancy?.duration ?? ""}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingVacancy(undefined)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveVacancy.isPending}>
                {saveVacancy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingVacancy ? "Save changes" : "Publish vacancy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedApplicant)}
        onOpenChange={(open) => !open && setSelectedApplicant(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedApplicant?.full_name}</DialogTitle>
            <DialogDescription>
              {applicantVacancy?.title} · {selectedApplicant?.email} · {selectedApplicant?.phone}
            </DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium">Application status</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statusLabels[selectedApplicant.status as ApplicationStatus] ??
                    selectedApplicant.status}
                </p>
              </div>
              {selectedApplicant.cover_note && (
                <div>
                  <p className="text-sm font-medium">Motivation</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {selectedApplicant.cover_note}
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-semibold">Submitted documents</h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(documents).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents submitted.</p>
                  ) : (
                    Object.entries(documents).map(([key, path]) => (
                      <div
                        key={key}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4 text-primary" />
                          {documentLabels[key] ?? key}
                        </span>
                        <span className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void openDocument(path)}
                          >
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void openDocument(path, true)}
                          >
                            <Download className="mr-1 h-4 w-4" /> Download
                          </Button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() =>
                    setApplicationStatus.mutate({ id: selectedApplicant.id, status: "declined" })
                  }
                >
                  Decline
                </Button>
                <Button
                  onClick={() =>
                    setApplicationStatus.mutate({ id: selectedApplicant.id, status: "approved" })
                  }
                >
                  Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
