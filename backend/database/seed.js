// Ce script charge les données de test (seed.sql) dans la base.
// Il peut être relancé : seed.sql vide les tables avant de les remplir.
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function charger() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(sql);
    console.log('Données de test chargées.');
  } catch (erreur) {
    console.error(`Échec du chargement : ${erreur.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end(); // ferme la connexion
  }
}

charger();