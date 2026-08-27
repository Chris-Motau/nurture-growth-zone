CREATE TABLE public.facilitator_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  cohort text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX facilitator_accounts_email_key ON public.facilitator_accounts (lower(trim(email)));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilitator_accounts TO authenticated;
GRANT ALL ON public.facilitator_accounts TO service_role;

ALTER TABLE public.facilitator_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view facilitator directory"
  ON public.facilitator_accounts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'facilitator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage facilitator directory"
  ON public.facilitator_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER facilitator_accounts_set_updated_at
  BEFORE UPDATE ON public.facilitator_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_listed_facilitator(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.facilitator_accounts
    WHERE lower(trim(email)) = lower(trim(_email)) AND is_active
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_listed_facilitator(text) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _is_facilitator boolean := public.is_listed_facilitator(NEW.email);
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, avatar_url, facilitator_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    _is_facilitator OR public.is_invited_trainee(NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN _is_facilitator THEN 'facilitator'::app_role ELSE 'trainee'::app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

INSERT INTO public.facilitator_accounts (email, full_name, cohort)
VALUES
  ('facilitator@kaelo.co.za', 'Naledi Mokoena', 'Cohort 2026-A'),
  ('thabo.dlamini@kaelo.co.za', 'Thabo Dlamini', 'Cohort 2026-B');