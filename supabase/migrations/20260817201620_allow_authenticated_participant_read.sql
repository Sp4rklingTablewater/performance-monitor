grant select on table public.participants to authenticated;

create policy "authenticated users can read participants"
    on public.participants
    for select
    to authenticated
    using (true);
