// UTILITAIRE : vérifie qu'un identifiant pris dans l'URL est un entier positif
// Exemple : const id = lireId(req.params.demandeId);
const AppError = require('./AppError');

function lireId(valeur) {
  const nombre = Number(valeur);
  if (!Number.isInteger(nombre) || nombre <= 0) {
    throw new AppError('Identifiant invalide', 400);
  }
  return nombre;
}

module.exports = lireId;