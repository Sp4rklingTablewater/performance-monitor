grant insert on table public.participants to authenticated;

create policy "authenticated users can insert participants"
    on public.participants
    for insert
    to authenticated
    with check (true);