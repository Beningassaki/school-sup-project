// dotenv lit le fichier .env et met ses valeurs dans process.env
require('dotenv').config();

// Variables sans lesquelles l'application ne doit pas démarrer
const obligatoires = ['DB_NAME', 'DB_USER', 'JWT_SECRET'];
const manquantes = obligatoires.filter((cle) => !process.env[cle]);

if (manquantes.length > 0) {
  console.error(`Variables manquantes dans .env : ${manquantes.join(', ')}`);
  process.exit(1);
}

// Toute l'application lit sa configuration ICI (jamais process.env directement)
module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};