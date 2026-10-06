const service = require('./suivi.service');
const asyncHandler = require('../../utils/asyncHandler');

const mesDemandes = asyncHandler(async (req, res) => {
  const data = await service.mesDemandes(req.user.id);
  res.json({ succes: true, data });
});

module.exports = { mesDemandes };
