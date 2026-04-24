-- Ushbu SQL ni Supabase Dashboard > SQL Editor da bir marta ishga tushiring
-- https://supabase.com/dashboard/project/nixzrpzlpngpaqvwjrwa/sql/new

alter table public.books
  add column if not exists teacher_id uuid references public.users(id) on delete cascade,
  add column if not exists author     text,
  add column if not exists subject_id uuid references public.subjects(id) on delete set null;

update public.books set teacher_id = uploader_id where teacher_id is null;

create table if not exists public.book_classes (
  book_id  uuid not null references public.books(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  primary key (book_id, class_id)
);
