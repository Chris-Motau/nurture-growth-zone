CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  content text NOT NULL DEFAULT '',
  meeting_date date NOT NULL DEFAULT current_date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage meetings" ON public.meetings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'facilitator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'facilitator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER meetings_set_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meeting_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  present boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_attendance TO authenticated;
GRANT ALL ON public.meeting_attendance TO service_role;
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage attendance" ON public.meeting_attendance
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'facilitator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'facilitator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own attendance" ON public.meeting_attendance
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER meeting_attendance_set_updated_at BEFORE UPDATE ON public.meeting_attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();