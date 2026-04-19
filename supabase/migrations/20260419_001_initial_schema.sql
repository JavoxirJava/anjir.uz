-- =============================================================
-- anjir.uz — Boshlang'ich DB sxemasi
-- =============================================================

-- Extentions
create extension if not exists "uuid-ossp";

-- =============================================================
-- 1. FOYDALANUVCHILAR
-- =============================================================

create type user_role as enum ('super_admin', 'director', 'teacher', 'student');
create type user_status as enum ('pending', 'active', 'rejected');

-- Auth.users bilan bog'langan profil jadvali
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  phone       text not null unique,
  first_name  text not null,
  last_name   text not null,
  role        user_role not null default 'student',
  status      user_status not null default 'pending',
  created_at  timestamptz not null default now()
);

create index idx_users_role   on public.users(role);
create index idx_users_status on public.users(status);
create index idx_users_phone  on public.users(phone);

-- =============================================================
-- 2. MAKTAB VA SINFLAR
-- =============================================================

create table public.schools (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  director_id uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.classes (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  grade       smallint not null check (grade between 5 and 9),
  letter      char(1) not null check (letter ~ '^[A-Za-z]$'),
  created_at  timestamptz not null default now(),
  unique (school_id, grade, letter)
);

create index idx_classes_school on public.classes(school_id);

-- =============================================================
-- 3. FANLAR
-- =============================================================

create table public.subjects (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- Maktabga biriktirilgan fanlar
create table public.school_subjects (
  school_id  uuid not null references public.schools(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  primary key (school_id, subject_id)
);

-- O'qituvchining sinf+fan birikmalari
create table public.teacher_assignments (
  id         uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  school_id  uuid not null references public.schools(id) on delete cascade,
  class_id   uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unique (teacher_id, class_id, subject_id)
);

create index idx_ta_teacher  on public.teacher_assignments(teacher_id);
create index idx_ta_class    on public.teacher_assignments(class_id);

-- =============================================================
-- 4. O'QUVCHI PROFILLARI
-- =============================================================

create table public.student_profiles (
  user_id          uuid primary key references public.users(id) on delete cascade,
  school_id        uuid not null references public.schools(id),
  class_id         uuid not null references public.classes(id),
  approved_by      uuid references public.users(id) on delete set null,
  approved_at      timestamptz,
  rejection_reason text
);

create index idx_sp_class  on public.student_profiles(class_id);
create index idx_sp_school on public.student_profiles(school_id);

-- =============================================================
-- 5. ACCESSIBILITY PROFILLARI
-- =============================================================

create type tts_source_type as enum ('web_speech', 'google_tts', 'own_reader');
create type font_size_type  as enum ('small', 'medium', 'large', 'xlarge');
create type contrast_mode   as enum ('normal', 'high', 'dark');
create type color_blind_mode as enum ('normal', 'protanopia', 'deuteranopia', 'tritanopia');

create table public.accessibility_profiles (
  user_id            uuid primary key references public.users(id) on delete cascade,
  vision_mode        boolean not null default false,
  hearing_mode       boolean not null default false,
  motor_mode         boolean not null default false,
  tts_source         tts_source_type not null default 'web_speech',
  font_size          font_size_type  not null default 'medium',
  contrast_mode      contrast_mode   not null default 'normal',
  color_blind_mode   color_blind_mode not null default 'normal',
  reduce_motion      boolean not null default false,
  subtitles_always   boolean not null default false,
  screening_completed boolean not null default false,
  updated_at         timestamptz not null default now()
);

-- =============================================================
-- 6. MA'RUZALAR
-- =============================================================

create type content_type as enum ('pdf', 'video', 'audio', 'ppt');
create type subtitle_source as enum ('manual', 'ai');

create table public.lectures (
  id           uuid primary key default uuid_generate_v4(),
  creator_id   uuid not null references public.users(id) on delete cascade,
  school_id    uuid references public.schools(id) on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  class_id     uuid references public.classes(id) on delete cascade,
  title        text not null,
  description  text,
  content_type content_type not null,
  file_url     text not null,
  created_at   timestamptz not null default now()
);

create index idx_lectures_creator on public.lectures(creator_id);
create index idx_lectures_subject on public.lectures(subject_id);
create index idx_lectures_class   on public.lectures(class_id);

create table public.lecture_subtitles (
  id         uuid primary key default uuid_generate_v4(),
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  vtt_url    text not null,
  language   text not null default 'uz',
  source     subtitle_source not null default 'manual'
);

-- =============================================================
-- 7. VAZIFALAR (ASSIGNMENTS)
-- =============================================================

create table public.assignments (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.users(id) on delete cascade,
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  title       text not null,
  description text,
  file_url    text,
  deadline    timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_assignments_class on public.assignments(class_id);

create table public.assignment_submissions (
  id            uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.users(id) on delete cascade,
  text          text,
  file_url      text,
  submitted_at  timestamptz not null default now(),
  grade         smallint check (grade between 0 and 100),
  comment       text,
  unique (assignment_id, student_id)
);

-- =============================================================
-- 8. TESTLAR
-- =============================================================

create type test_type     as enum ('entry', 'post_topic', 'home_study');
create type question_type as enum ('single', 'multiple', 'true_false', 'fill_blank');

create table public.tests (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.users(id) on delete cascade,
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  title       text not null,
  description text,
  time_limit  smallint check (time_limit > 0),   -- daqiqada
  test_type   test_type not null default 'home_study',
  max_attempts smallint check (max_attempts > 0), -- null = cheksiz
  created_at  timestamptz not null default now()
);

create index idx_tests_teacher on public.tests(teacher_id);
create index idx_tests_subject on public.tests(subject_id);

create table public.test_classes (
  test_id  uuid not null references public.tests(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  primary key (test_id, class_id)
);

create table public.questions (
  id            uuid primary key default uuid_generate_v4(),
  test_id       uuid not null references public.tests(id) on delete cascade,
  question_text text not null,
  question_type question_type not null,
  image_url     text,
  image_alt     text,
  points        smallint not null default 1 check (points > 0),
  "order"       smallint not null default 0
);

create index idx_questions_test on public.questions(test_id);

create table public.question_options (
  id          uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct  boolean not null default false
);

create index idx_options_question on public.question_options(question_id);

create table public.test_attempts (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.users(id) on delete cascade,
  test_id     uuid not null references public.tests(id) on delete cascade,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  score       numeric(5,2) check (score between 0 and 100)
);

create index idx_attempts_student on public.test_attempts(student_id);
create index idx_attempts_test    on public.test_attempts(test_id);

create table public.test_answers (
  id                  uuid primary key default uuid_generate_v4(),
  attempt_id          uuid not null references public.test_attempts(id) on delete cascade,
  question_id         uuid not null references public.questions(id) on delete cascade,
  answer_text         text,
  selected_option_ids uuid[],
  is_correct          boolean not null default false
);

create index idx_answers_attempt on public.test_answers(attempt_id);

-- =============================================================
-- 9. O'YINLAR
-- =============================================================

create type game_template as enum ('word_match', 'ordering', 'memory');

create table public.games (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references public.users(id) on delete cascade,
  template_type game_template not null,
  subject_id    uuid not null references public.subjects(id) on delete cascade,
  title         text not null,
  content_json  jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create table public.game_classes (
  game_id  uuid not null references public.games(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  primary key (game_id, class_id)
);

create table public.game_attempts (
  id           uuid primary key default uuid_generate_v4(),
  student_id   uuid not null references public.users(id) on delete cascade,
  game_id      uuid not null references public.games(id) on delete cascade,
  score        numeric(5,2) not null default 0,
  duration     integer not null default 0,  -- soniyada
  completed_at timestamptz not null default now()
);

create index idx_game_attempts_student on public.game_attempts(student_id);
create index idx_game_attempts_game    on public.game_attempts(game_id);

-- =============================================================
-- 10. KITOBLAR
-- =============================================================

create type audio_source as enum ('uploaded', 'web_speech', 'google_tts');

create table public.books (
  id           uuid primary key default uuid_generate_v4(),
  uploader_id  uuid not null references public.users(id) on delete cascade,
  title        text not null,
  description  text,
  pdf_url      text not null,
  audio_url    text,
  audio_source audio_source,
  ocr_required boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.book_bookmarks (
  user_id         uuid not null references public.users(id) on delete cascade,
  book_id         uuid not null references public.books(id) on delete cascade,
  page            integer not null default 1 check (page > 0),
  audio_timestamp numeric(10,2),  -- soniyada
  updated_at      timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- =============================================================
-- 11. BILDIRISHNOMALAR
-- =============================================================

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);

-- =============================================================
-- 12. LEADERBOARD VIEW
-- =============================================================

-- NOTE: leaderboard view lar migration 003 da to'liq qayta yoziladi.
-- Bu yerda vaqtinchalik versiya (003 ustiga yozadi).
create or replace view public.leaderboard_all_time as
select
  u.id          as user_id,
  u.first_name,
  u.last_name,
  coalesce(sum(ta.score), 0)::numeric as total_score,
  row_number() over (order by coalesce(sum(ta.score), 0) desc)::int as rank
from public.users u
left join public.test_attempts ta
  on ta.student_id = u.id and ta.finished_at is not null
where u.role = 'student' and u.status = 'active'
group by u.id, u.first_name, u.last_name;

create or replace view public.leaderboard_weekly as
select
  u.id          as user_id,
  u.first_name,
  u.last_name,
  coalesce(sum(ta.score), 0)::numeric as total_score,
  row_number() over (order by coalesce(sum(ta.score), 0) desc)::int as rank
from public.users u
left join public.test_attempts ta
  on ta.student_id = u.id
  and ta.finished_at is not null
  and ta.finished_at >= now() - interval '7 days'
where u.role = 'student' and u.status = 'active'
group by u.id, u.first_name, u.last_name;
