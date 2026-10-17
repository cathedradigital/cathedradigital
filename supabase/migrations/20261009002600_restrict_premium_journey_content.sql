-- Do not expose paid journey step JSON to anonymous or non-premium clients.
-- A client-side lock/blur is presentation only; authorization belongs in RLS.

drop policy if exists journey_steps_public_read on public.journey_steps;
drop policy if exists journey_steps_free_read on public.journey_steps;
drop policy if exists journey_steps_premium_read on public.journey_steps;

create policy journey_steps_free_read
on public.journey_steps
for select
to public
using (
  is_free = true
  and exists (
    select 1
    from public.journeys j
    where j.id = journey_steps.journey_id
      and j.is_active = true
  )
);

create policy journey_steps_premium_read
on public.journey_steps
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_steps.journey_id
      and j.is_active = true
  )
  and (
    is_free = true
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.is_premium = true
    )
  )
);

comment on policy journey_steps_free_read on public.journey_steps is
  'Only free steps of active journeys are visible to anonymous/public clients.';
comment on policy journey_steps_premium_read on public.journey_steps is
  'Authenticated users may read free steps; premium content requires a premium profile. Admins retain access through journey_steps_admin_all.';
