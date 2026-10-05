const router = require('express').Router();
const controller = require('./paiements.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { paiementSchema } = require('./paiements.validation');

router.get('/demandes/:demandeId', authenticate, authorize('etudiant'), controller.contexte);
router.post('/', authenticate, authorize('etudiant'), validate(paiementSchema), controller.payer);

module.exports = router;