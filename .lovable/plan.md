
# StuCollab — Build Plan

Rebuild the platform inside this Lovable project using your existing 5 HTML screens as the visual anchor. The Node/Express + Postgres repo on GitHub stays as your thesis backend reference; this project becomes a working live demo on Lovable Cloud (managed Postgres + Auth + server functions).

## 1. Design system (port from your HTML)

Set up `src/styles.css` with your exact palette and fonts so every page matches what you already designed:

- **Fonts** (loaded via `<link>` in `__root.tsx`): Fraunces (serif, headings, italic accents), DM Sans (sans, body).
- **Color tokens** (Tailwind v4 `@theme` in `src/styles.css`):
  - `paper` #FAF7F2, `ink` #1A1A1A, `muted` #6B6B6B
  - `coral` #E85D3A, `sage` #87A878, `amber` #D4A574
  - `cream` #F2EDE5, `edge` #E8E0D4
- **Reusable utilities**: `.dot-grid` background, blob/blur decorative div pattern, rounded-3xl card style with `border-2 border-edge`.
- shadcn buttons/inputs restyled to match the coral pill button + rounded-2xl input look.

## 2. Backend (Lovable Cloud)

Enable Lovable Cloud and create these tables (with RLS + grants):

- `profiles` — `id` (FK auth.users), full_name, email, department, bio, avatar_url, contact (whatsapp/email), `skills text[]`. Auto-created via trigger on signup.
- `collaboration_posts` — id, owner_id, title, description, category, `required_skills text[]`, project_type, deadline, status (open/closed), created_at.
- `applications` — id, post_id, applicant_id, message, status (pending/accepted/rejected), created_at. Unique (post_id, applicant_id).

**RLS rules**:
- Profiles: anyone authenticated can read, owner can update.
- Posts: anyone authenticated can read open posts; only owner can update/delete.
- Applications: applicant + post owner can read; applicant can insert; only post owner can update status. Owner's contact info on the profile is only returned to an applicant whose application is `accepted`.

**Auth**: Email/password + Google sign-in via Lovable Cloud.

## 3. Routes (TanStack Start file routes)

Public:
- `/` — landing (rebuild of your `index.html`: navbar, hero, How it works, Features, Popular Skills, CTA, footer)
- `/auth` — combined login + signup tabs (rebuild of your `login.html` + `signup.html`)
- `/auth/forgot-password`, `/auth/reset-password`

Protected (`/_authenticated/`):
- `/dashboard` — sidebar + browse all open posts (rebuild of your `dashboard.html`: stats card, search, filters by skill/department/sort, posts grid)
- `/posts/new` — create post form
- `/posts/$postId` — post detail + apply button (or applications list if you're the owner)
- `/my-posts` — posts you created
- `/my-applications` — posts you've applied to with status badges
- `/profile/$userId` — public profile
- `/profile/edit` — edit own profile + skills

Shared sidebar component (Dashboard / Browse / My Posts / My Applications / Profile / Sign out).

## 4. Server functions (`createServerFn` + `requireSupabaseAuth`)

- `listOpenPosts({ search, skill, department, sort })`
- `getPost({ postId })` — includes owner profile minus contact unless caller is accepted applicant or owner
- `createPost(...)`, `updatePost(...)`, `closePost(...)`
- `applyToPost({ postId, message })`
- `listMyApplications()`, `listApplicationsForPost({ postId })`
- `decideApplication({ applicationId, decision })` — owner only; on accept, contact becomes visible
- `getProfile({ userId })`, `updateProfile(...)`

## 5. Build order

1. Enable Lovable Cloud + run migration (tables, RLS, grants, profile trigger).
2. Port design tokens + fonts into `src/styles.css` and `__root.tsx`.
3. Landing page `/`.
4. `/auth` (email/password + Google) + forgot/reset password.
5. `_authenticated` layout + shared sidebar.
6. Profile (view + edit) — needed before posts so authors render correctly.
7. Create post + my posts.
8. Browse/dashboard with search and filters.
9. Post detail + apply flow.
10. Owner applications view + accept/reject + contact reveal.
11. My applications page.
12. Polish, empty states, mobile layout pass.

## What I need from you before I start

1. **Are these skills/departments OK?** Skills shown on landing: React, Python, UI/UX, Machine Learning, Node.js, Data Science, Mobile Dev, Backend. Departments from your signup: Computer Science, Cyber Security, Information Technology, Software Engineering. I'll use these unless you change them.
2. **Categories for posts** (your roadmap listed: Web Dev, Mobile, UI/UX, Docs, Research, Data, Cybersec, General) — keep that list?
3. **Contact field**: on accept, what should be revealed — email only, or email + WhatsApp number?

Once you confirm (or just say "go with defaults"), I'll switch to build mode and start with step 1.
