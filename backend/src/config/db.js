const { Pool } = require('pg');
const env = require('./env');

// Un Pool = plusieurs connexions réutilisables vers PostgreSQL
const pool = new Pool(env.db);

// Exemple d'utilisation dans un service :
// const pool = require('../../config/db');
// const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
module.exports = pool;