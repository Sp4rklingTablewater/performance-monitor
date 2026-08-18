grant delete on table public.performance_tests to authenticated;

create policy "authenticated users can delete performance tests"
    on public.performance_tests
    for delete
    to authenticated
    using (true);