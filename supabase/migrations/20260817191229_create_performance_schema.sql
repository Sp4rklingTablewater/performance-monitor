create type public.participant_type as enum ('athlete', 'reference');

create table public.participants (
                                     id uuid primary key default gen_random_uuid(),
                                     name text not null,
                                     birth_year smallint,
                                     participant_type public.participant_type not null default 'athlete',
                                     active boolean not null default true,
                                     created_at timestamptz not null default now(),

                                     constraint participants_birth_year_check
                                         check (birth_year is null or birth_year between 1900 and 2100)
);

create table public.performance_tests (
                                          id uuid primary key default gen_random_uuid(),
                                          participant_id uuid not null
                                              references public.participants(id)
                                                  on delete cascade,

                                          test_date date not null,
                                          age_group text,

                                          reach_height_cm smallint,
                                          jump_reach_cm smallint,
                                          sprint_93639_seconds numeric(5, 2),
                                          ball_control_count integer,

                                          notes text,
                                          created_at timestamptz not null default now(),

                                          constraint performance_tests_reach_height_check
                                              check (reach_height_cm is null or reach_height_cm > 0),

                                          constraint performance_tests_jump_reach_check
                                              check (jump_reach_cm is null or jump_reach_cm > 0),

                                          constraint performance_tests_jump_consistency_check
                                              check (
                                                  reach_height_cm is null
                                                      or jump_reach_cm is null
                                                      or jump_reach_cm >= reach_height_cm
                                                  ),

                                          constraint performance_tests_sprint_check
                                              check (sprint_93639_seconds is null or sprint_93639_seconds > 0),

                                          constraint performance_tests_ball_control_check
                                              check (ball_control_count is null or ball_control_count >= 0)
);

create index performance_tests_participant_id_idx
    on public.performance_tests(participant_id);

create index performance_tests_test_date_idx
    on public.performance_tests(test_date);

alter table public.participants enable row level security;
alter table public.performance_tests enable row level security;