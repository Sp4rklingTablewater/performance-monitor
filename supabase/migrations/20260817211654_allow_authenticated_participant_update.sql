grant update on table public.participants to authenticated;

drop policy if exists "authenticated users can update participants"
    on public.participants;

create policy "authenticated users can update participants"
    on public.participants
    for update
    to authenticated
    using (true)
    with check (true);