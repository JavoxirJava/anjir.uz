--
-- PostgreSQL database dump
--

\restrict GDDmEZIf6XW3tYeBPjSwimGQOY1sD6n0R4lm25lVXGopsITt4N9OSDxRk1OfCbM

-- Dumped from database version 17.6 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: audio_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audio_source AS ENUM (
    'uploaded',
    'web_speech',
    'google_tts'
);


ALTER TYPE public.audio_source OWNER TO postgres;

--
-- Name: color_blind_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.color_blind_mode AS ENUM (
    'normal',
    'protanopia',
    'deuteranopia',
    'tritanopia'
);


ALTER TYPE public.color_blind_mode OWNER TO postgres;

--
-- Name: content_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_type AS ENUM (
    'pdf',
    'video',
    'audio',
    'ppt'
);


ALTER TYPE public.content_type OWNER TO postgres;

--
-- Name: contrast_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contrast_mode AS ENUM (
    'normal',
    'high',
    'dark'
);


ALTER TYPE public.contrast_mode OWNER TO postgres;

--
-- Name: font_size_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.font_size_type AS ENUM (
    'small',
    'medium',
    'large',
    'xlarge'
);


ALTER TYPE public.font_size_type OWNER TO postgres;

--
-- Name: game_template; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.game_template AS ENUM (
    'word_match',
    'ordering',
    'memory'
);


ALTER TYPE public.game_template OWNER TO postgres;

--
-- Name: question_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_type AS ENUM (
    'single',
    'multiple',
    'true_false',
    'fill_blank'
);


ALTER TYPE public.question_type OWNER TO postgres;

--
-- Name: subtitle_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subtitle_source AS ENUM (
    'manual',
    'ai'
);


ALTER TYPE public.subtitle_source OWNER TO postgres;

--
-- Name: test_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.test_type AS ENUM (
    'entry',
    'post_topic',
    'home_study'
);


ALTER TYPE public.test_type OWNER TO postgres;

--
-- Name: tts_source_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tts_source_type AS ENUM (
    'web_speech',
    'google_tts',
    'own_reader'
);


ALTER TYPE public.tts_source_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'director',
    'teacher',
    'student',
    'parent'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'pending',
    'active',
    'rejected'
);


ALTER TYPE public.user_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessibility_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accessibility_profiles (
    user_id uuid NOT NULL,
    vision_mode boolean DEFAULT false NOT NULL,
    hearing_mode boolean DEFAULT false NOT NULL,
    motor_mode boolean DEFAULT false NOT NULL,
    tts_source public.tts_source_type DEFAULT 'web_speech'::public.tts_source_type NOT NULL,
    font_size public.font_size_type DEFAULT 'medium'::public.font_size_type NOT NULL,
    contrast_mode public.contrast_mode DEFAULT 'normal'::public.contrast_mode NOT NULL,
    color_blind_mode public.color_blind_mode DEFAULT 'normal'::public.color_blind_mode NOT NULL,
    reduce_motion boolean DEFAULT false NOT NULL,
    subtitles_always boolean DEFAULT false NOT NULL,
    screening_completed boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accessibility_profiles OWNER TO postgres;

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    content text,
    file_url text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    score smallint,
    teacher_comment text,
    CONSTRAINT assignment_submissions_score_check CHECK ((score >= 0))
);


ALTER TABLE public.assignment_submissions OWNER TO postgres;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_url text,
    deadline timestamp with time zone,
    max_score smallint DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assignments_max_score_check CHECK ((max_score > 0))
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: book_bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_bookmarks (
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    page integer DEFAULT 1 NOT NULL,
    audio_timestamp numeric(10,2),
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT book_bookmarks_page_check CHECK ((page > 0))
);


ALTER TABLE public.book_bookmarks OWNER TO postgres;

--
-- Name: book_classes; Type: TABLE; Schema: public; Owner: javohir
--

CREATE TABLE public.book_classes (
    book_id uuid NOT NULL,
    class_id uuid NOT NULL
);


ALTER TABLE public.book_classes OWNER TO javohir;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    uploader_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    pdf_url text NOT NULL,
    audio_url text,
    audio_source public.audio_source,
    ocr_required boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_content_check CHECK ((length(TRIM(BOTH FROM content)) > 0))
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parent_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_rooms OWNER TO postgres;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    school_id uuid NOT NULL,
    grade smallint NOT NULL,
    letter character(1) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT classes_grade_check CHECK (((grade >= 5) AND (grade <= 9))),
    CONSTRAINT classes_letter_check CHECK ((letter ~ '^[A-Za-z]$'::text))
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: game_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_attempts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid NOT NULL,
    game_id uuid NOT NULL,
    score numeric(5,2) DEFAULT 0 NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.game_attempts OWNER TO postgres;

--
-- Name: game_classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_classes (
    game_id uuid NOT NULL,
    class_id uuid NOT NULL
);


ALTER TABLE public.game_classes OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    teacher_id uuid NOT NULL,
    template_type public.game_template NOT NULL,
    subject_id uuid NOT NULL,
    class_id uuid,
    title text NOT NULL,
    content_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: lecture_subtitles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecture_subtitles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lecture_id uuid NOT NULL,
    vtt_url text NOT NULL,
    language text DEFAULT 'uz'::text NOT NULL,
    source public.subtitle_source DEFAULT 'manual'::public.subtitle_source NOT NULL
);


ALTER TABLE public.lecture_subtitles OWNER TO postgres;

--
-- Name: lectures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lectures (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    creator_id uuid NOT NULL,
    school_id uuid,
    subject_id uuid NOT NULL,
    class_id uuid,
    title text NOT NULL,
    description text,
    content_type public.content_type NOT NULL,
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lectures OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: parent_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parent_students (
    parent_id uuid NOT NULL,
    student_id uuid NOT NULL,
    linked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parent_students OWNER TO postgres;

--
-- Name: question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_options (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL
);


ALTER TABLE public.question_options OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type public.question_type NOT NULL,
    image_url text,
    image_alt text,
    points smallint DEFAULT 1 NOT NULL,
    sort_order smallint DEFAULT 0 NOT NULL,
    CONSTRAINT questions_points_check CHECK ((points > 0))
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: school_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_subjects (
    school_id uuid NOT NULL,
    subject_id uuid NOT NULL
);


ALTER TABLE public.school_subjects OWNER TO postgres;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    address text,
    director_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schools OWNER TO postgres;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_profiles (
    user_id uuid NOT NULL,
    school_id uuid NOT NULL,
    class_id uuid NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_reason text
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: teacher_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    teacher_id uuid NOT NULL,
    school_id uuid NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL
);


ALTER TABLE public.teacher_assignments OWNER TO postgres;

--
-- Name: test_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_text text,
    selected_option_ids uuid[],
    is_correct boolean DEFAULT false NOT NULL
);


ALTER TABLE public.test_answers OWNER TO postgres;

--
-- Name: test_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_attempts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid NOT NULL,
    test_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    score numeric(5,2),
    CONSTRAINT test_attempts_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric)))
);


ALTER TABLE public.test_attempts OWNER TO postgres;

--
-- Name: test_classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_classes (
    test_id uuid NOT NULL,
    class_id uuid NOT NULL
);


ALTER TABLE public.test_classes OWNER TO postgres;

--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    teacher_id uuid,
    subject_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    time_limit smallint,
    test_type public.test_type DEFAULT 'home_study'::public.test_type NOT NULL,
    max_attempts smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tests_max_attempts_check CHECK ((max_attempts > 0)),
    CONSTRAINT tests_time_limit_check CHECK ((time_limit > 0))
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'pending'::public.user_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accessibility_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accessibility_profiles (user_id, vision_mode, hearing_mode, motor_mode, tts_source, font_size, contrast_mode, color_blind_mode, reduce_motion, subtitles_always, screening_completed, updated_at) FROM stdin;
\.


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_submissions (id, assignment_id, student_id, content, file_url, submitted_at, score, teacher_comment) FROM stdin;
6504d508-6dac-46fd-8b96-627083a1aeb0	4dbd2506-03be-49fd-991a-67a952f961f1	2ce8e7c1-4302-4856-a41b-1e7d30f13937	test	\N	2026-04-24 12:39:25.295599+05	\N	\N
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, teacher_id, subject_id, class_id, title, description, file_url, deadline, max_score, created_at) FROM stdin;
4dbd2506-03be-49fd-991a-67a952f961f1	b33454fb-dabb-4f59-9c8e-99fe4aea5430	00000000-0000-0000-0000-000000000001	b213d79b-7642-425f-93b8-c8bd48ca0978	test vazifa	test vazifaaaa	\N	2026-04-23 15:00:00+05	100	2026-04-22 12:49:04.842149+05
99edad60-8d2d-4a3f-81af-9fdb4f602525	b33454fb-dabb-4f59-9c8e-99fe4aea5430	00000000-0000-0000-0000-000000000001	30776358-198f-484b-b77f-f8d982ed05aa	test vazifa	test vazifaaaa	\N	2026-04-23 15:00:00+05	100	2026-04-22 12:49:05.40346+05
ef16aaef-7625-4af1-81fc-30f26675f52e	b33454fb-dabb-4f59-9c8e-99fe4aea5430	00000000-0000-0000-0000-000000000001	999f1fbb-51aa-4df0-a653-5d3073e1f61d	test vazifa	test vazifaaaa	\N	2026-04-23 15:00:00+05	100	2026-04-22 12:49:05.40346+05
0c2f61c3-6075-42f0-afcf-424cc14553a2	b33454fb-dabb-4f59-9c8e-99fe4aea5430	00000000-0000-0000-0000-000000000001	6205e309-4e0b-4dc6-9c09-d296542aa32f	test vazifa	test vazifaaaa	\N	2026-04-23 15:00:00+05	100	2026-04-22 12:49:05.40346+05
\.


--
-- Data for Name: book_bookmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_bookmarks (user_id, book_id, page, audio_timestamp, updated_at) FROM stdin;
\.


--
-- Data for Name: book_classes; Type: TABLE DATA; Schema: public; Owner: javohir
--

COPY public.book_classes (book_id, class_id) FROM stdin;
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, uploader_id, title, description, pdf_url, audio_url, audio_source, ocr_required, created_at) FROM stdin;
584586a0-5f1a-4a98-9d2f-a803f84eff94	b33454fb-dabb-4f59-9c8e-99fe4aea5430	ali book	alining ktobi	https://pub-f59c069934cb4a6f8d3d429db4372927.r2.dev/books/597501b5-2fd7-4f71-b165-5951c1a46df7.pdf	\N	\N	f	2026-04-22 16:28:31.086475+05
6ea0c6ea-221c-4993-b6a2-e12e75d348ae	b33454fb-dabb-4f59-9c8e-99fe4aea5430	barcha o'chun	Tested 	https://pub-f59c069934cb4a6f8d3d429db4372927.r2.dev/books/fc8eb802-6a3b-4d36-bd09-21e8927eec5d.pdf	\N	\N	f	2026-04-24 12:45:27.31694+05
f4bbcee4-35ba-4bc8-b82a-c131609ae5b4	b33454fb-dabb-4f59-9c8e-99fe4aea5430	ali book	alining ktobi	https://pub-f59c069934cb4a6f8d3d429db4372927.r2.dev/books/1bc1e85f-7f4c-4185-80a6-a1e2ed407dee.pdf	\N	\N	f	2026-04-22 16:41:09.491436+05
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, room_id, sender_id, content, read_at, created_at) FROM stdin;
fff8d4e2-3021-474c-a55d-aafec8ba2e59	5cdb05d9-0086-423d-ab1a-e55734284c15	b33454fb-dabb-4f59-9c8e-99fe4aea5430	salom	2026-04-28 15:43:25.093766+05	2026-04-28 12:23:19.268858+05
d1e53a34-a22b-447f-8412-c9657e972576	5cdb05d9-0086-423d-ab1a-e55734284c15	b33454fb-dabb-4f59-9c8e-99fe4aea5430	javob kutaman	2026-04-28 15:43:25.093766+05	2026-04-28 12:23:30.367584+05
adc668c3-b92a-4984-bb6f-35c0a0d57c7a	5cdb05d9-0086-423d-ab1a-e55734284c15	b33454fb-dabb-4f59-9c8e-99fe4aea5430	aka bro	2026-04-28 15:43:25.093766+05	2026-04-28 12:23:34.114715+05
a77f8d4a-c409-42f4-83d8-e49b94337d4c	5cdb05d9-0086-423d-ab1a-e55734284c15	136bfe48-4a35-427e-a976-856e65e44e99	mana javob sizga	2026-04-28 15:44:01.508554+05	2026-04-28 15:43:41.824146+05
9ff00a69-1ff5-4288-b007-487f0117cc0e	5cdb05d9-0086-423d-ab1a-e55734284c15	136bfe48-4a35-427e-a976-856e65e44e99	yana nima kerak bro	2026-04-28 15:44:01.508554+05	2026-04-28 15:43:46.978838+05
\.


--
-- Data for Name: chat_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_rooms (id, parent_id, teacher_id, student_id, created_at) FROM stdin;
d455ae60-1c00-45ed-a059-321268442785	136bfe48-4a35-427e-a976-856e65e44e99	b33454fb-dabb-4f59-9c8e-99fe4aea5430	2ce8e7c1-4302-4856-a41b-1e7d30f13937	2026-04-28 15:43:31.586923+05
5cdb05d9-0086-423d-ab1a-e55734284c15	136bfe48-4a35-427e-a976-856e65e44e99	b33454fb-dabb-4f59-9c8e-99fe4aea5430	e6184355-d8f5-476a-a9c6-d49f877d059d	2026-04-28 12:22:42.273472+05
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, school_id, grade, letter, created_at) FROM stdin;
b213d79b-7642-425f-93b8-c8bd48ca0978	10ab52fb-6002-42c7-ae34-bb184f421b5d	5	A	2026-04-20 14:07:44.554484+05
30776358-198f-484b-b77f-f8d982ed05aa	10ab52fb-6002-42c7-ae34-bb184f421b5d	5	B	2026-04-20 14:07:52.078739+05
999f1fbb-51aa-4df0-a653-5d3073e1f61d	10ab52fb-6002-42c7-ae34-bb184f421b5d	6	A	2026-04-20 14:07:59.395176+05
6205e309-4e0b-4dc6-9c09-d296542aa32f	10ab52fb-6002-42c7-ae34-bb184f421b5d	7	A	2026-04-20 14:08:06.208091+05
f45a6a0a-9d5a-4b4d-9112-2b536b7a3732	10ab52fb-6002-42c7-ae34-bb184f421b5d	8	A	2026-04-20 14:08:11.622444+05
c823e88c-f5de-42de-8f63-7cd72a11c109	10ab52fb-6002-42c7-ae34-bb184f421b5d	9	A	2026-04-20 14:08:18.784734+05
\.


--
-- Data for Name: game_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_attempts (id, student_id, game_id, score, duration, completed_at) FROM stdin;
ba096df5-9411-400b-b54e-b44b28e291cf	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:42:31.336858+05
1cf1aae3-e904-4114-ac11-0c6c08f40da5	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:43:22.07351+05
60ce74c7-56cf-4a02-a9ba-36e288671617	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:44:18.595123+05
bfc3c8c2-111c-43a3-a609-0a96b7e80f5b	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:44:19.782535+05
8819a503-147b-401d-9778-a245c3d1d9b0	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:46:16.035829+05
cbc11956-cbea-41b3-9240-2cd8976a9c0a	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:46:30.216245+05
f67503a0-f790-4073-aa77-c965c4d77982	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:47:22.936584+05
24d6359c-cabc-4fb8-b607-048554eb9c7b	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:47:23.625556+05
5640d89f-f189-4fe5-994d-31c376e14a47	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:47:28.216854+05
a05314e9-2ecf-467d-b040-957ad72b2209	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	0.00	0	2026-04-22 16:47:28.904531+05
ef96ada9-fb03-49b6-b7fa-de69032d0fcd	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	100.00	3	2026-04-22 16:48:14.479+05
217fb5b5-02df-4ea1-9926-00efe6f42dfa	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	100.00	7	2026-04-22 16:48:46.724+05
5e43291c-4975-42aa-8130-5a69935b3020	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	50.00	3	2026-04-22 16:48:55.532+05
c9f4cb34-2c6a-45a4-9004-7e10e6e6c09c	2ce8e7c1-4302-4856-a41b-1e7d30f13937	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	100.00	3	2026-04-24 12:24:15.811+05
62676a0d-a6ba-4e10-a4ec-8b2ad02c6215	e6184355-d8f5-476a-a9c6-d49f877d059d	7d2175aa-18fb-4fc7-9c99-c5b3f6524977	100.00	3	2026-04-28 10:29:37.723797+05
\.


--
-- Data for Name: game_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_classes (game_id, class_id) FROM stdin;
7d2175aa-18fb-4fc7-9c99-c5b3f6524977	b213d79b-7642-425f-93b8-c8bd48ca0978
7d2175aa-18fb-4fc7-9c99-c5b3f6524977	30776358-198f-484b-b77f-f8d982ed05aa
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, teacher_id, template_type, subject_id, class_id, title, content_json, created_at) FROM stdin;
7d2175aa-18fb-4fc7-9c99-c5b3f6524977	b33454fb-dabb-4f59-9c8e-99fe4aea5430	ordering	64a577eb-be07-4b82-be0c-cb636ccfa6e0	\N	test o'yin	{"items": ["SELECT", "*", "FROM"], "correctOrder": [0, 1, 2]}	2026-04-22 12:42:17.248424+05
\.


--
-- Data for Name: lecture_subtitles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecture_subtitles (id, lecture_id, vtt_url, language, source) FROM stdin;
\.


--
-- Data for Name: lectures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lectures (id, creator_id, school_id, subject_id, class_id, title, description, content_type, file_url, created_at) FROM stdin;
59bff45a-8ba7-40f0-b7e3-ce308dcc6a39	b33454fb-dabb-4f59-9c8e-99fe4aea5430	\N	64a577eb-be07-4b82-be0c-cb636ccfa6e0	b213d79b-7642-425f-93b8-c8bd48ca0978	test	sasasa	pdf	https://pub-f59c069934cb4a6f8d3d429db4372927.r2.dev/lectures/10377cd5-c823-45a1-8a03-99999cc29ec8.pdf	2026-04-24 12:02:44.567516+05
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, link, read, created_at) FROM stdin;
\.


--
-- Data for Name: parent_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parent_students (parent_id, student_id, linked_at) FROM stdin;
136bfe48-4a35-427e-a976-856e65e44e99	2ce8e7c1-4302-4856-a41b-1e7d30f13937	2026-04-28 11:46:51.461483+05
136bfe48-4a35-427e-a976-856e65e44e99	e6184355-d8f5-476a-a9c6-d49f877d059d	2026-04-28 11:47:02.731493+05
\.


--
-- Data for Name: question_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_options (id, question_id, option_text, is_correct) FROM stdin;
dbb343fa-747e-40f4-9321-d2a00e2083f1	20000000-0000-0000-0000-000000000001	3	f
43b1a28a-d86f-423e-88ca-7d3c90ed0a50	20000000-0000-0000-0000-000000000001	4	t
73663c82-4334-484f-ba74-5756cbf65769	20000000-0000-0000-0000-000000000001	5	f
f35465ad-f003-42ef-9b4d-bb87cc2afad8	20000000-0000-0000-0000-000000000001	6	f
6deb3445-fad0-4ab6-9daa-497ec290ebf8	20000000-0000-0000-0000-000000000002	40	f
e340b6f4-22b9-4f17-a3d8-ce12a16a2510	20000000-0000-0000-0000-000000000002	45	f
23cee2d9-79ed-48fb-906c-d8fcbf0bb673	20000000-0000-0000-0000-000000000002	50	t
90ac0299-4cc4-4d32-9fe3-21ea205409a6	20000000-0000-0000-0000-000000000002	55	f
d22d5f3d-3ce1-44c6-8e17-9eef91baa729	20000000-0000-0000-0000-000000000003	20	f
de12e905-0df6-46f0-82db-e072947d6af1	20000000-0000-0000-0000-000000000003	24	f
d425f24d-cf70-4a80-bb92-74b376a10535	20000000-0000-0000-0000-000000000003	25	t
06a55e87-404c-417f-8d42-157c6576add3	20000000-0000-0000-0000-000000000003	30	f
bcb67f45-650f-471b-a0c9-cb0c32dc9f60	20000000-0000-0000-0000-000000000004	6	f
32baf7de-52f0-4dde-8ce8-763be213adc3	20000000-0000-0000-0000-000000000004	7	f
a5674579-bb0a-4b69-a8a4-c880ea9bc9b4	20000000-0000-0000-0000-000000000004	8	t
7ec1ac45-9338-48fd-ad27-9a3a7a3070af	20000000-0000-0000-0000-000000000004	9	f
41f9be3f-8fd5-43de-aa7d-25566e1cf5c6	20000000-0000-0000-0000-000000000005	9	f
fbebd754-2aa0-44e6-a728-1cd915daaf81	20000000-0000-0000-0000-000000000005	18	f
4dbe73bb-bc61-44bf-bcea-494268daf4e7	20000000-0000-0000-0000-000000000005	27	t
9d1ac34a-b0b6-4e81-bb2d-8ab97d2810da	20000000-0000-0000-0000-000000000005	81	f
c72c8bcd-d89e-4d89-84f4-5306e40417e9	20000000-0000-0000-0000-000000000006	Ha	t
6c260b7d-6e42-487b-b832-14e987331aa4	20000000-0000-0000-0000-000000000006	Yo'q	f
fee3b477-f05b-44ea-bd02-a25508e7a67d	20000000-0000-0000-0000-000000000007	Ha	t
c6f33bd0-0463-4d60-8dd1-419b14fd3bce	20000000-0000-0000-0000-000000000007	Yo'q	f
987f911e-1eee-4a47-ad82-9cc03f2d7b12	20000000-0000-0000-0000-000000000008	512	f
432c9df4-ba66-4719-9328-77f247bc9796	20000000-0000-0000-0000-000000000008	1000	f
fdd79834-1bdc-4fee-a897-20c287a34574	20000000-0000-0000-0000-000000000008	1024	t
7bd249ff-460d-4669-a2a8-03685d58e0a1	20000000-0000-0000-0000-000000000008	2048	f
ad55ef06-0274-405c-ae18-2bf76b9a636f	20000000-0000-0000-0000-000000000009	Ha	t
4e0a05f9-0441-40a6-9f0a-97814e00314c	20000000-0000-0000-0000-000000000009	Yo'q	f
d98ad181-9876-4b3b-9675-6b26186dc658	20000000-0000-0000-0000-000000000010	60	f
07419158-75b6-4632-bcdd-b6ec946f6894	20000000-0000-0000-0000-000000000010	360	f
0497a761-09df-492f-bc7d-f233e5a5a155	20000000-0000-0000-0000-000000000010	3600	t
401dc68a-a946-489f-b16f-d8d496adb07b	20000000-0000-0000-0000-000000000010	36000	f
edf91983-bad5-4e35-852e-40ddd90e1105	96bba195-379b-4b36-a03b-38992f3d6e1c	a	f
b9a34a84-3cf7-49dc-978e-8420459389f8	96bba195-379b-4b36-a03b-38992f3d6e1c	b	t
e4a7bd92-7e09-4e61-aec2-bda09d6df1a8	96bba195-379b-4b36-a03b-38992f3d6e1c	c	f
79ed77f8-3b29-45e9-a79c-75890ee440fa	96bba195-379b-4b36-a03b-38992f3d6e1c	d	f
cb540b12-fca1-4a43-b2b9-252889de5326	607d83ae-5e92-4e17-a78d-f47573ec59b7	asas	t
31dffee5-3f47-4970-9b80-4f54148acef2	607d83ae-5e92-4e17-a78d-f47573ec59b7	sss	f
7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13	607d83ae-5e92-4e17-a78d-f47573ec59b7	cccc	t
9836addb-3dcf-4077-94e0-ca6e70b82ce3	607d83ae-5e92-4e17-a78d-f47573ec59b7	vvvv	f
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, test_id, question_text, question_type, image_url, image_alt, points, sort_order) FROM stdin;
20000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	2 + 2 = ?	single	\N	\N	1	1
20000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000001	10 × 5 = ?	single	\N	\N	1	2
20000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000001	100 ÷ 4 = ?	single	\N	\N	1	3
20000000-0000-0000-0000-000000000004	10000000-0000-0000-0000-000000000001	15 - 7 = ?	single	\N	\N	1	4
20000000-0000-0000-0000-000000000005	10000000-0000-0000-0000-000000000001	3 × 3 × 3 = ?	single	\N	\N	1	5
20000000-0000-0000-0000-000000000006	10000000-0000-0000-0000-000000000001	7 son tub son hisoblanadimi?	true_false	\N	\N	1	6
20000000-0000-0000-0000-000000000007	10000000-0000-0000-0000-000000000001	0 son juft son hisoblanadimi?	true_false	\N	\N	1	7
20000000-0000-0000-0000-000000000008	10000000-0000-0000-0000-000000000001	2^10 = ?	single	\N	\N	1	8
20000000-0000-0000-0000-000000000009	10000000-0000-0000-0000-000000000001	Uchburchak perimetri formulasi: P = a + b + c. Bu to'g'rimi?	true_false	\N	\N	1	9
20000000-0000-0000-0000-000000000010	10000000-0000-0000-0000-000000000001	1 soatda necha sekund bor?	single	\N	\N	1	10
96bba195-379b-4b36-a03b-38992f3d6e1c	f03af581-ea59-4f00-a7a4-1758c630e868	2-varyant to'g'ri	single	\N	\N	1	0
607d83ae-5e92-4e17-a78d-f47573ec59b7	f03af581-ea59-4f00-a7a4-1758c630e868	1-3-varyat	multiple	\N	\N	1	1
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
1d8e8023-ca37-4c4a-9302-695b72195b35	84cb98e5-a6f3-4a25-88b0-f128fb39b216	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NGNiOThlNS1hNmYzLTRhMjUtODhiMC1mMTI4ZmIzOWIyMTYiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NzczNTI0NjMsImV4cCI6MTc3OTk0NDQ2M30.Nz4_nj8ICUph0qNoGrV7-Xn0VNsd3mMuo73p2i1C2VY	2026-05-28 10:01:03.845225+05	2026-04-28 10:01:03.845225+05
17a1da97-94db-4537-9ee8-aad0bfcd8852	84cb98e5-a6f3-4a25-88b0-f128fb39b216	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NGNiOThlNS1hNmYzLTRhMjUtODhiMC1mMTI4ZmIzOWIyMTYiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NzczNTI1NTksImV4cCI6MTc3OTk0NDU1OX0.3hohlYy57d9skjVSabX8vKJmo5Vi80I3g8gOX37OLAA	2026-05-28 10:02:39.518675+05	2026-04-28 10:02:39.518675+05
348217e2-e7f4-4ac8-9d5a-e99327cd273f	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM1MjYzMSwiZXhwIjoxNzc5OTQ0NjMxfQ.tcpqrP1Mop4fHLo7El5vq76mOi0g6KIQF6_ndXS6dak	2026-05-28 10:03:51.38506+05	2026-04-28 10:03:51.38506+05
92d711c3-1761-4c07-9183-9c5ba55fa17d	2ce8e7c1-4302-4856-a41b-1e7d30f13937	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2U4ZTdjMS00MzAyLTQ4NTYtYTQxYi0xZTdkMzBmMTM5MzciLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1MzQwMSwiZXhwIjoxNzc5OTQ1NDAxfQ.0qOTSv-JpJ5Y07vIzuMHFENpHJYIjsNcsnC4KliIm3o	2026-05-28 10:16:41.778872+05	2026-04-28 10:16:41.778872+05
1da002d4-ce8f-4214-b2df-5d0b817b016f	2ce8e7c1-4302-4856-a41b-1e7d30f13937	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2U4ZTdjMS00MzAyLTQ4NTYtYTQxYi0xZTdkMzBmMTM5MzciLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1NDA2NSwiZXhwIjoxNzc5OTQ2MDY1fQ.OnnCYBMO5tAqDJvcovO-L_SQ6Nx90LqshKgH7Flvytk	2026-05-28 10:27:45.239868+05	2026-04-28 10:27:45.239868+05
56cfd5fa-b3d6-4385-8dd1-93bccf00bf80	e6184355-d8f5-476a-a9c6-d49f877d059d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNjE4NDM1NS1kOGY1LTQ3NmEtYTljNi1kNDlmODc3ZDA1OWQiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1NDA5NiwiZXhwIjoxNzc5OTQ2MDk2fQ.BblwmDmhOyydaUACuQ9GMA5jxEPsqwV1X30-ig2ZVnw	2026-05-28 10:28:16.337189+05	2026-04-28 10:28:16.337189+05
f8873747-0e18-4396-a46b-e99c0407fa63	5a190855-5b1b-47df-870f-e99029c88873	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YTE5MDg1NS01YjFiLTQ3ZGYtODcwZi1lOTkwMjljODg4NzMiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1NDE4NiwiZXhwIjoxNzc5OTQ2MTg2fQ.FZMLVHejRmR9g0VvGwdloV6XfCtA1Mh8LIeDc6f0wfM	2026-05-28 10:29:46.234342+05	2026-04-28 10:29:46.234342+05
14f1b22f-cac1-4f54-9a5f-2e4ac54390dc	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM1NDQyOCwiZXhwIjoxNzc5OTQ2NDI4fQ.y6NhvOr1BKgzniGz6yIDHUS8FFdxsognjx98LqmFyAI	2026-05-28 10:33:48.47496+05	2026-04-28 10:33:48.47496+05
54da0c21-bbbd-4bc9-b1fd-bb4f7d0d75e0	136bfe48-4a35-427e-a976-856e65e44e99	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzZiZmU0OC00YTM1LTQyN2UtYTk3Ni04NTZlNjVlNDRlOTkiLCJyb2xlIjoicGFyZW50IiwiaWF0IjoxNzc3MzU4Nzg3LCJleHAiOjE3Nzk5NTA3ODd9.C63yWgn8MP8bKGZ-1fSfMc09jPXkKiKWbk85kRHXCds	2026-05-28 11:46:27.817703+05	2026-04-28 11:46:27.817703+05
3befa106-8118-494c-8e7b-a6cffba5f59a	2ce8e7c1-4302-4856-a41b-1e7d30f13937	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2U4ZTdjMS00MzAyLTQ4NTYtYTQxYi0xZTdkMzBmMTM5MzciLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1ODg1OCwiZXhwIjoxNzc5OTUwODU4fQ.SJUzLkYnt-ffKt6uhARL08UATerbC9b8q9d8s24lvW0	2026-05-28 11:47:38.744831+05	2026-04-28 11:47:38.744831+05
2a1bd235-a8ce-455b-a35b-b0740802e033	2ce8e7c1-4302-4856-a41b-1e7d30f13937	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2U4ZTdjMS00MzAyLTQ4NTYtYTQxYi0xZTdkMzBmMTM5MzciLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc3NzM1ODg3NCwiZXhwIjoxNzc5OTUwODc0fQ.dovvanuSPEUGPTGZMfTdnvrltqD-Y_LxmmolTn5_GoU	2026-05-28 11:47:54.795535+05	2026-04-28 11:47:54.795535+05
7b312281-f4ca-4b4f-a4ad-5f6976b2f3bb	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM1ODg3OSwiZXhwIjoxNzc5OTUwODc5fQ.hrabtkRuhZTGTuiKPNq_0wAmF7lOYnR9dMGtWwC2Wfg	2026-05-28 11:47:59.887848+05	2026-04-28 11:47:59.887848+05
58ca8a44-72fa-4662-98a4-63c80ff42fb1	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM1OTMzOCwiZXhwIjoxNzc5OTUxMzM4fQ.URd6R_1Y1XrBKSn7Bb__IoMBjbmJdSOFwMSHjUc5144	2026-05-28 11:55:38.773751+05	2026-04-28 11:55:38.773751+05
d152fc19-46a2-4ab3-9d6b-0970f2e99c1a	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM2MDk1OSwiZXhwIjoxNzc5OTUyOTU5fQ.KP46hGiKX821GpMlWgz7vO_hgfKcIhTkAqJhXkG5U1w	2026-05-28 12:22:39.432112+05	2026-04-28 12:22:39.432112+05
db15a1b0-d052-47c4-854d-bfab8746863b	136bfe48-4a35-427e-a976-856e65e44e99	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzZiZmU0OC00YTM1LTQyN2UtYTk3Ni04NTZlNjVlNDRlOTkiLCJyb2xlIjoicGFyZW50IiwiaWF0IjoxNzc3MzYxMDIwLCJleHAiOjE3Nzk5NTMwMjB9.BGrGSCXtF8WtV0tQlJ56_11noA9rb_ut9HK0tB4MWq0	2026-05-28 12:23:40.646843+05	2026-04-28 12:23:40.646843+05
ced73890-a818-46a6-9e3b-2f866dc5b364	136bfe48-4a35-427e-a976-856e65e44e99	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzZiZmU0OC00YTM1LTQyN2UtYTk3Ni04NTZlNjVlNDRlOTkiLCJyb2xlIjoicGFyZW50IiwiaWF0IjoxNzc3MzcyOTkwLCJleHAiOjE3Nzk5NjQ5OTB9.2bZ9eCuaPhlsc_k-3-8M8CPvzlFIWZKwc6sWIPgWkm8	2026-05-28 15:43:10.266147+05	2026-04-28 15:43:10.266147+05
688f4cbb-6279-4d37-9b58-e8bbe64fa68a	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM3MzAzNywiZXhwIjoxNzc5OTY1MDM3fQ.yf2aH9ynjJHU8RZLO506OXBGZr9tn9eEwauUEyN8_gw	2026-05-28 15:43:57.835703+05	2026-04-28 15:43:57.835703+05
f3887f37-0e36-4181-9f65-35bfbc6a7ed2	b33454fb-dabb-4f59-9c8e-99fe4aea5430	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzM0NTRmYi1kYWJiLTRmNTktOWM4ZS05OWZlNGFlYTU0MzAiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTc3NzM3NTEyNSwiZXhwIjoxNzc5OTY3MTI1fQ.9te9V59viqSHtIGA7p-PA7kz99dmplHtRfR8MP7E0OI	2026-05-28 16:18:45.272851+05	2026-04-28 16:18:45.272851+05
215c3808-af95-4bae-a16c-f0679bbbc462	84cb98e5-a6f3-4a25-88b0-f128fb39b216	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NGNiOThlNS1hNmYzLTRhMjUtODhiMC1mMTI4ZmIzOWIyMTYiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NzczNzUxNDMsImV4cCI6MTc3OTk2NzE0M30.yrnGKyOR4noVMjDOGCa8VtjRAMna-U0JRfOom4j9Q2w	2026-05-28 16:19:03.11082+05	2026-04-28 16:19:03.11082+05
\.


--
-- Data for Name: school_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_subjects (school_id, subject_id) FROM stdin;
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, name, address, director_id, created_at) FROM stdin;
10ab52fb-6002-42c7-ae34-bb184f421b5d	44-maktab	Toshkent sh. chlonzor	458bde8d-af34-45a7-860d-2f94c842d449	2026-04-19 21:13:10.913831+05
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (user_id, school_id, class_id, approved_by, approved_at, rejection_reason) FROM stdin;
e6184355-d8f5-476a-a9c6-d49f877d059d	10ab52fb-6002-42c7-ae34-bb184f421b5d	b213d79b-7642-425f-93b8-c8bd48ca0978	\N	2026-04-20 20:47:18.544+05	\N
2ce8e7c1-4302-4856-a41b-1e7d30f13937	10ab52fb-6002-42c7-ae34-bb184f421b5d	b213d79b-7642-425f-93b8-c8bd48ca0978	\N	2026-04-20 20:47:23.188+05	\N
5a190855-5b1b-47df-870f-e99029c88873	10ab52fb-6002-42c7-ae34-bb184f421b5d	b213d79b-7642-425f-93b8-c8bd48ca0978	b33454fb-dabb-4f59-9c8e-99fe4aea5430	2026-04-28 10:33:52.029515+05	\N
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Matematika	2026-04-20 13:41:18.67416+05
00000000-0000-0000-0000-000000000002	O'zbek tili	2026-04-20 13:41:18.67416+05
00000000-0000-0000-0000-000000000003	Ingliz tili	2026-04-20 13:41:18.67416+05
00000000-0000-0000-0000-000000000004	Tarix	2026-04-20 13:41:18.67416+05
00000000-0000-0000-0000-000000000005	Biologiya	2026-04-20 13:41:18.67416+05
64a577eb-be07-4b82-be0c-cb636ccfa6e0	Fizika	2026-04-22 12:10:46.72205+05
465d73b8-7a42-4b04-8a21-845beb8963fc	Informatika va axborot texnologiyalari	2026-04-26 14:45:55.791088+05
\.


--
-- Data for Name: teacher_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_assignments (id, teacher_id, school_id, class_id, subject_id) FROM stdin;
d9bc2170-3d91-496c-8c7c-df408040b7c6	b33454fb-dabb-4f59-9c8e-99fe4aea5430	10ab52fb-6002-42c7-ae34-bb184f421b5d	b213d79b-7642-425f-93b8-c8bd48ca0978	00000000-0000-0000-0000-000000000005
08456346-0ebf-4818-ba6c-60b2f876024b	b33454fb-dabb-4f59-9c8e-99fe4aea5430	10ab52fb-6002-42c7-ae34-bb184f421b5d	30776358-198f-484b-b77f-f8d982ed05aa	00000000-0000-0000-0000-000000000005
8a9bd974-d9ea-4e5b-9181-88fdf412d779	b33454fb-dabb-4f59-9c8e-99fe4aea5430	10ab52fb-6002-42c7-ae34-bb184f421b5d	999f1fbb-51aa-4df0-a653-5d3073e1f61d	00000000-0000-0000-0000-000000000005
bdaee8ef-3e90-4e83-a4bc-8fe9cc3ea051	b33454fb-dabb-4f59-9c8e-99fe4aea5430	10ab52fb-6002-42c7-ae34-bb184f421b5d	6205e309-4e0b-4dc6-9c09-d296542aa32f	00000000-0000-0000-0000-000000000005
\.


--
-- Data for Name: test_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_answers (id, attempt_id, question_id, answer_text, selected_option_ids, is_correct) FROM stdin;
d9594990-4b8e-4537-935d-04805ddb64ca	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000001	43b1a28a-d86f-423e-88ca-7d3c90ed0a50	\N	f
24115d99-0ef0-4bd9-851f-a7cedf2c0f1c	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000002	23cee2d9-79ed-48fb-906c-d8fcbf0bb673	\N	f
1468f124-ef5b-47ca-9bb6-bf039fdc5998	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000003	d425f24d-cf70-4a80-bb92-74b376a10535	\N	f
ce94db0e-a0ca-47ab-8e4f-81688b15125b	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000004	a5674579-bb0a-4b69-a8a4-c880ea9bc9b4	\N	f
2c19c1d6-2405-4dcf-bee3-ca7be7f8c470	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000005	9d1ac34a-b0b6-4e81-bb2d-8ab97d2810da	\N	f
d59e701b-6a64-4145-9ee8-4d39c684913c	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000006	c72c8bcd-d89e-4d89-84f4-5306e40417e9	\N	f
65a0875b-408f-445d-88e6-8eecf9303768	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000007	c6f33bd0-0463-4d60-8dd1-419b14fd3bce	\N	f
0a11c58b-b1cc-4f40-a59e-96e98fda2891	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000008	fdd79834-1bdc-4fee-a897-20c287a34574	\N	f
1e384ac0-06fa-4468-ad8e-5f0863be9576	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000009	4e0a05f9-0441-40a6-9f0a-97814e00314c	\N	f
dc504573-aa09-42f3-be5a-e9c4acd7d61d	358b5b2c-c89c-452f-878b-f1020958a824	20000000-0000-0000-0000-000000000010	d98ad181-9876-4b3b-9675-6b26186dc658	\N	f
8bfb36fa-8052-4d17-b666-58d07431d3bb	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000001	43b1a28a-d86f-423e-88ca-7d3c90ed0a50	\N	f
2daa49ce-9ab6-440c-8961-de80a4e328f5	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000002	23cee2d9-79ed-48fb-906c-d8fcbf0bb673	\N	f
8b926842-24a2-427f-8383-f9ed589f1878	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000003	d425f24d-cf70-4a80-bb92-74b376a10535	\N	f
b3ca2b88-b56c-4ec5-b824-2ee7a02417a1	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000004	a5674579-bb0a-4b69-a8a4-c880ea9bc9b4	\N	f
67a96829-a9f0-4085-9d36-4c6f89af9274	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000005	4dbe73bb-bc61-44bf-bcea-494268daf4e7	\N	f
f0b93490-0d23-4067-9562-3c9b98f5f060	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000006	c72c8bcd-d89e-4d89-84f4-5306e40417e9	\N	f
93dd76f4-c532-409a-ba4c-dcfd77c92a5e	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000007	c6f33bd0-0463-4d60-8dd1-419b14fd3bce	\N	f
2b96a195-fd26-4a49-8d12-f1e97587928a	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000008	7bd249ff-460d-4669-a2a8-03685d58e0a1	\N	f
15b70940-89d2-482e-b99a-3dbff024a477	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000009	ad55ef06-0274-405c-ae18-2bf76b9a636f	\N	f
949943aa-7af5-45cb-aaa0-2cb6ca8e106d	00ba9489-a66d-4e97-a973-02ae5f13b8e2	20000000-0000-0000-0000-000000000010	d98ad181-9876-4b3b-9675-6b26186dc658	\N	f
3344ab68-558c-4300-9cc5-262caede48c9	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000001	43b1a28a-d86f-423e-88ca-7d3c90ed0a50	\N	f
454f3ec3-a039-48f6-9399-18a2249d8160	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000002	23cee2d9-79ed-48fb-906c-d8fcbf0bb673	\N	f
338f3df5-8b6b-41ab-ad70-e319bc5e69dc	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000003	d425f24d-cf70-4a80-bb92-74b376a10535	\N	f
a353fb9a-d218-4ff8-8b3b-5e61bf26ba3b	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000004	a5674579-bb0a-4b69-a8a4-c880ea9bc9b4	\N	f
5550e131-34e5-4ffa-a421-968950825fd3	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000005	4dbe73bb-bc61-44bf-bcea-494268daf4e7	\N	f
1956c0b0-31da-46cc-b111-5621746ecb3a	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000006	c72c8bcd-d89e-4d89-84f4-5306e40417e9	\N	f
f862ecea-9e07-42c6-a3aa-b6516dd8298d	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000007	c6f33bd0-0463-4d60-8dd1-419b14fd3bce	\N	f
bb049c7d-2c7b-4e1e-a5a8-a1a09d513212	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000008	fdd79834-1bdc-4fee-a897-20c287a34574	\N	f
960da783-dcc5-419b-bba6-5666c5d346e0	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000009	ad55ef06-0274-405c-ae18-2bf76b9a636f	\N	f
331cb6b5-21cb-4df8-89b1-b9db91b9b7d4	9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	20000000-0000-0000-0000-000000000010	0497a761-09df-492f-bc7d-f233e5a5a155	\N	f
b1481cde-694c-4a1b-91c9-2b98462404aa	a7e03d48-9495-4155-bfe1-48b50102f681	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
0daaebe8-02d5-4bbd-a682-104560015200	a7e03d48-9495-4155-bfe1-48b50102f681	607d83ae-5e92-4e17-a78d-f47573ec59b7		{cb540b12-fca1-4a43-b2b9-252889de5326,31dffee5-3f47-4970-9b80-4f54148acef2}	f
f3c0e33c-fc61-4bb9-87c0-8063a6cc9ef5	ae9f68de-b931-4d84-8951-8d435512e2a3	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
c4382907-eaf7-49d9-a67d-76033de9937a	ae9f68de-b931-4d84-8951-8d435512e2a3	607d83ae-5e92-4e17-a78d-f47573ec59b7		{cb540b12-fca1-4a43-b2b9-252889de5326,7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13}	t
d9e3d20c-fab4-4f68-ae4d-96920a0322c8	5966053f-3657-4135-9455-42f7274a0354	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
e1603f31-ab74-4661-aca1-d6762f808ce8	5966053f-3657-4135-9455-42f7274a0354	607d83ae-5e92-4e17-a78d-f47573ec59b7		{31dffee5-3f47-4970-9b80-4f54148acef2,9836addb-3dcf-4077-94e0-ca6e70b82ce3}	f
c0a5ae3e-e0ec-4400-9223-ae9534aa0be0	a2bb85cd-6681-4de0-87a2-983266c8f74b	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
27f7782a-9880-4670-9f16-595f5ec88950	a2bb85cd-6681-4de0-87a2-983266c8f74b	607d83ae-5e92-4e17-a78d-f47573ec59b7		{31dffee5-3f47-4970-9b80-4f54148acef2,9836addb-3dcf-4077-94e0-ca6e70b82ce3}	f
cab0d9f6-8e7b-4003-9614-b073376d5b00	8a7995e2-4f4c-4cec-88cf-75bb4e476b13	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
096b674c-83d8-4819-93bc-e637b7d51928	8a7995e2-4f4c-4cec-88cf-75bb4e476b13	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
f8221322-bf00-4cd9-bf54-049e3da06348	a5e0e305-7519-4c24-a8c1-61b5b6c80503	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
d3454f12-5459-4171-bba5-ea643e8c70e4	a5e0e305-7519-4c24-a8c1-61b5b6c80503	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
446b57e7-0165-4bc2-9060-b08c355649be	3fe59285-c1c9-4aab-9d04-afb54d6a0236	96bba195-379b-4b36-a03b-38992f3d6e1c		{79ed77f8-3b29-45e9-a79c-75890ee440fa}	f
ff44eee2-96fd-4c70-a365-1a147b555295	3fe59285-c1c9-4aab-9d04-afb54d6a0236	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
55c91cc6-e377-4c81-97c0-5f683491262d	13df83d2-8f4d-49a5-986e-9dfc032d5d02	96bba195-379b-4b36-a03b-38992f3d6e1c		{79ed77f8-3b29-45e9-a79c-75890ee440fa}	f
1b72a11d-5917-41b9-af2b-08bf7905b734	13df83d2-8f4d-49a5-986e-9dfc032d5d02	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
161aef46-2799-4aae-841c-4c9dc7dcb935	2a593824-81bc-4c1b-a378-89000ef6d34f	96bba195-379b-4b36-a03b-38992f3d6e1c		{79ed77f8-3b29-45e9-a79c-75890ee440fa}	f
02d7cef2-79be-45cd-8cf6-154e51118537	2a593824-81bc-4c1b-a378-89000ef6d34f	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
2cb41164-d6f0-4709-a172-54d9c5a7ac4c	3c9463bd-f0be-466f-887a-5ffc87c42381	96bba195-379b-4b36-a03b-38992f3d6e1c		{b9a34a84-3cf7-49dc-978e-8420459389f8}	t
7465ddfa-248e-4bff-a6a1-dc3355c19b27	3c9463bd-f0be-466f-887a-5ffc87c42381	607d83ae-5e92-4e17-a78d-f47573ec59b7		{7a2f6e48-cbb1-403a-b5e5-05e2e7e66c13,cb540b12-fca1-4a43-b2b9-252889de5326}	t
\.


--
-- Data for Name: test_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_attempts (id, student_id, test_id, started_at, finished_at, score) FROM stdin;
358b5b2c-c89c-452f-878b-f1020958a824	5a190855-5b1b-47df-870f-e99029c88873	10000000-0000-0000-0000-000000000001	2026-04-20 13:53:35.496+05	2026-04-20 13:53:35.497+05	60.00
00ba9489-a66d-4e97-a973-02ae5f13b8e2	e9c8f79d-de96-40ab-971c-16fc7408b79a	10000000-0000-0000-0000-000000000001	2026-04-21 11:03:49.547+05	2026-04-21 11:03:49.547+05	70.00
9bc7740f-9fbe-4c69-aba8-64c2b2428ff8	c22d2be6-938b-4649-9401-d38fe1684f3a	10000000-0000-0000-0000-000000000001	2026-04-23 06:24:43.718+05	2026-04-23 06:24:43.718+05	90.00
a7e03d48-9495-4155-bfe1-48b50102f681	2ce8e7c1-4302-4856-a41b-1e7d30f13937	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-24 12:23:05.422+05	2026-04-24 12:23:32.085+05	50.00
ae9f68de-b931-4d84-8951-8d435512e2a3	2ce8e7c1-4302-4856-a41b-1e7d30f13937	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-24 12:47:55.104+05	2026-04-24 12:48:03.566+05	100.00
5966053f-3657-4135-9455-42f7274a0354	e6184355-d8f5-476a-a9c6-d49f877d059d	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:28:26.770071+05	2026-04-28 10:28:34.612516+05	50.00
a2bb85cd-6681-4de0-87a2-983266c8f74b	e6184355-d8f5-476a-a9c6-d49f877d059d	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:28:54.847517+05	2026-04-28 10:29:03.561227+05	50.00
8a7995e2-4f4c-4cec-88cf-75bb4e476b13	e6184355-d8f5-476a-a9c6-d49f877d059d	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:29:09.528677+05	2026-04-28 10:29:17.408008+05	100.00
a5e0e305-7519-4c24-a8c1-61b5b6c80503	5a190855-5b1b-47df-870f-e99029c88873	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:32:28.918386+05	2026-04-28 10:32:36.928619+05	100.00
3fe59285-c1c9-4aab-9d04-afb54d6a0236	5a190855-5b1b-47df-870f-e99029c88873	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:32:46.876705+05	2026-04-28 10:32:52.173291+05	50.00
13df83d2-8f4d-49a5-986e-9dfc032d5d02	5a190855-5b1b-47df-870f-e99029c88873	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:32:56.71127+05	2026-04-28 10:33:03.475531+05	50.00
2a593824-81bc-4c1b-a378-89000ef6d34f	5a190855-5b1b-47df-870f-e99029c88873	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:33:09.167011+05	2026-04-28 10:33:18.581253+05	50.00
3c9463bd-f0be-466f-887a-5ffc87c42381	5a190855-5b1b-47df-870f-e99029c88873	f03af581-ea59-4f00-a7a4-1758c630e868	2026-04-28 10:33:24.010555+05	2026-04-28 10:33:35.292639+05	100.00
\.


--
-- Data for Name: test_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_classes (test_id, class_id) FROM stdin;
f03af581-ea59-4f00-a7a4-1758c630e868	b213d79b-7642-425f-93b8-c8bd48ca0978
f03af581-ea59-4f00-a7a4-1758c630e868	30776358-198f-484b-b77f-f8d982ed05aa
f03af581-ea59-4f00-a7a4-1758c630e868	999f1fbb-51aa-4df0-a653-5d3073e1f61d
f03af581-ea59-4f00-a7a4-1758c630e868	6205e309-4e0b-4dc6-9c09-d296542aa32f
f03af581-ea59-4f00-a7a4-1758c630e868	f45a6a0a-9d5a-4b4d-9112-2b536b7a3732
f03af581-ea59-4f00-a7a4-1758c630e868	c823e88c-f5de-42de-8f63-7cd72a11c109
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tests (id, teacher_id, subject_id, title, description, time_limit, test_type, max_attempts, created_at) FROM stdin;
10000000-0000-0000-0000-000000000001	\N	00000000-0000-0000-0000-000000000001	Matematika — Kirish testi	5-sinf matematika bo'yicha boshlang'ich bilim darajasini aniqlash testi.	600	entry	1	2026-04-20 13:41:18.67416+05
f03af581-ea59-4f00-a7a4-1758c630e868	b33454fb-dabb-4f59-9c8e-99fe4aea5430	00000000-0000-0000-0000-000000000005	prosta	testtt	\N	home_study	\N	2026-04-22 11:50:01.464268+05
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, phone, password_hash, first_name, last_name, role, status, created_at) FROM stdin;
84cb98e5-a6f3-4a25-88b0-f128fb39b216	+998882002772	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Javohir	Mahmaraimov	super_admin	active	2026-04-19 20:03:23.736084+05
b33454fb-dabb-4f59-9c8e-99fe4aea5430	+998882002773	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Teacher	T	teacher	active	2026-04-20 13:29:26.554312+05
458bde8d-af34-45a7-860d-2f94c842d449	+998882002777	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Drektor	D	director	active	2026-04-20 14:05:47.17151+05
677fa5d4-5f8e-470d-8386-3faecb5c81fa	+998915187681	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Baxtı	Choriyev	teacher	active	2026-04-20 15:55:04.03134+05
e6184355-d8f5-476a-a9c6-d49f877d059d	+998882002775	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Ali	A	student	active	2026-04-20 13:42:11.833947+05
2ce8e7c1-4302-4856-a41b-1e7d30f13937	+998882002774	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Student	S	student	active	2026-04-20 13:30:39.119153+05
e9c8f79d-de96-40ab-971c-16fc7408b79a	+998977603441	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Gulnora	Ubaydullayeva	teacher	active	2026-04-21 11:02:20.591239+05
c22d2be6-938b-4649-9401-d38fe1684f3a	+998901234567	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Test	Test	student	pending	2026-04-23 06:22:55.875537+05
5a190855-5b1b-47df-870f-e99029c88873	+998882002776	$2a$10$kjJesLMdyOZp46eyjQlPu.bvsji2Q2yEX3dTx1MoY79HuXoj/magK	Vali	V	student	active	2026-04-20 13:52:02.806535+05
136bfe48-4a35-427e-a976-856e65e44e99	+998882002787	$2a$10$.hwTsyNGdbJffa88JJjwHe8Nb0aZjaFjXJnLxk/LaWwaGi0CRIpfy	Ota	Ona	parent	active	2026-04-28 11:46:27.787504+05
\.


--
-- Name: accessibility_profiles accessibility_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accessibility_profiles
    ADD CONSTRAINT accessibility_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_student_id_key UNIQUE (assignment_id, student_id);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: book_bookmarks book_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_bookmarks
    ADD CONSTRAINT book_bookmarks_pkey PRIMARY KEY (user_id, book_id);


--
-- Name: book_classes book_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: javohir
--

ALTER TABLE ONLY public.book_classes
    ADD CONSTRAINT book_classes_pkey PRIMARY KEY (book_id, class_id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_rooms chat_rooms_parent_id_teacher_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_parent_id_teacher_id_student_id_key UNIQUE (parent_id, teacher_id, student_id);


--
-- Name: chat_rooms chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: classes classes_school_id_grade_letter_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_grade_letter_key UNIQUE (school_id, grade, letter);


--
-- Name: game_attempts game_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_attempts
    ADD CONSTRAINT game_attempts_pkey PRIMARY KEY (id);


--
-- Name: game_classes game_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_classes
    ADD CONSTRAINT game_classes_pkey PRIMARY KEY (game_id, class_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: lecture_subtitles lecture_subtitles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecture_subtitles
    ADD CONSTRAINT lecture_subtitles_pkey PRIMARY KEY (id);


--
-- Name: lectures lectures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectures
    ADD CONSTRAINT lectures_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parent_students parent_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_pkey PRIMARY KEY (parent_id, student_id);


--
-- Name: question_options question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: school_subjects school_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_subjects
    ADD CONSTRAINT school_subjects_pkey PRIMARY KEY (school_id, subject_id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: subjects subjects_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_name_key UNIQUE (name);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_teacher_id_class_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_teacher_id_class_id_subject_id_key UNIQUE (teacher_id, class_id, subject_id);


--
-- Name: test_answers test_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_pkey PRIMARY KEY (id);


--
-- Name: test_attempts test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_pkey PRIMARY KEY (id);


--
-- Name: test_classes test_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_classes
    ADD CONSTRAINT test_classes_pkey PRIMARY KEY (test_id, class_id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_answers_attempt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answers_attempt ON public.test_answers USING btree (attempt_id);


--
-- Name: idx_assignments_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_class ON public.assignments USING btree (class_id);


--
-- Name: idx_attempts_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attempts_student ON public.test_attempts USING btree (student_id);


--
-- Name: idx_attempts_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attempts_test ON public.test_attempts USING btree (test_id);


--
-- Name: idx_chat_messages_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_room ON public.chat_messages USING btree (room_id);


--
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);


--
-- Name: idx_chat_rooms_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_rooms_parent ON public.chat_rooms USING btree (parent_id);


--
-- Name: idx_chat_rooms_teacher; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_rooms_teacher ON public.chat_rooms USING btree (teacher_id);


--
-- Name: idx_classes_school; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_classes_school ON public.classes USING btree (school_id);


--
-- Name: idx_game_attempts_game; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_game_attempts_game ON public.game_attempts USING btree (game_id);


--
-- Name: idx_game_attempts_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_game_attempts_student ON public.game_attempts USING btree (student_id);


--
-- Name: idx_lectures_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lectures_class ON public.lectures USING btree (class_id);


--
-- Name: idx_lectures_creator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lectures_creator ON public.lectures USING btree (creator_id);


--
-- Name: idx_lectures_subject; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lectures_subject ON public.lectures USING btree (subject_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_options_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_options_question ON public.question_options USING btree (question_id);


--
-- Name: idx_ps_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_parent ON public.parent_students USING btree (parent_id);


--
-- Name: idx_ps_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_student ON public.parent_students USING btree (student_id);


--
-- Name: idx_questions_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_questions_test ON public.questions USING btree (test_id);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_sp_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sp_class ON public.student_profiles USING btree (class_id);


--
-- Name: idx_sp_school; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sp_school ON public.student_profiles USING btree (school_id);


--
-- Name: idx_ta_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ta_class ON public.teacher_assignments USING btree (class_id);


--
-- Name: idx_ta_teacher; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ta_teacher ON public.teacher_assignments USING btree (teacher_id);


--
-- Name: idx_tests_subject; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tests_subject ON public.tests USING btree (subject_id);


--
-- Name: idx_tests_teacher; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tests_teacher ON public.tests USING btree (teacher_id);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: accessibility_profiles accessibility_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accessibility_profiles
    ADD CONSTRAINT accessibility_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: book_bookmarks book_bookmarks_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_bookmarks
    ADD CONSTRAINT book_bookmarks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_bookmarks book_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_bookmarks
    ADD CONSTRAINT book_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: book_classes book_classes_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: javohir
--

ALTER TABLE ONLY public.book_classes
    ADD CONSTRAINT book_classes_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_classes book_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: javohir
--

ALTER TABLE ONLY public.book_classes
    ADD CONSTRAINT book_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: books books_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_rooms chat_rooms_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_rooms chat_rooms_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_rooms chat_rooms_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: classes classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: game_attempts game_attempts_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_attempts
    ADD CONSTRAINT game_attempts_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: game_attempts game_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_attempts
    ADD CONSTRAINT game_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: game_classes game_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_classes
    ADD CONSTRAINT game_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: game_classes game_classes_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_classes
    ADD CONSTRAINT game_classes_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: games games_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: games games_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: games games_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lecture_subtitles lecture_subtitles_lecture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecture_subtitles
    ADD CONSTRAINT lecture_subtitles_lecture_id_fkey FOREIGN KEY (lecture_id) REFERENCES public.lectures(id) ON DELETE CASCADE;


--
-- Name: lectures lectures_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectures
    ADD CONSTRAINT lectures_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: lectures lectures_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectures
    ADD CONSTRAINT lectures_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lectures lectures_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectures
    ADD CONSTRAINT lectures_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: lectures lectures_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lectures
    ADD CONSTRAINT lectures_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_students parent_students_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_students parent_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: question_options question_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: questions questions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: school_subjects school_subjects_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_subjects
    ADD CONSTRAINT school_subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_subjects school_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_subjects
    ADD CONSTRAINT school_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: schools schools_director_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_director_id_fkey FOREIGN KEY (director_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: student_profiles student_profiles_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.test_attempts(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_classes test_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_classes
    ADD CONSTRAINT test_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: test_classes test_classes_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_classes
    ADD CONSTRAINT test_classes_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: tests tests_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: tests tests_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GDDmEZIf6XW3tYeBPjSwimGQOY1sD6n0R4lm25lVXGopsITt4N9OSDxRk1OfCbM

