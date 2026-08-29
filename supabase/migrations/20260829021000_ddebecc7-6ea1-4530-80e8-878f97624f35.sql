INSERT INTO public.facilitator_accounts (email, full_name, cohort, is_active)
VALUES ('leravero@gmail.com', 'Lerato Facilitator', 'Cohort 2026', true)
ON CONFLICT DO NOTHING;