"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", async (_req, res) => {
    const { rows } = await pool_1.pool.query(`SELECT s.*, u.first_name AS director_first, u.last_name AS director_last
     FROM schools s LEFT JOIN users u ON u.id = s.director_id
     ORDER BY s.name`);
    res.json(rows);
});
router.get("/:id", async (req, res) => {
    const { rows } = await pool_1.pool.query(`SELECT s.*, u.first_name AS director_first, u.last_name AS director_last
     FROM schools s LEFT JOIN users u ON u.id = s.director_id WHERE s.id=$1`, [req.params.id]);
    if (!rows[0]) {
        res.status(404).json({ error: "Topilmadi" });
        return;
    }
    res.json(rows[0]);
});
router.post("/", (0, role_1.requireRole)("super_admin"), async (req, res) => {
    const parsed = zod_1.z.object({
        name: zod_1.z.string().min(1),
        address: zod_1.z.string().nullable().optional(),
        director_id: zod_1.z.string().uuid().nullable().optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message });
        return;
    }
    const { rows } = await pool_1.pool.query("INSERT INTO schools (name, address, director_id) VALUES ($1,$2,$3) RETURNING id", [parsed.data.name, parsed.data.address ?? null, parsed.data.director_id ?? null]);
    res.status(201).json({ id: rows[0].id });
});
router.put("/:id", (0, role_1.requireRole)("super_admin", "director"), async (req, res) => {
    const parsed = zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        address: zod_1.z.string().nullable().optional(),
        director_id: zod_1.z.string().uuid().nullable().optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message });
        return;
    }
    const updates = [];
    const params = [];
    if (parsed.data.name !== undefined) {
        params.push(parsed.data.name);
        updates.push(`name=$${params.length}`);
    }
    if (parsed.data.address !== undefined) {
        params.push(parsed.data.address);
        updates.push(`address=$${params.length}`);
    }
    if (parsed.data.director_id !== undefined) {
        params.push(parsed.data.director_id);
        updates.push(`director_id=$${params.length}`);
    }
    if (!updates.length) {
        res.status(400).json({ error: "Yangilanacak maydon yo'q" });
        return;
    }
    params.push(req.params.id);
    await pool_1.pool.query(`UPDATE schools SET ${updates.join(",")} WHERE id=$${params.length}`, params);
    res.json({ ok: true });
});
router.delete("/:id", (0, role_1.requireRole)("super_admin"), async (req, res) => {
    await pool_1.pool.query("DELETE FROM schools WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
});
exports.default = router;
