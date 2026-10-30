# Authentication and authorization

## End-to-end flow

1. **Login** — the React application uses Supabase Auth. OAuth flows, password recovery, and session lifecycle are handled by Supabase rather than by application code that manually parses or stores provider tokens.
2. **Session** — `useAuth` listens to Supabase auth state changes. The Supabase client persists the session and refreshes tokens automatically.
3. **Access token** — for authenticated API calls, Supabase JS supplies the current session access token. Application middleware can also obtain the token and validate its claims before executing protected server functions.
4. **Request** — the browser sends the request through the Supabase client. The publishable key identifies the project; it is not a substitute for authorization.
5. **RLS** — database authorization is enforced by PostgreSQL Row Level Security using `auth.uid()` and server-trusted role checks. A valid JWT authenticates the caller; RLS decides which rows that caller may access.
6. **Admin path** — admin UI visibility is not an authorization boundary. Protected RPCs/functions must independently verify the authenticated identity and admin role. Service-role credentials must remain server-side.

## Token and credential rules

- `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose to the browser when RLS is correctly configured.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be prefixed with `VITE_` or shipped to a browser bundle.
- Do not trust a role, user id, or ownership value supplied by the browser when authorization can be derived from the authenticated JWT/database state.
- OAuth redirect URLs must be controlled by the Supabase project allowlist and application routes; avoid accepting arbitrary redirect destinations.

## Notifications hardening

Client reads and state changes are scoped by `user_id` and protected by RLS. The insert policy now requires `auth.uid() = user_id`, preventing one authenticated browser session from creating a notification for another user. System-generated notifications should be created by trusted server-side code using the service role or another explicitly authorized backend path.

## Security invariant

> Authentication establishes **who** is calling. RLS and explicit server-side authorization establish **what** that caller is allowed to do.

Any new table, RPC, or Edge Function should preserve this separation and include a regression test for cross-user access where applicable.
