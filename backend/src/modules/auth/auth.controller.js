const service = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const connexion = asyncHandler(async (req, res) => {
  const data = await service.connexion(req.body);
  res.json({ succes: true, data });
});

module.exports = { connexion };
