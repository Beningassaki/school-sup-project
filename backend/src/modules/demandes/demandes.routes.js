const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const pool = require('../../config/db');
const { authenticate } = require('../../middlewares/auth');

// ============================================================
// POST /api/demandes
// Créer une nouvelle demande
// ============================================================
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { type, objet, informations, pieces } = req.body;

    if (!type) {
      return res.status(400).json({
        succes: false,
        message: 'Le type de demande est obligatoire',
      });
    }

    const userId = req.user.id;

    const result = await pool.query(
      `
      INSERT INTO demandes (
        user_id,
        type,
        objet,
        informations,
        pieces,
        statut
      )
      VALUES ($1, $2, $3, $4, $5, 'BROUILLON')
      RETURNING *
      `,
      [
        userId,
        type,
        objet || null,
        informations || {},
        pieces || [],
      ],
    );

    res.status(201).json({
      succes: true,
      message: 'Demande créée avec succès',
      data: result.rows[0],
    });
  }),
);

// ============================================================
// GET /api/demandes
// Récupérer les demandes de l'utilisateur connecté
// ============================================================
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
      SELECT *
      FROM demandes
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id],
    );

    res.json({
      succes: true,
      data: result.rows,
    });
  }),
);

// ============================================================
// GET /api/demandes/:id
// Récupérer une demande précise
// ============================================================
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
      SELECT *
      FROM demandes
      WHERE id = $1
        AND user_id = $2
      `,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        succes: false,
        message: 'Demande introuvable',
      });
    }

    res.json({
      succes: true,
      data: result.rows[0],
    });
  }),
);

module.exports = router;