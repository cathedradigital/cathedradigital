-- Estudar: public reads must expose only active journeys and their steps.
drop policy if exists "journeys_public_read" on public.journeys;
create policy "journeys_public_read"
on public.journeys
for select
to public
using (is_active = true);

drop policy if exists "journey_steps_public_read" on public.journey_steps;
create policy "journey_steps_public_read"
on public.journey_steps
for select
to public
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_steps.journey_id
      and j.is_active = true
  )
);
