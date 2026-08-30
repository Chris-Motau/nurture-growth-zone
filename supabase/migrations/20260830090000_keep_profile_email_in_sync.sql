-- A trainee may only change to an email captured by a facilitator. Keep public profile email in sync
-- once Supabase Auth confirms the requested address change.
CREATE OR REPLACE FUNCTION public.validate_auth_email_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email
     AND NOT public.is_invited_trainee(NEW.email)
     AND NOT public.is_listed_facilitator(NEW.email) THEN
    RAISE EXCEPTION 'This email has not been registered by a facilitator.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_auth_email_change ON auth.users;
CREATE TRIGGER validate_auth_email_change
BEFORE UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.validate_auth_email_change();

DROP TRIGGER IF EXISTS sync_profile_email ON auth.users;
CREATE TRIGGER sync_profile_email
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();
