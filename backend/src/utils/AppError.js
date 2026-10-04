// Une erreur avec un code HTTP. Exemple :
// throw new AppError('Formation introuvable', 404);
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;