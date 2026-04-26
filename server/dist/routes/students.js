"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET /students/me — o'z profili
router.get("/me", (0, role_1.requireRole)("student"), async (req, res) => {
    const { rows } = await pool_1.pool.query(`SELECT u.id, u.first_name, u.last_name, u.phone, u.status,
            sp.class_id, sp.school_id, sp.approved_at,
            c.grade, c.letter,
            s.name AS school_name
     FROM users u
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN classes c ON c.id = sp.class_id
     LEFT JOIN schools s ON s.id = sp.school_id
     WHERE u.id = $1`, [req.user.sub]);
    res.json(rows[0] ?? null);
});
// GET /students/me/results — o'z natijalari
router.get("/me/results", (0, role_1.requireRole)("student"), async (req, res) => {
    const studentId = req.user.sub;
    const [tests, games, assignments] = await Promise.all([
        pool_1.pool.query(`SELECT ta.id, ta.score, ta.started_at, ta.finished_at,
              t.title, t.test_type, sub.name AS subject_name
       FROM test_attempts ta
       JOIN tests t ON t.id = ta.test_id
       JOIN subjects sub ON sub.id = t.subject_id
       WHERE ta.student_id = $1 AND ta.finished_at IS NOT NULL
       ORDER BY ta.finished_at DESC LIMIT 30`, [studentId]),
        pool_1.pool.query(`SELECT ga.id, ga.score, ga.duration, ga.completed_at,
              g.title, sub.name AS subject_name
       FROM game_attempts ga
       JOIN games g ON g.id = ga.game_id
       JOIN subjects sub ON sub.id = g.subject_id
       WHERE ga.student_id = $1
       ORDER BY ga.completed_at DESC LIMIT 20`, [studentId]),
        pool_1.pool.query(`SELECT asub.id, asub.score, asub.submitted_at, asub.teacher_comment,
              a.title, a.max_score, sub.name AS subject_name
       FROM assignment_submissions asub
       JOIN assignments a ON a.id = asub.assignment_id
       JOIN subjects sub ON sub.id = a.subject_id
       WHERE asub.student_id = $1
       ORDER BY asub.submitted_at DESC LIMIT 20`, [studentId]),
    ]);
    res.json({ tests: tests.rows, games: games.rows, assignments: assignments.rows });
});
// GET /students (teacher/director/admin)
router.get("/", (0, role_1.requireRole)("teacher", "director", "super_admin"), async (req, res) => {
    const { class_id } = req.query;
    const { rows } = await pool_1.pool.query(`SELECT u.id, u.first_name, u.last_name, u.phone, u.status,
              sp.class_id, sp.school_id, sp.approved_at
       FROM users u
       JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.role = 'student'
         ${class_id ? "AND sp.class_id = $1" : ""}
       ORDER BY u.last_name, u.first_name`, class_id ? [class_id] : []);
    res.json(rows);
});
exports.default = router;
