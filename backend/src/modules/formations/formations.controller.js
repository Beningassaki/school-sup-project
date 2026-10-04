// CONTROLLER = reçoit la requête, appelle le service, renvoie la réponse
const service = require('./formations.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

// GET /api/formations : toutes les formations
const lister = asyncHandler(async (_req, res) => {
  const data = await service.lister();
  res.json({ succes: true, data });
});

// GET /api/formations/:id : une seule formation
const detail = asyncHandler(async (req, res) => {
  const formation = await service.trouverParId(Number(req.params.id));

  // Si elle n'existe pas, on renvoie une erreur 404
  if (!formation) throw new AppError('Formation introuvable', 404);

  res.json({ succes: true, data: formation });
});

module.exports = { lister, detail };