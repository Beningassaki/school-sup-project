const service = require('./paiements.service');
const asyncHandler = require('../../utils/asyncHandler');
const lireId = require('../../utils/lireId');

const contexte = asyncHandler(async (req, res) => {
  const data = await service.obtenirContexte(lireId(req.params.demandeId), req.user.id);
  res.json({ succes: true, data });
});

const payer = asyncHandler(async (req, res) => {
  const data = await service.simulerPaiement(req.body, req.user.id);
  res.status(201).json({ succes: true, data });
});

module.exports = { contexte, payer };