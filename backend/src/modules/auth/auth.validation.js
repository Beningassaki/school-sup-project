const { z } = require('zod');

const connexionSchema = z.object({
  email: z.string().trim().email(),
  motDePasse: z.string().min(1),
});

const inscriptionSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  prenom: z.string().trim().min(2).max(100),
  dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf())
      && parsed.toISOString().slice(0, 10) === date
      && date >= '1940-01-01'
      && date < new Date().toISOString().slice(0, 10);
  }, 'Date de naissance invalide.'),
  nationalite: z.enum(['Congolaise', 'Autre']),
  email: z.string().trim().email().max(150),
  telephone: z.string().trim().regex(/^\+?\d[\d\s.-]{6,18}\d$/),
  motDePasse: z.string().min(8).max(128)
    .regex(/[A-Za-z]/, 'Le mot de passe doit contenir une lettre.')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre.'),
});

module.exports = { connexionSchema, inscriptionSchema };
