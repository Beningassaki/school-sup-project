const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { connexionSchema } = require('./auth.validation');

router.post('/login', validate(connexionSchema), controller.connexion);

module.exports = router;
