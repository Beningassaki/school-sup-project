// ROUTES de l'espace agent : TOUTES réservées au rôle "agent"
const router = require('express').Router();
const controller = require('./agent.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { statutDocumentSchema, refuserSchema, complementSchema } = require('./agent.validation');

router.use(authenticate, authorize('agent'));

// US7 : consulter
router.get('/statistiques', controller.statistiques);
router.get('/dossiers', controller.lister);
router.get('/dossiers/:id', controller.detail);
router.get('/documents/:documentId/fichier', controller.fichier);
router.patch('/documents/:documentId', validate(statutDocumentSchema), controller.statutDocument);

// US8 : valider ou refuser
router.post('/dossiers/:id/valider', controller.valider);
router.post('/dossiers/:id/refuser', validate(refuserSchema), controller.refuser);

// US14 : demander un complément
router.post('/dossiers/:id/complement', validate(complementSchema), controller.complement);
router.get('/complements', controller.complements);

module.exports = router;
