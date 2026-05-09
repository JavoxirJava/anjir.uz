create table if not exists public.test_games (
  test_id uuid not null references public.tests(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  primary key (test_id, game_id)
);

create index if not exists idx_test_games_test on public.test_games(test_id);
create index if not exists idx_test_games_game on public.test_games(game_id);
