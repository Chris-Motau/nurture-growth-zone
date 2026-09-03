create type public.program_type as enum ('work_integrated_learning','internship','learnership');

create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  program program_type not null,
  description text not null default '',
  location text,
  closing_date date,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.vacancies to anon, authenticated;
grant all on public.vacancies to service_role;
alter table public.vacancies enable row level security;
create policy "Anyone can view open vacancies" on public.vacancies for select to anon, authenticated using (is_open);
create policy "Admins manage vacancies" on public.vacancies for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.vacancy_applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  id_number text,
  cover_note text,
  documents jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant insert on public.vacancy_applications to anon, authenticated;
grant select on public.vacancy_applications to authenticated;
grant all on public.vacancy_applications to service_role;
alter table public.vacancy_applications enable row level security;
create policy "Anyone can apply" on public.vacancy_applications for insert to anon, authenticated with check (true);
create policy "Staff can view applications" on public.vacancy_applications for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'facilitator'));

create policy "Anyone can upload application documents" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'applications');
create policy "Staff can read application documents" on storage.objects for select to authenticated
  using (bucket_id = 'applications' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'facilitator')));

insert into public.vacancies (title, program, description, location, closing_date) values
('Software Development WIL Placement','work_integrated_learning','12-month workplace experience for students who need practical hours to complete their qualification.','Johannesburg', current_date + 45),
('Data Analytics WIL Placement','work_integrated_learning','Structured workplace learning in reporting, dashboards and data quality.','Johannesburg', current_date + 30),
('Software Engineering Internship','internship','12-month internship building and maintaining web applications alongside senior engineers.','Johannesburg', current_date + 21),
('IT Support Internship','internship','Hands-on internship covering desktop support, networks and service desk operations.','Pretoria', current_date + 28),
('End User Computing Learnership','learnership','NQF Level 3 learnership combining classroom theory with workplace practice.','Johannesburg', current_date + 40),
('Systems Development Learnership','learnership','NQF Level 5 learnership for unemployed youth entering software development.','Johannesburg', current_date + 35);