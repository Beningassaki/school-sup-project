// CONTROLLER : reçoit la requête, appelle le service, renvoie la réponse
const service = require('./recus.service');
const asyncHandler = require('../../utils/asyncHandler');
const lireId = require('../../utils/lireId');

// GET /api/recus/:demandeId  (étudiant connecté)
const obtenir = asyncHandler(async (req, res) => {
  const data = await service.obtenirPourEtudiant(lireId(req.params.demandeId), req.user.id);
  res.json({ succes: true, data });
});

// GET /api/recus/verification/:code  (public)
const verifier = asyncHandler(async (req, res) => {
  const data = await service.verifierCode(req.params.code);
  res.json({ succes: true, data });
});

module.exports = { obtenir, verifier };