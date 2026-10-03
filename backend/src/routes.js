const router = require('express').Router();
const pool = require('./config/db');
const asyncHandler = require('./utils/asyncHandler');

// Test : GET /api/health vérifie le serveur ET la base
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query('SELECT NOW() AS heure');
    res.json({ succes: true, data: { serveur: 'OK', base: 'OK', heure: rows[0].heure } });
  }),
);

// === REGISTRE DES MODULES ===
// Chaque dev ajoute UNE ligne pour son module, dans son premier commit.
router.use('/formations', require('./modules/formations/formations.routes')); // US2
// router.use('/auth', require('./modules/auth/auth.routes'));                // US1
// router.use('/demandes', require('./modules/demandes/demandes.routes'));    // US3, US4

module.exports = router;