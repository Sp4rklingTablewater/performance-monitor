grant update on table public.performance_tests to authenticated;

create policy "authenticated users can update performance tests"
    on public.performance_tests
    for update
    to authenticated
    using (true)
    with check (true);