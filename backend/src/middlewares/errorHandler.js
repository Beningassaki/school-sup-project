const AppError = require('../utils/AppError');

// Appelé quand aucune route ne correspond à l'URL demandée
function notFound(req, _res, next) {
  next(new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404));
}

// Point d'arrivée de TOUTES les erreurs : format de réponse unique
// (Express reconnaît ce gestionnaire car il a 4 paramètres)
function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;

  // Les erreurs inattendues sont affichées dans la console du serveur
  if (status === 500) console.error(err);

  res.status(status).json({
    succes: false,
    message: status === 500 ? 'Erreur interne du serveur' : err.message,
    details: err.details, // liste d'erreurs de validation (si présente)
  });
}

module.exports = { notFound, errorHandler };