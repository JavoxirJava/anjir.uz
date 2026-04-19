-- =============================================================
-- Bosqich 3/4/5 uchun kerakli junction jadvallar va ustunlar
-- =============================================================

-- Lectures: teacher_id va yangi ustunlar qo'shish
alter table public.lectures
  add column if not exists teacher_id uuid references public.users(id) on delete cascade,
  add column if not exists image_url  text,
  add column if not exists image_alt  text;

-- Lecture classes junction
create table if not exists public.lecture_classes (
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  class_id   uuid not null references public.classes(id) on delete cascade,
  primary key (lecture_id, class_id)
);

-- Assignments: ko'p-sinflik (junction) va ustun nomlarini moslashtirish
alter table public.assignments
  add column if not exists max_score   smallint not null default 10 check (max_score > 0),
  add column if not exists due_date    timestamptz,
  add column if not exists content     text;

-- subject_id va class_id ni ixtiyoriy qilish (originally NOT NULL edi)
alter table public.assignments
  alter column subject_id drop not null,
  alter column class_id   drop not null;

-- Assignment classes junction
create table if not exists public.assignment_classes (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  class_id      uuid not null references public.classes(id) on delete cascade,
  primary key (assignment_id, class_id)
);

-- Assignment submissions: ustun nomlarini moslashtirish
alter table public.assignment_submissions
  add column if not exists content        text,
  add column if not exists score          smallint check (score between 0 and 100),
  add column if not exists teacher_comment text,
  add column if not exists graded_at      timestamptz;

-- 'text' va 'grade', 'comment' ustunlarini saqlash (backward compat)

-- Books: teacher_id va author ustunlari qo'shish
alter table public.books
  add column if not exists teacher_id uuid references public.users(id) on delete cascade,
  add column if not exists author     text,
  add column if not exists subject_id uuid references public.subjects(id) on delete set null;

-- uploader_id ni teacher_id ga ko'chirish (mavjud ma'lumotlar uchun)
update public.books set teacher_id = uploader_id where teacher_id is null;

-- Book classes junction
create table if not exists public.book_classes (
  book_id  uuid not null references public.books(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  primary key (book_id, class_id)
);

-- Tests: subject_id ni ixtiyoriy qilish
alter table public.tests
  alter column subject_id drop not null;

-- Games: subject_id ustuni (ixtiyoriy)
alter table public.games
  add column if not exists subject_id uuid references public.subjects(id) on delete set null;

-- Game attempts: duration_sec ustuni
alter table public.game_attempts
  add column if not exists duration_sec integer;

-- Test attempts: teacher_id ustuni (analitika uchun)
-- NB: bu VIEW orqali hisoblanadi, to'g'ridan-to'g'ri ustun kerak emas

-- Leaderboard views: eski versiyani drop qilib, yangi tuzilma bilan qayta yaratish
-- (CREATE OR REPLACE VIEW ustun o'chirish/o'zgartirishga ruxsat bermaydi)
drop view if exists public.leaderboard_all_time;
drop view if exists public.leaderboard_weekly;

create view public.leaderboard_all_time as
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
  where u.role = 'student' and u.status = 'active'
  group by u.id, u.first_name, u.last_name;

create view public.leaderboard_weekly as
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

-- Student profiles: approved_at, rejected_at, rejection_reason
alter table public.student_profiles
  add column if not exists approved_at      timestamptz,
  add column if not exists rejected_at      timestamptz,
  add column if not exists rejection_reason text;

-- Users: school_id (o'qituvchilar uchun)
alter table public.users
  add column if not exists school_id uuid references public.schools(id) on delete set null;

-- Book bookmarks: page column
alter table public.book_bookmarks
  add column if not exists page integer not null default 1,
  add column if not exists note text;

-- book_bookmarks: note ustuni va primary key o'zgartirish
alter table public.book_bookmarks
  add column if not exists note text;

-- Yangi primary key: user_id + book_id + page
-- (asl PK faqat user_id + book_id edi)
do $$ begin
  alter table public.book_bookmarks drop constraint if exists book_bookmarks_pkey;
  alter table public.book_bookmarks add primary key (user_id, book_id, page);
exception when others then null;
end $$;
