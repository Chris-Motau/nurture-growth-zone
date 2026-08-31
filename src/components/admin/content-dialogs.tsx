import { useEffect, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type CourseValues = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  facilitator_name: string;
};

export type LessonValues = {
  topic: string;
  overview_md: string;
  duration_minutes: number;
};

export type ModuleValues = {
  topic: string;
  content_md: string;
  video_url: string;
  duration_minutes: number;
};

export type TaskValues = {
  topic: string;
  instructions_md: string;
  due_date: string;
};

function FormDialog({
  trigger,
  title,
  description,
  submitLabel,
  onSubmit,
  canSubmit = true,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
  canSubmit?: boolean;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4 py-1">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={async () => {
              await onSubmit();
              onOpenChange(false);
            }}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function CourseDialog({
  trigger,
  title,
  submitLabel,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  initial?: Partial<CourseValues>;
  onSubmit: (values: CourseValues) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CourseValues>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    facilitator_name: "",
    ...initial,
  });
  useEffect(() => {
    if (open)
      setValues({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        facilitator_name: "",
        ...initial,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (patch: Partial<CourseValues>) => setValues((v) => ({ ...v, ...patch }));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description="Courses group lessons. Dates and facilitator are shown to trainees."
      submitLabel={submitLabel}
      canSubmit={Boolean(values.title.trim())}
      onSubmit={() => onSubmit(values)}
    >
      <Field label="Course topic">
        <Input
          value={values.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g. Web Development Fundamentals"
        />
      </Field>
      <Field label="Description">
        <Textarea
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="What this course covers"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date">
          <Input
            type="date"
            value={values.start_date}
            onChange={(e) => set({ start_date: e.target.value })}
          />
        </Field>
        <Field label="End date">
          <Input
            type="date"
            value={values.end_date}
            onChange={(e) => set({ end_date: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Facilitator carrying out the course">
        <Input
          value={values.facilitator_name}
          onChange={(e) => set({ facilitator_name: e.target.value })}
          placeholder="Full name"
        />
      </Field>
    </FormDialog>
  );
}

export function LessonDialog({
  trigger,
  title,
  submitLabel,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  initial?: Partial<LessonValues>;
  onSubmit: (values: LessonValues) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const base: LessonValues = { topic: "", overview_md: "", duration_minutes: 0 };
  const [values, setValues] = useState<LessonValues>({ ...base, ...initial });
  useEffect(() => {
    if (open) setValues({ ...base, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (patch: Partial<LessonValues>) => setValues((v) => ({ ...v, ...patch }));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description="A lesson holds many modules and optionally one or more tasks."
      submitLabel={submitLabel}
      canSubmit={Boolean(values.topic.trim())}
      onSubmit={() => onSubmit(values)}
    >
      <Field label="Lesson topic">
        <Input
          value={values.topic}
          onChange={(e) => set({ topic: e.target.value })}
          placeholder="e.g. HTML Foundations"
        />
      </Field>
      <Field label="Overview (Markdown)" hint="Supports # headings and - bullet lists.">
        <Textarea
          rows={6}
          value={values.overview_md}
          onChange={(e) => set({ overview_md: e.target.value })}
          placeholder="## What you'll learn"
        />
      </Field>
      <Field label="Lesson duration (minutes)" hint="Leave 0 to sum module durations automatically.">
        <Input
          type="number"
          min={0}
          value={values.duration_minutes}
          onChange={(e) => set({ duration_minutes: Number(e.target.value) || 0 })}
        />
      </Field>
    </FormDialog>
  );
}

export function ModuleDialog({
  trigger,
  title,
  submitLabel,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  initial?: Partial<ModuleValues>;
  onSubmit: (values: ModuleValues) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const base: ModuleValues = { topic: "", content_md: "", video_url: "", duration_minutes: 0 };
  const [values, setValues] = useState<ModuleValues>({ ...base, ...initial });
  useEffect(() => {
    if (open) setValues({ ...base, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (patch: Partial<ModuleValues>) => setValues((v) => ({ ...v, ...patch }));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description="Add a video URL, written content, or both. Documents upload separately."
      submitLabel={submitLabel}
      canSubmit={Boolean(values.topic.trim())}
      onSubmit={() => onSubmit(values)}
    >
      <Field label="Module sub-topic">
        <Input
          value={values.topic}
          onChange={(e) => set({ topic: e.target.value })}
          placeholder="e.g. Semantic elements"
        />
      </Field>
      <Field label="Video URL" hint="YouTube, Vimeo or any direct video link (optional).">
        <Input
          value={values.video_url}
          onChange={(e) => set({ video_url: e.target.value })}
          placeholder="https://..."
        />
      </Field>
      <Field label="Text content (Markdown)">
        <Textarea
          rows={7}
          value={values.content_md}
          onChange={(e) => set({ content_md: e.target.value })}
          placeholder="### Notes"
        />
      </Field>
      <Field label="Module duration (minutes)">
        <Input
          type="number"
          min={0}
          value={values.duration_minutes}
          onChange={(e) => set({ duration_minutes: Number(e.target.value) || 0 })}
        />
      </Field>
    </FormDialog>
  );
}

export function TaskDialog({
  trigger,
  title,
  submitLabel,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  initial?: Partial<TaskValues>;
  onSubmit: (values: TaskValues) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const base: TaskValues = { topic: "", instructions_md: "", due_date: "" };
  const [values, setValues] = useState<TaskValues>({ ...base, ...initial });
  useEffect(() => {
    if (open) setValues({ ...base, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (patch: Partial<TaskValues>) => setValues((v) => ({ ...v, ...patch }));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description="Tasks are optional — a lesson can have none, one or many."
      submitLabel={submitLabel}
      canSubmit={Boolean(values.topic.trim())}
      onSubmit={() => onSubmit(values)}
    >
      <Field label="Task topic">
        <Input
          value={values.topic}
          onChange={(e) => set({ topic: e.target.value })}
          placeholder="e.g. Build a landing page"
        />
      </Field>
      <Field label="Instructions (Markdown)">
        <Textarea
          rows={7}
          value={values.instructions_md}
          onChange={(e) => set({ instructions_md: e.target.value })}
          placeholder="- Fork the repo\n- Submit your GitHub link"
        />
      </Field>
      <Field label="Due date">
        <Input
          type="date"
          value={values.due_date}
          onChange={(e) => set({ due_date: e.target.value })}
        />
      </Field>
    </FormDialog>
  );
}

export function ConfirmDelete({
  label,
  name,
  onDelete,
  trigger,
}: {
  label: string;
  name?: string;
  onDelete: () => void;
  trigger?: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label={`Delete ${label}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            {name ? `"${name}" ` : ""}will be permanently removed along with any linked content.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}
          >
            Delete {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
