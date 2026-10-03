const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// Vérifie le token JWT envoyé dans l'en-tête : Authorization: Bearer <token>
// Le token doit contenir { id, role } (à signer dans le module auth, US1)
function authenticate(req, _res, next) {
  const [type, token] = (req.headers.authorization || '').split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Authentification requise', 401));
  }

  try {
    req.user = jwt.verify(token, env.jwt.secret); // { id, role }
    next();
  } catch {
    next(new AppError('Token invalide ou expiré', 401));
  }
}

// Limite une route à certains rôles : authorize('agent', 'admin')
const authorize =
  (...rolesAutorises) =>
  (req, _res, next) => {
    if (!rolesAutorises.includes(req.user.role)) {
      return next(new AppError('Accès interdit pour ce rôle', 403));
    }
    next();
  };

module.exports = { authenticate, authorize };