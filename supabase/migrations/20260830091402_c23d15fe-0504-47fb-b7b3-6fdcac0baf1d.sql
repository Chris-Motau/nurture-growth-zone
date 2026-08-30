-- Enforce facilitator-approved trainee onboarding and support complete learning content.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _is_facilitator boolean := public.is_listed_facilitator(NEW.email);
  _is_invited boolean := public.is_invited_trainee(NEW.email);
BEGIN
  IF NOT _is_facilitator AND NOT _is_invited THEN
    RAISE EXCEPTION 'This email has not been registered by a facilitator.';
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, avatar_url, facilitator_verified)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''), NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url', true)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN _is_facilitator THEN 'facilitator'::app_role ELSE 'trainee'::app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$function$;

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS document_path text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Signed-in users can view courses" ON public.courses;
CREATE POLICY "Visible courses or staff" ON public.courses FOR SELECT TO authenticated
USING (NOT is_hidden OR public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Signed-in users can view lessons" ON public.lessons;
CREATE POLICY "Visible lessons or staff" ON public.lessons FOR SELECT TO authenticated
USING ((NOT is_hidden AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND NOT c.is_hidden)) OR public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Signed-in users can view modules" ON public.modules;
CREATE POLICY "Visible modules or staff" ON public.modules FOR SELECT TO authenticated
USING ((NOT is_hidden AND EXISTS (SELECT 1 FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE l.id = lesson_id AND NOT l.is_hidden AND NOT c.is_hidden)) OR public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Signed-in users can view tasks" ON public.tasks;
CREATE POLICY "Visible tasks or staff" ON public.tasks FOR SELECT TO authenticated
USING ((NOT is_hidden AND EXISTS (SELECT 1 FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE l.id = lesson_id AND NOT l.is_hidden AND NOT c.is_hidden)) OR public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- bucket 'module-documents' created via storage tool (migrations cannot write storage.buckets)
CREATE POLICY "Staff manage module documents" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'module-documents' AND (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin')))
WITH CHECK (bucket_id = 'module-documents' AND (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Signed-in users view module documents" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'module-documents');