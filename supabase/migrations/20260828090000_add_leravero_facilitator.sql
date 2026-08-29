-- Provision the requested facilitator account. This also covers an account
-- that already signed up before being added to the facilitator directory.
INSERT INTO public.facilitator_accounts (email, full_name, is_active)
VALUES ('leravero@gmail.com', 'Leravero', true)
ON CONFLICT (lower(trim(email))) DO UPDATE
SET is_active = true,
    updated_at = now();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'facilitator'::public.app_role
FROM public.profiles
WHERE lower(trim(email)) = 'leravero@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET facilitator_verified = true,
    updated_at = now()
WHERE lower(trim(email)) = 'leravero@gmail.com';
