// CONTROLLER : historique d'un dossier
const service = require('./historique.service');
const asyncHandler = require('../../utils/asyncHandler');
const lireId = require('../../utils/lireId');

// GET /api/suivi/:demandeId/historique
const obtenir = asyncHandler(async (req, res) => {
  const data = await service.obtenir(lireId(req.params.demandeId), req.user.id);
  res.json({ succes: true, data });
});

module.exports = { obtenir };