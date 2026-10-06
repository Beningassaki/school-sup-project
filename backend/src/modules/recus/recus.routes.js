// ROUTES du module recus
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const controller = require('./recus.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

// La vérification est publique : on limite les essais (20 par 15 minutes et par IP)
// pour empêcher quelqu'un de tester des codes au hasard
const limiteVerification = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { succes: false, message: 'Trop de tentatives, réessayez dans quelques minutes' },
});

// ⚠️ ORDRE IMPORTANT : la route fixe "/verification/:code" AVANT "/:demandeId"
router.get('/verification/:code', limiteVerification, controller.verifier); // public (US13)
router.get('/:demandeId', authenticate, authorize('etudiant'), controller.obtenir); // étudiant (US9)

module.exports = router;