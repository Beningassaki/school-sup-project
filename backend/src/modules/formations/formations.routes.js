// ROUTES = la liste des URL du module
const router = require('express').Router();
const controller = require('./formations.controller');

// Routes publiques : un visiteur peut consulter le catalogue
router.get('/', controller.lister); // GET /api/formations
router.get('/:id', controller.detail); // GET /api/formations/1

// Exemple d'une route protégée (à utiliser dans les autres modules) :
// const { authenticate, authorize } = require('../../middlewares/auth');
// router.post('/', authenticate, authorize('admin'), controller.creer);

module.exports = router;