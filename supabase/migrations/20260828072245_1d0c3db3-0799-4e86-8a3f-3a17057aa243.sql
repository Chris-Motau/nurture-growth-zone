-- COURSES
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  facilitator_name text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- LESSONS
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_number integer NOT NULL DEFAULT 1,
  topic text NOT NULL,
  overview_md text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage lessons" ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- MODULES
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  topic text NOT NULL,
  content_md text NOT NULL DEFAULT '',
  video_url text,
  duration_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage modules" ON public.modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  topic text NOT NULL,
  instructions_md text NOT NULL DEFAULT '',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- MODULE COMPLETIONS
CREATE TABLE public.module_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_completions TO authenticated;
GRANT ALL ON public.module_completions TO service_role;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own completions" ON public.module_completions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff view completions" ON public.module_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- TASK SUBMISSIONS
CREATE TABLE public.task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submission_url text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_submissions TO authenticated;
GRANT ALL ON public.task_submissions TO service_role;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own submissions" ON public.task_submissions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff view submissions" ON public.task_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'facilitator') OR public.has_role(auth.uid(),'admin'));

-- updated_at triggers
CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lessons_set_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER modules_set_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tasks_set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER module_completions_set_updated_at BEFORE UPDATE ON public.module_completions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER task_submissions_set_updated_at BEFORE UPDATE ON public.task_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DEMO CONTENT
INSERT INTO public.courses (id, title, description, start_date, end_date, facilitator_name, position) VALUES
 ('11111111-1111-4111-8111-111111111101','Web Development Fundamentals','HTML, CSS and responsive layout foundations for the Hamonate programme.','2026-08-03','2026-09-25','Thandi Mokoena',1),
 ('11111111-1111-4111-8111-111111111102','JavaScript Essentials','Core JavaScript, the DOM and asynchronous programming.','2026-08-17','2026-10-16','Sipho Dlamini',2),
 ('11111111-1111-4111-8111-111111111103','React & Modern Tooling','Component thinking, state management and shipping React apps.','2026-09-07','2026-11-20','Thandi Mokoena',3);

INSERT INTO public.lessons (id, course_id, lesson_number, topic, overview_md, duration_minutes) VALUES
 ('22222222-2222-4222-8222-222222222201','11111111-1111-4111-8111-111111111101',1,'Structuring pages with HTML','## Lesson 1 — Structuring pages with HTML

In this lesson you learn how a browser reads your markup.

- Semantic elements and why they matter
- Document outline and accessibility
- Forms and inputs',90),
 ('22222222-2222-4222-8222-222222222202','11111111-1111-4111-8111-111111111101',2,'Styling and responsive layout','## Lesson 2 — Styling and responsive layout

Make the page look right on **every** screen.

- The cascade and specificity
- Flexbox and Grid
- Mobile-first breakpoints',120),
 ('22222222-2222-4222-8222-222222222203','11111111-1111-4111-8111-111111111102',1,'JavaScript language basics','## Lesson 1 — JavaScript language basics

- Values, types and variables
- Functions and scope
- Arrays and objects',110),
 ('22222222-2222-4222-8222-222222222204','11111111-1111-4111-8111-111111111102',2,'Async JavaScript and APIs','## Lesson 2 — Async JavaScript and APIs

- Callbacks, promises and `async/await`
- `fetch` and JSON
- Error handling',100),
 ('22222222-2222-4222-8222-222222222205','11111111-1111-4111-8111-111111111103',1,'Thinking in components','## Lesson 1 — Thinking in components

- Props and composition
- State and events
- Lists and keys',130);

INSERT INTO public.modules (lesson_id, position, topic, content_md, video_url, duration_minutes) VALUES
 ('22222222-2222-4222-8222-222222222201',1,'Semantic HTML elements','### Semantic HTML

Use elements that describe meaning, not appearance.

```html
<header>, <nav>, <main>, <article>, <footer>
```

Screen readers and search engines both rely on this structure.','https://www.youtube.com/watch?v=kUMe1FH4CHE',30),
 ('22222222-2222-4222-8222-222222222201',2,'Document outline & accessibility','### Headings and landmarks

One `h1` per page, headings in order, and labels on every input.',NULL,25),
 ('22222222-2222-4222-8222-222222222201',3,'Forms and inputs','### Forms

Pair every `input` with a `label`, and choose the right `type` so mobile keyboards adapt.',NULL,35),
 ('22222222-2222-4222-8222-222222222202',1,'The cascade and specificity','### The cascade

Specificity decides which rule wins. Keep selectors flat and predictable.',NULL,40),
 ('22222222-2222-4222-8222-222222222202',2,'Flexbox and Grid','### Layout

Flexbox for one dimension, Grid for two.',NULL,45),
 ('22222222-2222-4222-8222-222222222202',3,'Mobile-first breakpoints','### Responsive design

Start at the smallest screen and add breakpoints upward with `min-width` media queries.',NULL,35),
 ('22222222-2222-4222-8222-222222222203',1,'Values, types and variables','### Types

`string`, `number`, `boolean`, `null`, `undefined`, `object`, `symbol`, `bigint`.',NULL,35),
 ('22222222-2222-4222-8222-222222222203',2,'Functions and scope','### Functions

Declarations, expressions, arrow functions and closures.',NULL,40),
 ('22222222-2222-4222-8222-222222222203',3,'Arrays and objects','### Collections

`map`, `filter`, `reduce` and object destructuring.',NULL,35),
 ('22222222-2222-4222-8222-222222222204',1,'Promises and async/await','### Async

```js
const res = await fetch(url);
const data = await res.json();
```',NULL,45),
 ('22222222-2222-4222-8222-222222222204',2,'Working with fetch and JSON','### Fetch

Always check `res.ok` before parsing.',NULL,30),
 ('22222222-2222-4222-8222-222222222205',1,'Props and composition','### Components

Small components, composed together, beat one large component.',NULL,45),
 ('22222222-2222-4222-8222-222222222205',2,'State and events','### State

`useState` holds values that change over time.',NULL,45),
 ('22222222-2222-4222-8222-222222222205',3,'Lists and keys','### Lists

Give each item a stable `key` so React can track it.',NULL,40);

INSERT INTO public.tasks (lesson_id, topic, instructions_md, due_date) VALUES
 ('22222222-2222-4222-8222-222222222201','Build a semantic profile page','Build a single page CV using only semantic HTML. Push it to GitHub and submit the repository link.','2026-09-05T17:00:00Z'),
 ('22222222-2222-4222-8222-222222222202','Responsive landing page','Recreate the provided design so it works on mobile, tablet and desktop. Submit your GitHub repository link.','2026-09-19T17:00:00Z'),
 ('22222222-2222-4222-8222-222222222203','JavaScript kata set','Complete the ten katas in the starter repository and submit your fork link.','2026-09-12T17:00:00Z'),
 ('22222222-2222-4222-8222-222222222204','Fetch a public API','Build a small app that fetches and renders data from a public API, handling loading and error states.','2026-10-03T17:00:00Z');