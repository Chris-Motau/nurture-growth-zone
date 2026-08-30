-- The staff workspace lists trainees by their role. Facilitators need read access
-- to those role rows just as they already have access to trainee profiles.

CREATE POLICY "Staff can view user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'facilitator')
  OR public.has_role(auth.uid(), 'admin')
);