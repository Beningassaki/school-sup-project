const { z } = require('zod');

const paiementSchema = z.object({
  demandeId: z.number().int().positive(),
  operateur: z.enum(['MTN', 'Airtel']),
  telephone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,17}$/),
  simulation: z.enum(['confirme', 'echoue']),
});

module.exports = { paiementSchema };