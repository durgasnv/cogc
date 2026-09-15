# Cook or Get Cooked — Event Controller

A full-stack Next.js app for running the live event: an **admin/controller app** for you (the
host) and a **participant app** for teams. Built for Vercel, using Upstash Redis for shared,
persistent state so the admin and every team's device stay in sync in real time.

Netflix-styled (black, red, bold cinematic type). Team login is name + a PIN you hand out.
Round 2's set assignment is randomized and locked server-side — teams never see or choose their
set, so there's nothing to coordinate around. Round 3 is server-validated: the correct 9-digit
combination for each team's debugging problems lives only on the server, never sent to the
browser, and the "first team to unlock the chest" check is atomic (two teams can't both win a race).

---

## What's inside

- **Round 2**: 30 unique 35-question sets (1,050 questions total, zero repeats), split across
  three elimination phases — Groups of 4 → Groups of 3 → Groups of 2 — exactly matching your
  40 → 30 → 20 → 10 team bracket. Each round is a 60-second sprint: answer as many as you can,
  +100 correct / −25 wrong, bonus questions double.
- **Round 3**: 10 pre-verified debugging problems (one set per finalist team), each with a
  genuine bug that was actually compiled and run to confirm the buggy version fails and the
  fixed version prints the right binary clue. Solve all 3, decode the binary-to-decimal
  combination, unlock the chest.
- **Admin app**: add teams (auto-generates PINs), randomize + lock group/set assignments per
  phase, watch a live leaderboard, flag likely eliminations, assign the final 10 to Round 3,
  and reveal the host-only answer key.

## What this is *not*

This is a working MVP built for a single college event, not a hardened production SaaS product.
A few honest limitations:
- **No automatic elimination.** The leaderboard flags the lowest scorer per group once everyone's
  finished, but you make the actual call (ties, disputes) and manually select who advances in the
  next phase's tab.
- **Client-submitted scores.** A team's final score is computed in their browser and POSTed once.
  There's no server-side re-verification of every answer. Fine for a college fest; not something
  you'd want for a high-stakes exam.
- **Session cookies, not a full user system.** Good enough for a few-hour event; sessions last
  8 hours (admin) / 6 hours (teams).

---

## 1. Set up a GitHub repo (so Vercel can deploy from it)

I couldn't push this for you directly — no GitHub connector is available in this environment.
From the folder you unzipped:

```bash
cd cook-or-get-cooked
git init
git add .
git commit -m "Initial commit — Cook or Get Cooked event app"
```

Create a new empty repo on GitHub (github.com → New repository → do **not** initialize with a
README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 2. Create a Vercel account and project

1. Go to [vercel.com](https://vercel.com) and sign up (the "Continue with GitHub" option is
   easiest — it'll let Vercel see your repos in the next step).
2. From your Vercel dashboard, click **Add New → Project**.
3. Pick the GitHub repo you just pushed. Vercel auto-detects it's a Next.js app — you don't need
   to change any build settings.
4. **Don't click Deploy yet** — first add the environment variables below, or the app will build
   but crash at runtime with a clear "not configured" error the moment anyone hits a page that
   needs the database or a password.

## 3. Add environment variables

In the Vercel project's **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `ADMIN_PASSWORD` | Whatever password you want for the controller login. Only share this with whoever's running the event. |
| `SESSION_SECRET` | Any long random string (e.g. run `openssl rand -hex 32` locally, or just mash the keyboard for 40+ characters). Used to sign login sessions. |

## 4. Add Upstash Redis (the shared database)

This is what makes the admin app and every participant's phone see the same live state.

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database**, choose **Upstash** (Redis), pick the free tier, and **Connect** it
   to this project.
3. Vercel automatically adds the right environment variables for you — you don't need to copy
   anything manually. (If your Vercel dashboard names them `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` instead of `KV_REST_API_URL` / `KV_REST_API_TOKEN`, that's fine —
   the app checks for both names.)

## 5. Deploy

Back in the project's Deployments tab, click **Deploy** (or if you already deployed before
adding the env vars, click **Redeploy** so it picks them up). That's it — you'll get a live URL
like `your-project.vercel.app`.

From now on, every `git push` to `main` auto-deploys. To deploy from your terminal instead:

```bash
npm install -g vercel
vercel login
vercel link       # links this folder to the Vercel project you created
vercel --prod     # deploys straight to production
```

---

## 6. Running the event

1. **Before the event**: open `your-url.vercel.app/admin/dashboard`, log in with your admin
   password, go to the **Teams** tab, and paste in your full roster (one team name per line).
   Print or screenshot the PIN list and hand each team their PIN.
2. **Phase 1**: in the **Phase 1** tab, check the ~40 teams competing, click
   **"Randomize into groups of 4 & assign sets."** Teams refresh their dashboard
   (`your-url.vercel.app/participant/dashboard`) and see their assigned set appear — they click
   **Start round** whenever you say go.
3. Watch the **live leaderboard** in that same tab as teams finish. Once everyone in a group is
   done, decide eliminations and note who advances.
4. **Phase 2 / Phase 3**: same pattern — check the box next to the advancing teams, randomize,
   repeat, down to your final 10.
5. **Round 3**: in the **Round 3** tab, check exactly the 10 finalists, click
   **"Randomly assign debugging sets."** They'll see their 3 buggy programs and the combination
   keypad on `your-url.vercel.app/participant/round3`. You can **Reveal answer key** on the same
   tab to see every team's fixed code, target values, and correct combination — keep that off
   the shared projector screen.
6. First team to enter the correct 9-digit combination wins — everyone's dashboard reflects it
   automatically.

---

## Local development (optional)

If you want to run this on your own machine before deploying:

```bash
npm install
cp .env.example .env.local
# fill in ADMIN_PASSWORD, SESSION_SECRET, and the KV_REST_API_* values
# (copy the KV_REST_API_URL / KV_REST_API_TOKEN values from your Vercel project's
#  Storage tab — you need a real Upstash database connected even for local dev,
#  since there's no local-only fallback store)
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

```
app/
  page.js                     Landing page (role picker)
  admin/login, admin/dashboard    Controller app
  participant/login, dashboard,
    play, round3               Team-facing app
  api/admin/...                Admin-only endpoints (teams, phase assign, leaderboard, round3)
  api/team/...                 Team-facing endpoints (login, quiz, round3)
  globals.css                  Netflix-themed styling
lib/
  kv.js                        Redis client wrapper
  auth.js                      Session signing/verification, admin password check
  scoring.js                   Shared scoring constants
  round2Data.js, round3Data.js Data access helpers
  data/round2-sets.json        1,050 questions, 30 sets
  data/round3-debug.json       10 debugging slots (buggy/fixed code, targets, combinations)
```
