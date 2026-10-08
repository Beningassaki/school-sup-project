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
router.use('/auth', require('./modules/auth/auth.routes')); // US1
 router.use('/demandes', require('./modules/demandes/demandes.routes.js'));    // US3, US4
router.use('/paiements', require('./modules/paiements/paiements.routes')); // US5 · Dubien
router.use('/recus', require('./modules/recus/recus.routes')); // US9, US13 · Alty
router.use('/suivi', require('./modules/suivi/suivi.routes')); // US6
router.use('/suivi', require('./modules/suivi/historique.routes')); // US16 · Alty
router.use('/agent', require('./modules/agent/agent.routes')); // US7, US8, US14

module.exports = router;
