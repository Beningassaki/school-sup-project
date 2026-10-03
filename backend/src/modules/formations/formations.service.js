// SERVICE = la logique métier et les requêtes SQL du module
const pool = require('../../config/db');

// Liste des formations actives (US2 : visible par tout visiteur)
async function lister() {
  const { rows } = await pool.query(
    `SELECT id, faculte, filiere, niveau, conditions, frais
     FROM formations
     WHERE actif = TRUE
     ORDER BY faculte, filiere`,
  );
  return rows;
}

// Une formation par son id (renvoie undefined si elle n'existe pas)
async function trouverParId(id) {
  const { rows } = await pool.query(
    `SELECT id, faculte, filiere, niveau, conditions, frais
     FROM formations
     WHERE id = $1 AND actif = TRUE`,
    [id], // $1 est remplacé par id : protège des injections SQL
  );
  return rows[0];
}

module.exports = { lister, trouverParId };