# Connect & Collaborate

I'm working on my final year Cs thesis my topic is design and implementation of a student collaboration platform

Deliverables roadmap for mvp :

Alright. We’re in build mode now.



Student Collaboration System — Build Blueprint



1. Product overview



What it is



A web app that helps students find collaborators for projects, competitions, and skill-based work.



Core problem



Students often need people with specific skills like frontend, backend, UI/UX, documentation, or research, but the current method of finding collaborators is messy and informal.



Main idea



One student posts a collaboration request. Other students browse and apply. The post owner reviews applicants and accepts or rejects them. Once accepted, contact info is revealed.





---



2. MVP features



This is your version 1. Keep it lean.



Must-have



User registration



User login/logout



User profile creation



Create collaboration post



View all collaboration posts



View single post details



Apply to a post



View applications on your own post



Accept or reject applications



Reveal collaborator contact info after acceptance





Not for MVP



Real-time chat



Notifications



File upload



Admin dashboard



AI matching



Team chatrooms



Ratings/reviews





That extra stuff is how projects start acting possessed.





---



3. User roles



For now, just one real role:



Student



Can:



register/login



edit profile



create post



browse posts



apply to posts



manage applications on their own posts





That’s enough. Do not add admin unless you actually need it.





---



4. Core user flows



Flow 1: Registration and login



User opens app



Clicks sign up



Fills form



Creates account



Logs in



Redirected to dashboard





Flow 2: Profile setup



User adds:



full name



department



level



skills



bio



contact info







Flow 3: Create collaboration post



User clicks “Create Post”



Enters:



title



description



required skills



category



maybe team size needed





Submits post



Post appears in browse feed





Flow 4: Browse and apply



Another user views posts



Opens post details



Clicks apply



Adds short message



Submits application





Flow 5: Manage applicants



Post owner opens “My Posts” or “Applications”



Sees applicants



Accepts or rejects



If accepted, system reveals contact info







---



5. Pages/screens



These are your frontend pages.



Public pages



Landing page



Sign up page



Login page





Protected pages



Dashboard



Browse posts page



Post details page



Create post page



My posts page



Applications page



Profile page



Edit profile page







---



6. Page-by-page breakdown



Landing Page



Purpose:



explain app



push users to sign up/login





Sections:



hero



short explanation



key features



CTA buttons





Sign Up Page



Fields:



full name



email



password



confirm password





Login Page



Fields:



email



password





Dashboard



Show:



welcome message



quick stats maybe



shortcut buttons:



create post



browse posts



profile



my posts







Browse Posts Page



Show:



list of collaboration posts



search bar



maybe filters by skill/category later





Each card:



title



short description



required skills



creator name



date





Post Details Page



Show:



full title



description



required skills



category



creator info



apply button





Create Post Page



Fields:



title



description



required skills



category



number of collaborators needed



contact preference optional





My Posts Page



Show:



all posts created by logged-in user



each post should show:



number of applicants



status



edit/delete optional later







Applications Page



Show:



applicants for a post



their profile summary



message



accept button



reject button





Profile Page



Show:



full name



department



level



skills



bio



contact info





Edit Profile Page



Editable fields:



full name



department



level



skills



bio



contact info







---



7. Database design



We’ll keep this simple and sane.



Table 1: users



Fields:



id



full_name



email



password_hash



department



level



skills



bio



contact_info



created_at



updated_at





Notes



email should be unique



skills can start as text for simplicity



later you can normalize skills if needed







---



Table 2: collaboration_posts



Fields:



id



user_id



title



description



required_skills



category



slots_needed



status



created_at



updated_at





Notes



user_id references users.id



status can be:



open



closed









---



Table 3: applications



Fields:



id



post_id



applicant_id



message



status



created_at



updated_at





Notes



post_id references collaboration_posts.id



applicant_id references users.id



status can be:



pending



accepted



rejected









---



Optional future table: accepted_collaborators



You probably do not need this now unless you want more tracking.



For MVP, applications.status = accepted is enough.





---



8. Relationships



One user can create many collaboration posts



One collaboration post can have many applications



One user can submit many applications



One application belongs to one post and one applicant





So basically:



users 1 → many collaboration_posts



users 1 → many applications



collaboration_posts 1 → many applications







---



9. Backend modules



Your backend should have these logical parts:



Auth module



Handles:



signup



login



logout if using session/cookie



token verification if using JWT





User module



Handles:



get profile



update profile





Post module



Handles:



create post



get all posts



get single post



get current user posts





Application module



Handles:



apply to post



get applications for a post



accept application



reject application







---



10. Suggested API routes



Auth routes



POST /api/auth/signup



POST /api/auth/login



GET /api/auth/me





User routes



GET /api/users/profile



PUT /api/users/profile





Post routes



POST /api/posts



GET /api/posts



GET /api/posts/:id



GET /api/posts/my-posts





Application routes



POST /api/posts/:id/apply



GET /api/posts/:id/applications



PATCH /api/applications/:id/accept



PATCH /api/applications/:id/reject





That’s enough. Don’t invent 40 routes because you’re feeling ambitious.





---



11. Tech stack



Frontend



HTML



Tailwind CSS



Vanilla JavaScript





Backend



Node.js



Express.js





Database



PostgreSQL





Auth



JWT or session-based auth





For your case, JWT is probably easier for learning modern structure.



Dev tools



VS Code



Postman or Thunder Client



pgAdmin or psql



nodemon





---



12. Suggested folder structure



Backend



backend/

│

├── src/

│   ├── config/

│   │   └── db.js

│   ├── controllers/

│   │   ├── authController.js

│   │   ├── userController.js

│   │   ├── postController.js

│   │   └── applicationController.js

│   ├── middleware/

│   │   └── authMiddleware.js

│   ├── routes/

│   │   ├── authRoutes.js

│   │   ├── userRoutes.js

│   │   ├── postRoutes.js

│   │   └── applicationRoutes.js

│   ├── utils/

│   │   └── generateToken.js

│   └── server.js

│

├── package.json

└── .env



Frontend



frontend/

│

├── public/

│   ├── index.html

│   ├── signup.html

│   ├── login.html

│   ├── dashboard.html

│   ├── browse-posts.html

│   ├── post-detail.html

│   ├── create-post.html

│   ├── my-posts.html

│   ├── applications.html

│   ├── profile.html

│   ├── edit-profile.html

│   ├── css/

│   │   └── styles.css

│   └── js/

│       ├── auth.js

│       ├── dashboard.js

│       ├── posts.js

│       ├── applications.js

│       └── profile.js



If you want one-port serving later, you can merge frontend into Express public folder. But while building, separate is fine.



---

13. Development phases

Phase 1: Project setup

create backend folder

install Express and dependencies

connect PostgreSQL

create frontend files

setup Tailwind



Phase 2: Authentication

signup endpoint

login endpoint

JWT auth middleware

signup/login pages



Phase 3: Profile system

get profile

update profile

profile page

edit profile page



Phase 4: Collaboration posts

create post

fetch all posts

fetch single post

browse posts page

create post page



Phase 5: Applications

apply to post

view applicants

accept/reject

applications page



Phase 6: Polish and testing

form validation

better UI

edge case handling

test full flow

---



14. MVP success checklist

Your app is “done enough” when:

user can register

user can login

user can update profile

user can create a collaboration post

another user can browse posts

another user can apply

post owner can accept/reject

accepted applicant can access contact info

That’s your win condition.

Not perfection. Just complete flow.

---



15. Important product decisions

These are the choices we are making now to avoid future chaos.

No messaging

Reason:

too much complexity

not needed for MVP

Contact revealed after acceptance

Reason:

easier than building chat

still solves connection problem

Skills stored as text for now

Reason:

faster to build

can improve later

One main role only

Reason:

simpler architecture

less auth headache

---



16. Possible categories for posts

You can hardcode some categories like:

Web Development

Mobile Development

UI/UX Design

Documentation

Research

Data Analysis

Cybersecurity

General

This helps posts feel structured.





---

17. Risks to avoid while building

spending 3 days designing the perfect landing page before backend exists

adding chat because “it would be cool”

changing database structure every 10 minutes

trying to build everything at once

skipping auth and pretending you’ll come back later

That path leads to premium suffering.

---



18. Best build order



This is the exact order I’d recommend:

1. Setup backend server

2. Setup database and tables

3. Build signup/login backend

4. Build signup/login frontend

5. Build auth protection

6. Build profile backend/frontend

7. Build create post backend/frontend

8. Build browse posts backend/frontend

9. Build apply system

10. Build accept/reject system

11. Polish UI

12. Test full user journey

Let me share my repo with u to see what I've done

I've locked in dB, backend and I tested via Postman, I'm working on so.e frontend screens

https://github.com/iamthepxlronin/student-collab/tree/main

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4b3a3c99-a30e-4c85-83df-bdc67ceb5dc9).

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
