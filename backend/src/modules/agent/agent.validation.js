// VALIDATION : règles sur les données reçues (messages en français)
const { z } = require('zod');

// L'agent marque une pièce comme valide ou illisible
const statutDocumentSchema = z.object({
  statut: z.enum(['valide', 'illisible'], { message: 'Statut de pièce invalide' }),
});

// Un motif est OBLIGATOIRE pour un refus et une demande de complément
const motifSchema = z
  .string({ message: 'Le motif est obligatoire' })
  .trim()
  .min(5, 'Le motif doit contenir au moins 5 caractères')
  .max(500, 'Le motif ne doit pas dépasser 500 caractères');

const refuserSchema = z.object({ motif: motifSchema });

const complementSchema = z.object({
  type_piece: z.string({ message: 'Choisissez la pièce concernée' }).trim().min(1, 'Choisissez la pièce concernée'),
  motif: motifSchema,
});

module.exports = { statutDocumentSchema, refuserSchema, complementSchema };
