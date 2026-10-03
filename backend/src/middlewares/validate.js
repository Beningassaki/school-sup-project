const AppError = require('../utils/AppError');

// Vérifie req.body avec un schéma zod.
// Utilisation dans une route : router.post('/', validate(schema), controller.creer)
const validate = (schema) => (req, _res, next) => {
  const resultat = schema.safeParse(req.body);

  if (!resultat.success) {
    const erreur = new AppError('Données invalides', 400);
    erreur.details = resultat.error.issues.map((i) => ({
      champ: i.path.join('.'),
      message: i.message,
    }));
    return next(erreur);
  }

  req.body = resultat.data; // données nettoyées et validées
  next();
};

module.exports = validate;