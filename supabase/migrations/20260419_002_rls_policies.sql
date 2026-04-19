-- =============================================================
-- anjir.uz — Row Level Security Policies
-- =============================================================

-- Barcha jadvallar uchun RLS yoqiladi
alter table public.users                 enable row level security;
alter table public.schools               enable row level security;
alter table public.classes               enable row level security;
alter table public.subjects              enable row level security;
alter table public.school_subjects       enable row level security;
alter table public.teacher_assignments   enable row level security;
alter table public.student_profiles      enable row level security;
alter table public.accessibility_profiles enable row level security;
alter table public.lectures              enable row level security;
alter table public.lecture_subtitles     enable row level security;
alter table public.assignments           enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.tests                 enable row level security;
alter table public.test_classes          enable row level security;
alter table public.questions             enable row level security;
alter table public.question_options      enable row level security;
alter table public.test_attempts         enable row level security;
alter table public.test_answers          enable row level security;
alter table public.games                 enable row level security;
alter table public.game_classes          enable row level security;
alter table public.game_attempts         enable row level security;
alter table public.books                 enable row level security;
alter table public.book_bookmarks        enable row level security;
alter table public.notifications         enable row level security;

-- =============================================================
-- YORDAMCHI FUNKSIYALAR
-- =============================================================

-- Joriy foydalanuvchi rolini olish
create or replace function auth.user_role()
returns user_role language sql stable security definer as $$
  select role from public.users where id = auth.uid()
$$;

-- Joriy foydalanuvchi statusini olish
create or replace function auth.user_status()
returns user_status language sql stable security definer as $$
  select status from public.users where id = auth.uid()
$$;

-- O'quvchi qaysi maktabda ekanligini olish
create or replace function auth.student_school_id()
returns uuid language sql stable security definer as $$
  select school_id from public.student_profiles where user_id = auth.uid()
$$;

-- O'quvchi qaysi sinfda ekanligini olish
create or replace function auth.student_class_id()
returns uuid language sql stable security definer as $$
  select class_id from public.student_profiles where user_id = auth.uid()
$$;

-- O'qituvchining sinflarini olish
create or replace function auth.teacher_class_ids()
returns setof uuid language sql stable security definer as $$
  select distinct class_id from public.teacher_assignments where teacher_id = auth.uid()
$$;

-- O'qituvchining maktablari
create or replace function auth.teacher_school_ids()
returns setof uuid language sql stable security definer as $$
  select distinct school_id from public.teacher_assignments where teacher_id = auth.uid()
$$;

-- Direktor qaysi maktabni boshqarishini olish
create or replace function auth.director_school_id()
returns uuid language sql stable security definer as $$
  select id from public.schools where director_id = auth.uid() limit 1
$$;

-- =============================================================
-- USERS
-- =============================================================

-- O'quvchi va o'qituvchi o'z profilini ko'ra oladi
create policy "users_select_own"
  on public.users for select
  using (id = auth.uid());

-- O'qituvchi o'z sinfidagi o'quvchilarni ko'ra oladi
create policy "users_select_teacher_students"
  on public.users for select
  using (
    auth.user_role() = 'teacher'
    and role = 'student'
    and id in (
      select user_id from public.student_profiles
      where class_id in (select auth.teacher_class_ids())
    )
  );

-- Direktor o'z maktabidagi foydalanuvchilarni ko'radi
create policy "users_select_director"
  on public.users for select
  using (
    auth.user_role() = 'director'
    and (
      id in (
        select sp.user_id from public.student_profiles sp
        where sp.school_id = auth.director_school_id()
      )
      or id in (
        select ta.teacher_id from public.teacher_assignments ta
        where ta.school_id = auth.director_school_id()
      )
    )
  );

-- Super admin hamma narsani ko'radi
create policy "users_select_admin"
  on public.users for select
  using (auth.user_role() = 'super_admin');

-- O'z profilini yangilash
create policy "users_update_own"
  on public.users for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.users where id = auth.uid())  -- rolni o'zgartirib bo'lmaydi
  );

-- Super admin hamma narsani yangilaydi
create policy "users_update_admin"
  on public.users for update
  using (auth.user_role() = 'super_admin');

-- Faqat Supabase trigger/function orqali insert qilinadi (auth orqali)
create policy "users_insert_auth"
  on public.users for insert
  with check (id = auth.uid());

-- =============================================================
-- SCHOOLS
-- =============================================================

create policy "schools_select_all_authenticated"
  on public.schools for select
  using (auth.uid() is not null);

create policy "schools_insert_admin"
  on public.schools for insert
  with check (auth.user_role() = 'super_admin');

create policy "schools_update_admin"
  on public.schools for update
  using (auth.user_role() = 'super_admin');

create policy "schools_update_director_own"
  on public.schools for update
  using (
    auth.user_role() = 'director'
    and id = auth.director_school_id()
  );

create policy "schools_delete_admin"
  on public.schools for delete
  using (auth.user_role() = 'super_admin');

-- =============================================================
-- CLASSES
-- =============================================================

create policy "classes_select_all"
  on public.classes for select
  using (auth.uid() is not null);

create policy "classes_insert_admin"
  on public.classes for insert
  with check (auth.user_role() = 'super_admin');

create policy "classes_insert_director_own"
  on public.classes for insert
  with check (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "classes_update_admin"
  on public.classes for update
  using (auth.user_role() = 'super_admin');

create policy "classes_update_director_own"
  on public.classes for update
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "classes_delete_admin"
  on public.classes for delete
  using (auth.user_role() = 'super_admin');

-- =============================================================
-- SUBJECTS
-- =============================================================

create policy "subjects_select_all"
  on public.subjects for select
  using (auth.uid() is not null);

create policy "subjects_insert_admin"
  on public.subjects for insert
  with check (auth.user_role() = 'super_admin');

create policy "subjects_update_admin"
  on public.subjects for update
  using (auth.user_role() = 'super_admin');

-- =============================================================
-- SCHOOL_SUBJECTS
-- =============================================================

create policy "school_subjects_select_all"
  on public.school_subjects for select
  using (auth.uid() is not null);

create policy "school_subjects_insert_admin"
  on public.school_subjects for insert
  with check (auth.user_role() = 'super_admin');

create policy "school_subjects_insert_director"
  on public.school_subjects for insert
  with check (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

-- =============================================================
-- TEACHER_ASSIGNMENTS
-- =============================================================

create policy "ta_select_teacher_own"
  on public.teacher_assignments for select
  using (teacher_id = auth.uid());

create policy "ta_select_director"
  on public.teacher_assignments for select
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "ta_select_admin"
  on public.teacher_assignments for select
  using (auth.user_role() = 'super_admin');

create policy "ta_insert_admin"
  on public.teacher_assignments for insert
  with check (auth.user_role() = 'super_admin');

create policy "ta_insert_director"
  on public.teacher_assignments for insert
  with check (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "ta_delete_admin"
  on public.teacher_assignments for delete
  using (auth.user_role() = 'super_admin');

create policy "ta_delete_director"
  on public.teacher_assignments for delete
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

-- =============================================================
-- STUDENT_PROFILES
-- =============================================================

create policy "sp_select_own"
  on public.student_profiles for select
  using (user_id = auth.uid());

create policy "sp_select_teacher"
  on public.student_profiles for select
  using (
    auth.user_role() = 'teacher'
    and class_id in (select auth.teacher_class_ids())
  );

create policy "sp_select_director"
  on public.student_profiles for select
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "sp_select_admin"
  on public.student_profiles for select
  using (auth.user_role() = 'super_admin');

create policy "sp_insert_student"
  on public.student_profiles for insert
  with check (user_id = auth.uid() and auth.user_role() = 'student');

create policy "sp_update_teacher"
  on public.student_profiles for update
  using (
    auth.user_role() = 'teacher'
    and class_id in (select auth.teacher_class_ids())
  );

create policy "sp_update_director"
  on public.student_profiles for update
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "sp_update_admin"
  on public.student_profiles for update
  using (auth.user_role() = 'super_admin');

-- =============================================================
-- ACCESSIBILITY_PROFILES
-- =============================================================

create policy "ap_select_own"
  on public.accessibility_profiles for select
  using (user_id = auth.uid());

create policy "ap_select_teacher"
  on public.accessibility_profiles for select
  using (
    auth.user_role() = 'teacher'
    and user_id in (
      select sp.user_id from public.student_profiles sp
      where sp.class_id in (select auth.teacher_class_ids())
    )
  );

create policy "ap_insert_own"
  on public.accessibility_profiles for insert
  with check (user_id = auth.uid());

create policy "ap_update_own"
  on public.accessibility_profiles for update
  using (user_id = auth.uid());

-- =============================================================
-- LECTURES
-- =============================================================

-- O'quvchi o'z sinfiga tegishli ma'ruzalarni ko'radi
create policy "lectures_select_student"
  on public.lectures for select
  using (
    auth.user_role() = 'student'
    and auth.user_status() = 'active'
    and (
      class_id = auth.student_class_id()
      or (school_id = auth.student_school_id() and class_id is null)
    )
  );

create policy "lectures_select_teacher"
  on public.lectures for select
  using (
    auth.user_role() = 'teacher'
    and (
      creator_id = auth.uid()
      or class_id in (select auth.teacher_class_ids())
    )
  );

create policy "lectures_select_director"
  on public.lectures for select
  using (
    auth.user_role() = 'director'
    and school_id = auth.director_school_id()
  );

create policy "lectures_select_admin"
  on public.lectures for select
  using (auth.user_role() = 'super_admin');

create policy "lectures_insert_teacher"
  on public.lectures for insert
  with check (
    auth.user_role() = 'teacher'
    and creator_id = auth.uid()
    and (class_id is null or class_id in (select auth.teacher_class_ids()))
  );

create policy "lectures_insert_director"
  on public.lectures for insert
  with check (
    auth.user_role() = 'director'
    and creator_id = auth.uid()
    and school_id = auth.director_school_id()
  );

create policy "lectures_insert_admin"
  on public.lectures for insert
  with check (auth.user_role() = 'super_admin');

create policy "lectures_update_creator"
  on public.lectures for update
  using (creator_id = auth.uid());

create policy "lectures_update_admin"
  on public.lectures for update
  using (auth.user_role() = 'super_admin');

create policy "lectures_delete_creator"
  on public.lectures for delete
  using (creator_id = auth.uid());

create policy "lectures_delete_admin"
  on public.lectures for delete
  using (auth.user_role() = 'super_admin');

-- =============================================================
-- LECTURE_SUBTITLES
-- =============================================================

create policy "ls_select_authenticated"
  on public.lecture_subtitles for select
  using (auth.uid() is not null);

create policy "ls_insert_teacher"
  on public.lecture_subtitles for insert
  with check (
    lecture_id in (
      select id from public.lectures where creator_id = auth.uid()
    )
  );

-- =============================================================
-- TESTS & QUESTIONS
-- =============================================================

create policy "tests_select_student"
  on public.tests for select
  using (
    auth.user_role() = 'student'
    and auth.user_status() = 'active'
    and id in (
      select test_id from public.test_classes
      where class_id = auth.student_class_id()
    )
  );

create policy "tests_select_teacher"
  on public.tests for select
  using (
    auth.user_role() = 'teacher'
    and (
      teacher_id = auth.uid()
      or id in (
        select tc.test_id from public.test_classes tc
        where tc.class_id in (select auth.teacher_class_ids())
      )
    )
  );

create policy "tests_select_director"
  on public.tests for select
  using (auth.user_role() = 'director');

create policy "tests_select_admin"
  on public.tests for select
  using (auth.user_role() = 'super_admin');

create policy "tests_insert_teacher"
  on public.tests for insert
  with check (auth.user_role() = 'teacher' and teacher_id = auth.uid());

create policy "tests_update_teacher"
  on public.tests for update
  using (auth.user_role() = 'teacher' and teacher_id = auth.uid());

create policy "tests_delete_teacher"
  on public.tests for delete
  using (auth.user_role() = 'teacher' and teacher_id = auth.uid());

create policy "tests_admin"
  on public.tests for all
  using (auth.user_role() = 'super_admin');

-- Test classes
create policy "test_classes_select_all"
  on public.test_classes for select
  using (auth.uid() is not null);

create policy "test_classes_manage_teacher"
  on public.test_classes for all
  using (
    test_id in (select id from public.tests where teacher_id = auth.uid())
  );

-- Questions
create policy "questions_select_all"
  on public.questions for select
  using (auth.uid() is not null);

create policy "questions_manage_teacher"
  on public.questions for all
  using (
    test_id in (select id from public.tests where teacher_id = auth.uid())
  );

-- Question options
create policy "options_select_all"
  on public.question_options for select
  using (auth.uid() is not null);

create policy "options_manage_teacher"
  on public.question_options for all
  using (
    question_id in (
      select q.id from public.questions q
      join public.tests t on t.id = q.test_id
      where t.teacher_id = auth.uid()
    )
  );

-- =============================================================
-- TEST ATTEMPTS & ANSWERS
-- =============================================================

create policy "attempts_select_own"
  on public.test_attempts for select
  using (student_id = auth.uid());

create policy "attempts_select_teacher"
  on public.test_attempts for select
  using (
    auth.user_role() = 'teacher'
    and test_id in (select id from public.tests where teacher_id = auth.uid())
  );

create policy "attempts_select_director"
  on public.test_attempts for select
  using (auth.user_role() in ('director', 'super_admin'));

create policy "attempts_insert_student"
  on public.test_attempts for insert
  with check (
    auth.user_role() = 'student'
    and student_id = auth.uid()
    and auth.user_status() = 'active'
  );

create policy "attempts_update_own"
  on public.test_attempts for update
  using (student_id = auth.uid());

-- Answers
create policy "answers_select_own"
  on public.test_answers for select
  using (
    attempt_id in (select id from public.test_attempts where student_id = auth.uid())
  );

create policy "answers_select_teacher"
  on public.test_answers for select
  using (auth.user_role() in ('teacher', 'director', 'super_admin'));

create policy "answers_insert_student"
  on public.test_answers for insert
  with check (
    attempt_id in (select id from public.test_attempts where student_id = auth.uid())
  );

-- =============================================================
-- GAMES
-- =============================================================

create policy "games_select_student"
  on public.games for select
  using (
    auth.user_role() = 'student'
    and auth.user_status() = 'active'
    and id in (
      select game_id from public.game_classes
      where class_id = auth.student_class_id()
    )
  );

create policy "games_select_teacher"
  on public.games for select
  using (
    auth.user_role() in ('teacher', 'director', 'super_admin')
  );

create policy "games_insert_teacher"
  on public.games for insert
  with check (auth.user_role() = 'teacher' and teacher_id = auth.uid());

create policy "games_update_teacher"
  on public.games for update
  using (teacher_id = auth.uid());

create policy "games_delete_teacher"
  on public.games for delete
  using (teacher_id = auth.uid());

-- Game classes
create policy "game_classes_select_all"
  on public.game_classes for select
  using (auth.uid() is not null);

create policy "game_classes_manage_teacher"
  on public.game_classes for all
  using (
    game_id in (select id from public.games where teacher_id = auth.uid())
  );

-- Game attempts
create policy "game_attempts_own"
  on public.game_attempts for select
  using (student_id = auth.uid());

create policy "game_attempts_teacher"
  on public.game_attempts for select
  using (auth.user_role() in ('teacher', 'director', 'super_admin'));

create policy "game_attempts_insert"
  on public.game_attempts for insert
  with check (
    auth.user_role() = 'student'
    and student_id = auth.uid()
    and auth.user_status() = 'active'
  );

-- =============================================================
-- BOOKS
-- =============================================================

create policy "books_select_all"
  on public.books for select
  using (auth.uid() is not null);

create policy "books_insert_teacher"
  on public.books for insert
  with check (auth.user_role() in ('teacher', 'director', 'super_admin'));

create policy "books_update_uploader"
  on public.books for update
  using (uploader_id = auth.uid());

create policy "books_update_admin"
  on public.books for update
  using (auth.user_role() in ('director', 'super_admin'));

create policy "books_delete_uploader"
  on public.books for delete
  using (uploader_id = auth.uid());

-- Bookmarks
create policy "bookmarks_own"
  on public.book_bookmarks for all
  using (user_id = auth.uid());

-- =============================================================
-- ASSIGNMENTS
-- =============================================================

create policy "assignments_select_student"
  on public.assignments for select
  using (
    auth.user_role() = 'student'
    and auth.user_status() = 'active'
    and class_id = auth.student_class_id()
  );

create policy "assignments_select_teacher"
  on public.assignments for select
  using (
    auth.user_role() = 'teacher'
    and (
      teacher_id = auth.uid()
      or class_id in (select auth.teacher_class_ids())
    )
  );

create policy "assignments_select_director"
  on public.assignments for select
  using (auth.user_role() in ('director', 'super_admin'));

create policy "assignments_insert_teacher"
  on public.assignments for insert
  with check (
    auth.user_role() = 'teacher'
    and teacher_id = auth.uid()
  );

create policy "assignments_update_teacher"
  on public.assignments for update
  using (teacher_id = auth.uid());

-- Submissions
create policy "submissions_select_own"
  on public.assignment_submissions for select
  using (student_id = auth.uid());

create policy "submissions_select_teacher"
  on public.assignment_submissions for select
  using (
    auth.user_role() = 'teacher'
    and assignment_id in (select id from public.assignments where teacher_id = auth.uid())
  );

create policy "submissions_insert_student"
  on public.assignment_submissions for insert
  with check (
    auth.user_role() = 'student'
    and student_id = auth.uid()
    and auth.user_status() = 'active'
  );

create policy "submissions_update_teacher"
  on public.assignment_submissions for update
  using (
    assignment_id in (select id from public.assignments where teacher_id = auth.uid())
  );

-- =============================================================
-- NOTIFICATIONS
-- =============================================================

create policy "notifications_own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  using (user_id = auth.uid());

-- Service role tomonidan insert qilinadi (server-side)
create policy "notifications_insert_service"
  on public.notifications for insert
  with check (true);

-- =============================================================
-- LEADERBOARD VIEWS — hamma ko'ra oladi (authenticated)
-- =============================================================

create policy "leaderboard_all_time_select"
  on public.leaderboard_all_time for select
  using (auth.uid() is not null);

create policy "leaderboard_weekly_select"
  on public.leaderboard_weekly for select
  using (auth.uid() is not null);
