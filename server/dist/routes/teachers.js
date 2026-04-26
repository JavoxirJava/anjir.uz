"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, role_1.requireRole)("teacher", "director", "super_admin"));
// GET /teachers — barcha o'qituvchilar
router.get("/", async (_req, res) => {
    const { rows } = await pool_1.pool.query(`SELECT u.id, u.first_name, u.last_name, u.phone, u.status,
            COALESCE(
              json_agg(
                json_build_object('class_id', ta.class_id, 'subject_id', ta.subject_id, 'subject_name', sub.name)
              ) FILTER (WHERE ta.id IS NOT NULL), '[]'
            ) AS assignments
     FROM users u
     LEFT JOIN teacher_assignments ta ON ta.teacher_id = u.id
     LEFT JOIN subjects sub ON sub.id = ta.subject_id
     WHERE u.role = 'teacher'
     GROUP BY u.id
     ORDER BY u.last_name, u.first_name`);
    res.json(rows);
});
// GET /teachers/:id/students — o'qituvchining o'quvchilari (K-adapt bilan)
router.get("/:id/students", async (req, res) => {
    const teacherId = req.params.id;
    const { subject_id } = req.query;
    const { rows: classIds } = await pool_1.pool.query(`SELECT DISTINCT class_id FROM teacher_assignments WHERE teacher_id = $1 ${subject_id ? "AND subject_id = $2" : ""}`, subject_id ? [teacherId, subject_id] : [teacherId]);
    if (classIds.length === 0) {
        res.json([]);
        return;
    }
    const ids = classIds.map((r) => r.class_id);
    // Test IDs for this teacher + subject
    const testQuery = subject_id
        ? "SELECT id FROM tests WHERE teacher_id = $1 AND subject_id = $2"
        : "SELECT id FROM tests WHERE teacher_id = $1";
    const { rows: testRows } = await pool_1.pool.query(testQuery, subject_id ? [teacherId, subject_id] : [teacherId]);
    const testIds = testRows.map((t) => t.id);
    const { rows: students } = await pool_1.pool.query(`SELECT u.id, u.first_name, u.last_name, u.status,
            sp.class_id, sp.approved_at,
            ap.contrast_mode, ap.color_blind_mode
     FROM users u
     JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN accessibility_profiles ap ON ap.user_id = u.id
     WHERE sp.class_id = ANY($1) AND sp.approved_at IS NOT NULL
     ORDER BY u.last_name, u.first_name`, [ids]);
    if (testIds.length === 0) {
        res.json(students.map((s) => ({ ...s, k_adapt: 0, attempt_count: 0 })));
        return;
    }
    // K-adapt per student
    const { rows: scores } = await pool_1.pool.query(`SELECT student_id, ROUND(AVG(score)::numeric, 1) AS k_adapt, COUNT(*) AS attempt_count
     FROM test_attempts
     WHERE student_id = ANY($1) AND test_id = ANY($2) AND finished_at IS NOT NULL AND score IS NOT NULL
     GROUP BY student_id`, [students.map((s) => s.id), testIds]);
    const scoreMap = {};
    for (const row of scores) {
        scoreMap[row.student_id] = { k_adapt: Number(row.k_adapt), attempt_count: Number(row.attempt_count) };
    }
    res.json(students.map((s) => ({
        ...s,
        k_adapt: scoreMap[s.id]?.k_adapt ?? 0,
        attempt_count: scoreMap[s.id]?.attempt_count ?? 0,
    })));
});
// GET /teachers/:id/subjects
router.get("/:id/subjects", async (req, res) => {
    const { rows } = await pool_1.pool.query(`SELECT DISTINCT sub.id, sub.name
     FROM teacher_assignments ta
     JOIN subjects sub ON sub.id = ta.subject_id
     WHERE ta.teacher_id = $1`, [req.params.id]);
    res.json(rows);
});
exports.default = router;
