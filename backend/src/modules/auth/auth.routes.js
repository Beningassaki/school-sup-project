const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { connexionSchema, inscriptionSchema } = require('./auth.validation');

router.post('/register', validate(inscriptionSchema), controller.inscrire);
router.post('/login', validate(connexionSchema), controller.connexion);

module.exports = router;
