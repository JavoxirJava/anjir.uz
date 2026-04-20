-- =============================================================
-- Seed: namuna ma'lumotlar — fanlar, demo test, savollar, javoblar
-- =============================================================

-- teacher_id NULL bo'lishi mumkin qilib o'zgartir
ALTER TABLE public.tests ALTER COLUMN teacher_id DROP NOT NULL;

-- -------------------------------------------------------------
-- Fanlar (subjects)
-- -------------------------------------------------------------
INSERT INTO public.subjects (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Matematika'),
  ('00000000-0000-0000-0000-000000000002', 'O''zbek tili'),
  ('00000000-0000-0000-0000-000000000003', 'Ingliz tili'),
  ('00000000-0000-0000-0000-000000000004', 'Tarix'),
  ('00000000-0000-0000-0000-000000000005', 'Biologiya')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Demo kirish testi (super_admin yaratgan, teacher_id = NULL)
-- -------------------------------------------------------------
INSERT INTO public.tests (id, teacher_id, subject_id, title, description, test_type, time_limit, max_attempts)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  NULL,
  '00000000-0000-0000-0000-000000000001',
  'Matematika — Kirish testi',
  '5-sinf matematika bo''yicha boshlang''ich bilim darajasini aniqlash testi.',
  'entry',
  600,
  1
) ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 10 ta savol
-- -------------------------------------------------------------
INSERT INTO public.questions (id, test_id, question_text, question_type, points, "order") VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2 + 2 = ?', 'single', 1, 1),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10 × 5 = ?', 'single', 1, 2),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '100 ÷ 4 = ?', 'single', 1, 3),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '15 - 7 = ?', 'single', 1, 4),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '3 × 3 × 3 = ?', 'single', 1, 5),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '7 son tub son hisoblanadimi?', 'true_false', 1, 6),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '0 son juft son hisoblanadimi?', 'true_false', 1, 7),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '2^10 = ?', 'single', 1, 8),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'Uchburchak perimetri formulasi: P = a + b + c. Bu to''g''rimi?', 'true_false', 1, 9),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '1 soatda necha sekund bor?', 'single', 1, 10)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Javob variantlari
-- -------------------------------------------------------------

-- 1-savol: 2+2=4
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000001', '3', false),
('20000000-0000-0000-0000-000000000001', '4', true),
('20000000-0000-0000-0000-000000000001', '5', false),
('20000000-0000-0000-0000-000000000001', '6', false);

-- 2-savol: 10×5=50
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000002', '40', false),
('20000000-0000-0000-0000-000000000002', '45', false),
('20000000-0000-0000-0000-000000000002', '50', true),
('20000000-0000-0000-0000-000000000002', '55', false);

-- 3-savol: 100÷4=25
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000003', '20', false),
('20000000-0000-0000-0000-000000000003', '24', false),
('20000000-0000-0000-0000-000000000003', '25', true),
('20000000-0000-0000-0000-000000000003', '30', false);

-- 4-savol: 15-7=8
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000004', '6', false),
('20000000-0000-0000-0000-000000000004', '7', false),
('20000000-0000-0000-0000-000000000004', '8', true),
('20000000-0000-0000-0000-000000000004', '9', false);

-- 5-savol: 3×3×3=27
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000005', '9', false),
('20000000-0000-0000-0000-000000000005', '18', false),
('20000000-0000-0000-0000-000000000005', '27', true),
('20000000-0000-0000-0000-000000000005', '81', false);

-- 6-savol: 7 tub son - ha
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000006', 'Ha', true),
('20000000-0000-0000-0000-000000000006', 'Yo''q', false);

-- 7-savol: 0 juft son - ha
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000007', 'Ha', true),
('20000000-0000-0000-0000-000000000007', 'Yo''q', false);

-- 8-savol: 2^10=1024
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000008', '512', false),
('20000000-0000-0000-0000-000000000008', '1000', false),
('20000000-0000-0000-0000-000000000008', '1024', true),
('20000000-0000-0000-0000-000000000008', '2048', false);

-- 9-savol: uchburchak perimetri - ha
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000009', 'Ha', true),
('20000000-0000-0000-0000-000000000009', 'Yo''q', false);

-- 10-savol: 1 soat = 3600 sekund
INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000010', '60', false),
('20000000-0000-0000-0000-000000000010', '360', false),
('20000000-0000-0000-0000-000000000010', '3600', true),
('20000000-0000-0000-0000-000000000010', '36000', false);
