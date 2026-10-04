// ROUTES de l'historique (Alty). Les routes "mes-demandes" sont dans suivi.routes.js (Beni).
const router = require('express').Router();
const controller = require('./historique.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

router.get('/:demandeId/historique', authenticate, authorize('etudiant'), controller.obtenir);

module.exports = router;