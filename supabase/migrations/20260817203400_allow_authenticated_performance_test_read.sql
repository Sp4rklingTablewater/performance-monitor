grant select on table public.performance_tests to authenticated;

create policy "authenticated users can read performance tests"
    on public.performance_tests
    for select
    to authenticated
    using (true);