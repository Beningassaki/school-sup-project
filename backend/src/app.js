const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet()); // en-têtes de sécurité
app.use(cors({ origin: env.corsOrigin })); // autorise le frontend
app.use(express.json({ limit: '1mb' })); // lit le JSON (req.body)
if (env.nodeEnv === 'development') app.use(morgan('dev')); // journal des requêtes

// Limite à 300 requêtes / 15 min par IP (protection basique)
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api', routes); // toutes les routes de l'API commencent par /api

app.use(notFound); // 404
app.use(errorHandler); // gestion centralisée des erreurs

module.exports = app;