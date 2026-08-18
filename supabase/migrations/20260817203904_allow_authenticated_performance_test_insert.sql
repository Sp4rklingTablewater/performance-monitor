grant insert on table public.performance_tests to authenticated;

create policy "authenticated users can insert performance tests"
    on public.performance_tests
    for insert
    to authenticated
    with check (true);