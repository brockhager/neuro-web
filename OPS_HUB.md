# NeuroSwarm Operations Hub (Ops UI)

This page implements the NeuroSwarm Operations Hub — a single-pane operational dashboard for Users, Admins, and Validators. It is available at the route `/ops-hub` in the `neuro-web` Next.js app.

How to run locally (from repo root)

```powershell
cd neuro-web
pnpm install
pnpm dev
# Open http://localhost:3000/ops-hub
```

Notes
- The hub page uses mocked data for visualizations and metrics. Integrate with router-api or Prometheus endpoints to display real-time data.
 - The hub page can now fetch live Prometheus metrics from the Router API via a local proxy route at `/api/metrics`.
 	You can override the target Router API host using the `ROUTER_API_URL` environment variable (e.g. export ROUTER_API_URL="http://localhost:3000").

RBAC / Role Simulation
-----------------------
The Ops Hub includes a small mock RBAC role selector in the top-right of the UI (Role: User | Validator | Admin) so you can preview how pages render for different classes of operator.

- Admin: full access to Admin & Reconciliation dashboard and can view sensitive metrics.
- Validator: access to validator tooling & queue views (Admin view is locked).
- User: access to user/job submission and status only.

This is a mock client-side role toggle for demo/testing only. In production, replace with real authentication and authorization (JWT/session + server-side RBAC checks) before deploying.

Server-side metrics protection (demo)
-----------------------------------
To protect `/api/metrics` in this demo, the server-side route expects a secret token (environment variable `ADMIN_METRICS_SECRET`).

- Server (Next.js runtime): set `ADMIN_METRICS_SECRET` to a value (example: `ns-admin-ops-token-12345`).
- Client (demo): set `NEXT_PUBLIC_ADMIN_METRICS_TOKEN` to the same value so the Admin UI can fetch metrics from `/api/metrics`.

Important: Using a PUBLIC env var is only for demo/staging. Do NOT store real secrets in public client variables in production — use server-side sessions, JWTs and secure cookies, and perform RBAC checks on the server.
- Icons come from `lucide-react` which is already included in `neuro-web/package.json`.

If you'd like, I can add a data-fetching layer to surface live metrics from the Router API and wire up Grafana dashboard links from Ctrl/ops flows.
