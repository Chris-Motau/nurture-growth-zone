alter table public.vacancies add column if not exists duration text;

alter table public.vacancy_applications add column if not exists status text not null default 'submitted';

alter table public.vacancy_applications drop constraint if exists vacancy_applications_status_check;
alter table public.vacancy_applications add constraint vacancy_applications_status_check check (status in ('submitted','under_review','approved','declined'));

grant select, insert, update, delete on public.vacancy_applications to authenticated;
grant select, insert, update, delete on public.vacancies to anon, authenticated;
grant all on public.vacancies, public.vacancy_applications to service_role;