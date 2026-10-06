// =====================================================
// FONCTIONS D'AFFICHAGE PARTAGÉES : propriétaire ALTY
// Utilisation : import { formaterDate, formaterMontant } from '../../utils/format.js';
// =====================================================

// Libellés lisibles des types de démarche
export const LIBELLES_TYPE = {
  pre_inscription: 'Pré-inscription',
  legalisation: "Légalisation d'attestation",
};

// 4 octobre 2026
export function formaterDate(valeur) {
  if (!valeur) return '';
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// 4 octobre 2026 à 09:30
export function formaterDateHeure(valeur) {
  if (!valeur) return '';
  return new Date(valeur).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 5 000 FCFA
export function formaterMontant(montant) {
  return `${Number(montant).toLocaleString('fr-FR')} FCFA`;
}