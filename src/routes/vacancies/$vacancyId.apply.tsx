import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowLeft, FileText, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/vacancies/$vacancyId/apply")({
  head: () => ({
    meta: [
      { title: "Apply for a Vacancy — Hamonate LMS" },
      {
        name: "description",
        content:
          "Complete the Hamonate application form and upload your required PDF documents to apply for an open programme vacancy.",
      },
      { property: "og:title", content: "Apply for a Vacancy — Hamonate LMS" },
      {
        property: "og:description",
        content: "Submit your details and supporting PDF documents to apply for a Hamonate programme.",
      },
    ],
  }),
  component: ApplyPage,
});

const DOCUMENTS = [
  { key: "proof_of_account", label: "Proof of account", required: true },
  { key: "sars_document", label: "SARS document", required: true },
  { key: "id_document", label: "ID", required: true },
  { key: "unemployment_affidavit", label: "Confirmation of unemployment affidavit", required: true },
  { key: "resume", label: "Resume", required: true },
  { key: "matric_certificate", label: "Matric certificate", required: true },
  { key: "qualification", label: "Qualification", required: false },
  { key: "academic_record", label: "Academic record", required: false },
  { key: "other_certificates", label: "Other certificates", required: false },
] as const;

function ApplyPage() {
  const { vacancyId } = Route.useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const { data: vacancy, isLoading } = useQuery({
    queryKey: ["vacancy", vacancyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("*")
        .eq("id", vacancyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  function pickFile(key: string, file: File | null) {
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF documents are accepted.");
      return;
    }
    if (file && file.size > 15 * 1024 * 1024) {
      toast.error("Each document must be 15MB or smaller.");
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    if (!fullName || !email || !phone) {
      toast.error("Name, email and phone number are required.");
      return;
    }

    const missing = DOCUMENTS.filter((doc) => doc.required && !files[doc.key]);
    if (missing.length > 0) {
      toast.error(`Missing required document: ${missing[0]!.label}`);
      return;
    }

    setSubmitting(true);
    try {
      const folder = `${vacancyId}/${crypto.randomUUID()}`;
      const documents: Record<string, string> = {};

      for (const doc of DOCUMENTS) {
        const file = files[doc.key];
        if (!file) continue;
        const path = `${folder}/${doc.key}.pdf`;
        const { error } = await supabase.storage
          .from("applications")
          .upload(path, file, { contentType: "application/pdf", upsert: true });
        if (error) throw error;
        documents[doc.key] = path;
      }

      const { error: insertError } = await supabase.from("vacancy_applications").insert({
        vacancy_id: vacancyId,
        full_name: fullName,
        email,
        phone,
        id_number: String(form.get("id_number") ?? "").trim() || null,
        cover_note: String(form.get("cover_note") ?? "").trim() || null,
        documents,
      });
      if (insertError) throw insertError;

      toast.success("Application submitted. We will be in touch by email.");
      void navigate({ to: "/vacancies" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/vacancies">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          All vacancies
        </Link>
      </Button>

      <h1 className="mt-4 font-display text-3xl font-bold">
        {isLoading ? "Loading…" : (vacancy?.title ?? "Vacancy not found")}
      </h1>
      {vacancy ? (
        <p className="mt-2 text-muted-foreground">{vacancy.description}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <Card className="shadow-soft border-border/70">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" required maxLength={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_number">ID number (optional)</Label>
                <Input id="id_number" name="id_number" maxLength={20} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_note">Motivation (optional)</Label>
              <Textarea id="cover_note" name="cover_note" rows={4} maxLength={1000} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/70">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-0.5 h-5 w-5 text-accent" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Supporting documents</h2>
                <p className="text-sm text-muted-foreground">
                  All documents must be uploaded as PDF files, 15MB or smaller each.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {DOCUMENTS.map((doc) => (
                <div key={doc.key} className="space-y-2 rounded-xl border border-border/70 p-4">
                  <Label htmlFor={doc.key} className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {doc.label}
                    <span
                      className={
                        doc.required
                          ? "rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent"
                          : "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                      }
                    >
                      {doc.required ? "Required" : "Optional"}
                    </span>
                  </Label>
                  <Input
                    id={doc.key}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => pickFile(doc.key, e.target.files?.[0] ?? null)}
                  />
                  {files[doc.key] ? (
                    <p className="text-xs text-muted-foreground">{files[doc.key]!.name}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={submitting || !vacancy}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </form>
    </main>
  );
}
