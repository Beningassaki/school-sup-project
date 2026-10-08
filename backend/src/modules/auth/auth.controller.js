const service = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const inscrire = asyncHandler(async (req, res) => {
  const data = await service.inscrire(req.body);
  res.status(201).json({ succes: true, data });
});

const connexion = asyncHandler(async (req, res) => {
  const data = await service.connexion(req.body);
  res.json({ succes: true, data });
});

module.exports = { inscrire, connexion };
