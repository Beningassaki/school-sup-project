const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

async function inscrire({ nom, prenom, dateNaissance, nationalite, email, telephone, motDePasse }) {
  const emailNormalise = email.trim().toLowerCase();
  const existant = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = $1',
    [emailNormalise],
  );
  if (existant.rows[0]) throw new AppError('Un compte existe déjà avec cet email.', 409);

  const passwordHash = await bcrypt.hash(motDePasse, 12);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (nom, prenom, email, telephone, password_hash, date_naissance, nationalite)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nom, prenom, email, telephone, date_naissance, nationalite, role, created_at`,
      [nom, prenom, emailNormalise, telephone, passwordHash, dateNaissance, nationalite],
    );
    return rows[0];
  } catch (erreur) {
    if (erreur.code === '23505') {
      throw new AppError('Un compte existe déjà avec cet email.', 409);
    }
    throw erreur;
  }
}

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

module.exports = { inscrire, connexion };
