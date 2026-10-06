const { z } = require('zod');

const connexionSchema = z.object({
  email: z.string().trim().email(),
  motDePasse: z.string().min(1),
});

module.exports = { connexionSchema };
