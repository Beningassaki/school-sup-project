// Ce script lit les fichiers SQL du dossier "migrations" (001_init.sql, 002_...)
// et les applique dans l'ordre. Chaque fichier n'est appliqué qu'UNE seule fois.
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrer() {
  // 1. Table qui mémorise les migrations déjà appliquées
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    nom VARCHAR(255) PRIMARY KEY,
    applique_le TIMESTAMP NOT NULL DEFAULT NOW()
  )`);

  // 2. Liste des fichiers .sql, triés par nom (001, 002, 003...)
  const dossier = path.join(__dirname, 'migrations');
  const fichiers = fs
    .readdirSync(dossier)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // 3. Migrations déjà faites sur CETTE base
  const { rows } = await pool.query('SELECT nom FROM schema_migrations');
  const dejaFaites = new Set(rows.map((r) => r.nom));

  let nombreAppliquees = 0;

  for (const fichier of fichiers) {
    if (dejaFaites.has(fichier)) continue; // déjà appliquée : on saute

    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // tout ou rien
      await client.query(fs.readFileSync(path.join(dossier, fichier), 'utf8'));
      await client.query('INSERT INTO schema_migrations (nom) VALUES ($1)', [fichier]);
      await client.query('COMMIT');
      console.log(`Migration appliquée : ${fichier}`);
      nombreAppliquees++;
    } catch (erreur) {
      await client.query('ROLLBACK'); // on annule tout en cas d'erreur
      console.error(`Échec de ${fichier} : ${erreur.message}`);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }

  if (nombreAppliquees === 0 && process.exitCode !== 1) {
    console.log('Base déjà à jour : aucune nouvelle migration.');
  }

  await pool.end(); // ferme la connexion pour que le script se termine
}

migrer().catch((erreur) => {
  console.error('Erreur de migration :', erreur.message);
  process.exit(1);
});