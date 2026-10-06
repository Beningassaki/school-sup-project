const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

async function connexion({ email, motDePasse }) {
  const { rows } = await pool.query(
    `SELECT id, nom, prenom, email, role, password_hash
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email],
  );

  const utilisateur = rows[0];
  const motDePasseValide = utilisateur
    ? await bcrypt.compare(motDePasse, utilisateur.password_hash)
    : false;

  if (!motDePasseValide) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const user = {
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    role: utilisateur.role,
  };
  const token = jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  return { token, user };
}

module.exports = { connexion };
