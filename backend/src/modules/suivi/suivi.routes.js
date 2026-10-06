const router = require('express').Router();
const controller = require('./suivi.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

router.get('/mes-demandes', authenticate, authorize('etudiant'), controller.mesDemandes);

module.exports = router;
