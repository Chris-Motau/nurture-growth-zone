# Hamonate Learning Management System (LMS)

A full-stack Learning Management System built for **Hamonate**, a South African training and skills-development company. The platform serves three kinds of users:

- **Trainees** — register, log in, browse enrolled courses, work through lessons and modules, track their learning progress, complete outstanding tasks and submit GitHub links for review.
- **Facilitators** — log in with accounts provisioned by management, invite trainees by email, upload learning content and track attendance and trainee performance.
- **Management (Admins)** — manage courses, lessons, modules and tasks, run meetings and attendance tracking, review vacancy applications and monitor trainee progress.

The app also features a public-facing site (welcome page, about us, company location with map, privacy policy, terms and conditions) and a public **vacancies portal** where applicants can view openings grouped by program type (Work Integrated Learning, Internship & Learnership) and apply by uploading supporting documents.

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Frontend framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Full-stack framework | [TanStack Start](https://tanstack.com/start) (SSR, file-based routing, server functions) |
| Routing | [TanStack Router](https://tanstack.com/router) (type-safe, file-based) |
| Data fetching / caching | [TanStack Query](https://tanstack.com/query) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) with a custom design system (navy, vermilion & periwinkle palette) |
| UI components | [shadcn/ui](https://ui.shadcn.com) built on [Radix UI](https://www.radix-ui.com) primitives |
| Forms & validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Notifications | [Sonner](https://sonner.emilkowal.dev) (toast pop-ups for success/failure) |
| Charts | [Recharts](https://recharts.org) |
| Backend / Database | [Supabase](https://supabase.com) (PostgreSQL, authentication, row-level security, storage) |
| ORM (schema tooling) | [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit for migration authoring |
| Build tool | [Vite 8](https://vite.dev) |
| Code quality | ESLint + Prettier |

## Tech Stack Summary

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), TanStack Router/Query
- **Backend:** Supabase (hosted PostgreSQL with row-level security, Auth, Storage buckets for avatars, module documents and application PDFs), TanStack Start server functions for app-internal logic
- **Tooling:** npm, Vite, Drizzle ORM, ESLint and Prettier

## IDEs Used

The project was primarily developed with AI-assisted development in the **Lovable** platform, but it is a standard TypeScript web project and can be opened in any modern editor:

- **Visual Studio Code** (recommended) — with the TypeScript, ESLint and Tailwind CSS IntelliSense extensions
- **WebStorm / JetBrains IDEs**
- **Cursor** or any other editor that supports TypeScript

## Version Control

The project uses **Git** for version control, with the repository hosted on **GitHub**. All source code, database migrations (in `supabase/migrations/`) and project configuration live in the repository. Database changes are tracked as timestamped SQL migration files so the schema can be reproduced from scratch.

> ⚠️ **Note for recruiters and reviewers:**
> This project has **NOT been deployed as of yet** — it is still **under development**. Because it is work in progress, there may be insecure or experimental configurations included within this repository (for example, seeded test accounts, placeholder credentials or development-only settings). **These are intentional development artifacts and should be ignored.** They will be removed or hardened before any production release, and the application will be deployed with production-grade security configuration at that time.

## Getting Started

### Prerequisites

- **Node.js** 20+ with npm installed
- **Git** installed
- A Supabase project (hosted PostgreSQL) if you want to run against a real backend

### Clone the repository

```bash
git clone https://github.com/Chris-Motau/nurture-growth-zone.git
cd nuture-growth-zone
code .
```

### Run it locally

1. **Install dependencies**

   ```bash
   npm install

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. Open **http://localhost:8080** in your browser (or the port shown in the terminal).

### Test Accounts

Use these accounts to test the admin and trainee login flows:

| Role | Email |
| --- | --- |
| Admin | `leravero@gmail.com` | password: 'ChrisX@0s! |
| Trainee | `chrismotau@gmail.com` | password: 72FBH3T7qdz@rwb |

Passwords are not stored in this repository. Obtain test passwords through a secure channel.

### Other useful scripts

```bash
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # lint the codebase
npm run format     # format with Prettier
```

---

## Project Structure

```
src/
├── routes/                 # File-based routes (TanStack Router)
│   ├── index.tsx           # Public welcome/home page
│   ├── about.tsx           # About us
│   ├── location.tsx        # Company location (map)
│   ├── privacy.tsx         # Privacy policy
│   ├── terms.tsx           # Terms & conditions
│   ├── vacancies/          # Public vacancies portal
│   ├── auth.tsx            # Trainee sign-in / registration
│   ├── facilitator-login.tsx
│   └── _authenticated/     # Protected area (trainee, facilitator & admin)
├── components/             # Shared UI (header, footer, admin dialogs)
├── integrations/supabase/  # Generated Supabase clients & types
├── lib/                    # Helpers, schemas, queries
└── styles.css              # Tailwind v4 theme & design tokens
supabase/
├── migrations/             # SQL schema + RLS policies + seed data
└── config.toml             # Supabase project config
```

## License

All rights reserved. This repository is for evaluation purposes; no license is granted for reuse or redistribution.
