-- Temporary unauthenticated vacancy administration for product testing.
-- Remove the anon policies below before production release.

alter table public.vacancies
  add column if not exists duration text not null default '';

alter table public.vacancy_applications
  add column if not exists status text not null default 'submitted'
  check (status in ('submitted', 'under_review', 'approved', 'declined'));

grant insert, update, delete on public.vacancies to anon;
grant select, update on public.vacancy_applications to anon;

create policy "Temporary anon vacancy admin read"
  on public.vacancies for select to anon using (true);
create policy "Temporary anon vacancy admin insert"
  on public.vacancies for insert to anon with check (true);
create policy "Temporary anon vacancy admin update"
  on public.vacancies for update to anon using (true) with check (true);
create policy "Temporary anon vacancy admin delete"
  on public.vacancies for delete to anon using (true);

create policy "Temporary anon application admin read"
  on public.vacancy_applications for select to anon using (true);
create policy "Temporary anon application admin update"
  on public.vacancy_applications for update to anon using (true) with check (true);

create policy "Temporary anon application document read"
  on storage.objects for select to anon using (bucket_id = 'applications');
