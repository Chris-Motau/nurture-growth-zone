# Learn Flow

Edit

Sprint 1: Build a welcome page

 

Deliverables:

·         Welcome page design:

o    LMS description section

o    Company Location.

o    Key highlights & ratings

o    LMS logo & name

o    Contact info & social links

o    Terms & Conditions / Privacy Policy links

o    Instructions to what the system is about

·         Routing setup (React Router)

·         Responsive navigation between Home, about us, privacy & policy, company location -Nav-Link preferred

Description

Edit

Sprint 2: Project Setup & Authentication (Registration + Login)

Goal: Establish project structure, environment setup, and core authentication features for both Management, Facilitator and trainee.

Deliverables:

Initialize project repository and structure (frontend + backend folders)

Setup firebase (management, trainee and Facilitator)

Implement Management, Facilitator and Trainee registration:

NB: Facilitators must register their supported trainees into the system using their emails only.

NB: When trainees log in to the system, they can start by verifying their email against the one inputted by their facilitator (for first time log-in) then as everyone can:

·         Both register on the system using (picture(optional), name, surname, email, password)

·         Validation (unique email, required fields)

·         Pop-ups for success/failure

Implement login for both Trainee/Facilitator and management:

·         Require Email and Password

·         “Show password” toggle

·         Remember me checkbox

·         Forgot password link

·         Error handling for invalid credentials

Basic responsive UI for login/register pages

Connect frontend forms to backend authentication API

Team Focus:

·         Front-end: React forms, validation, and pop-ups

Description

Edit

NB: Use static information for data expected from trainee side e.g trainees, submission links etc.

Admin can see or view Trainees registered on the system.

·         See their attendance status(dummy data)

·         See their submission status

·         See their overall performance

·         NB: this is done per trainee

Admin view Trainee design UI/UX

Admin view trainee frontend logic

Admin view trainee backend logic

Admin trainee submissions:

·         When admin clicks on submissions list trainees.

·         When Admin clicks on the trainee they should see their git-hub submission links based on a lesson

Admin trainee submissions design UI/UX

Admin trainee submissions frontend logic

Admin trainee submissions backend logic

Admin should enter Trainee attendance data:

When facilitator clicks on attendance :

·         Admin should be able to create meeting( can enter topic and content to be covered during meeting)

·         Allow admin to save meeting and meeting should be listed after creation.(Many meetings)

Admin should enter Trainee attendance data design & UI/UX

Admin should enter Trainee attendance data Frontend logic

Admin should enter Trainee attendance data backend logic

Create table meetings firebase

When admin clicks on saved meeting:

·         A list of Registered trainees should appear.

·         Facilitator should be able to select students who attended the meeting and add them on attendance register.

When admin clicks on saved meeting UI/UX

When admin clicks on saved meeting frontend logic

When admin clicks on saved meeting backend logic

Admin add course/lesson/module:

·         As Admin I should enter course, module & lesson topic

·         Admin should enter course start and end date, system should display number of modules per course and name of facilitator carrying out the lesson

·         1 lesson can have many modules so each module added under lesson should have a sub topic

·         Allow admin to add video URL or enter text based content OR upload document per module.

·         Show duration of a module/ whole lesson

·         Add a task/tasks under each lesson covered(This is optional hence a lesson might not have a task).

Admin add course/lesson/module Design & UI/UX

Admin add course/lesson/module Frontend logic

Admin add course/lesson/module backend logic

Create tables on Firebase Course/lesson/module

Allow admin to view lesson, task, module:

·         Allow Facilitator to hide/edit/remove lesson, a module and a task

·         Use alert modal to confirm removal.

·         Admin can edit content or topic of a module/lesson/task

Allow admin to view lesson, task, module design & UI/UX

Allow admin to view lesson, task, module frontend logic

Allow admin to view lesson, task, module backend logic

Create admin profile:

·         Admin can view/edit their registration information

o    Admin Can logout of the system

Admin profile design & UI/UX

Admin profile frontend logic

Admin profile backend logic

Description

Edit

Goal: To create a fully functional trainee dashboard that allows them to view course content, learning progress, outstanding tasks, and submit github links.

Trainee must see courses to be covered:

·         Display course topic.

·         Display course start and end date.

·         Display facilitator name (whom will be carrying out the course)

·         CAN include number of modules available per course.

·         Trainee should see learning progress per course (This is based on modules completed)

Trainee must see courses to be covered UI/UX and Design

Trainee must see courses to be covered frontend logic

Trainee must see courses to be covered backend logic

When Trainee clicks or selects a course:

·         Display lessons in Markdown format (lesson is complete if modules are complete)

·         Display lesson topic or number e.g lesson 1 etc.

·         CAN display lesson duration and modules to be covered.

When Trainee clicks or selects a course UI/UX and design

When Trainee clicks or selects a course frontend logic

When Trainee clicks or selects a course backend logic

When Trainee clicks lesson:

·         Display modules in Markdown format.

·         Display each and every module topic.

When Trainee clicks lesson UI/UX and Design

When Trainee clicks lesson frontend logic

When Trainee clicks lesson backend logic

When Trainee clicks a module:

·         Show learning vedio or content

·         Note: The module should be marked as complete. Complete modules = complete lesson. Complete lessons = complete course

When Trainee clicks a module UI/UX and Design

When Trainee clicks a module frontend logic

When Trainee clicks a module backend logic

Allow trainee to submit task link per lesson:

·         Allow trainee to see task instructions (instructions, task end date,task topic etc)

·         Allow trainee to input submission link

·         Allow trainee to submit by clicking submit.

Allow trainee to submit task link per lesson UI/UX and design

Allow trainee to submit task link per lesson frontend logic

Allow trainee to submit task link per lesson backend logic

Allow trainee to see/be alert of outstanding tasks:

·         Show how many tasks are not submitted

·         When user clicks on alert can see task/s details

Allow trainee to see/be alert of outstanding tasks design and UI/UX

Allow trainee to see/be alert of outstanding tasks Frontend logic

Allow trainee to see/be alert of outstanding tasks backend logic

Trainee can access their profile:

·         Allow trainee to edit their profile information

·         Allow trainee to logout.

Trainee can access their profile UI/UX and design

Trainee can access their profile frontend logic

Trainee can access their profile backend logic

On the homepage Hero Section

Add an View available vacancies button.

When applicant clicks on view available vacancies button:

Show available vacancies categorized per program under (Work Integrated Learning, Internship & Learnership)

When applicant clicks a listed program:

Display an application form requiring the following documents as pdf: 

1. Proof of account(Required)

2. SARS document(Required)

3. ID(Required)

4. Confirmation of unemployment affidavit(Required)

5. Resume(Required)

6. Matric Certificate(Required)

7. Qualification(Optional)

8. Academic Record(Optional)

9. Other Certificates(Optional)

For now let me acces this without login for testing purposes
Create an Admin Dashboard:
The admin should be able to post Vacancies that are available per program category(Work Integrated learning, Internship & learnership):
- Admin should input:
  - program title.
  - Program description
  - Closing date.
  - Program duration.
- Allow admin to edit/hide/Delete posts
The admin should be able to view applications submitted by applicants.
 - Display number of applications received per category .
 - When admin clicks on listed category display applicants using their names in a numbered format and the option to either            decline/approve application
 - When admin clicks on listed applicant list the documents the applicant has submitted(as per field in which the applicant submitted e.g ID, Proof of Account etc. Once Admin clicks on listed applicant change Application status to underreview.
 - Allow admin to view and download listed documents
 - 



 Admin and tranee dashboard will be in seperate repositories so its better to start with trainee dasboard we will utilize firebase as backened 

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "@secret:GOOGLE_API_KEY ",
  authDomain: "findataxi-57cf7.firebaseapp.com",
  projectId: "findataxi-57cf7",
  storageBucket: "findataxi-57cf7.firebasestorage.app",
  messagingSenderId: "847716485847",
  appId: "1:847716485847:web:5e3ecea90518b9c227be92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/82f9330f-78af-4158-82cb-8953e99b433b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
- Extract the attendance as pdf, excel
