// Enveloppe une fonction async : si elle plante, l'erreur part
// automatiquement vers le gestionnaire d'erreurs (plus de try/catch partout)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;