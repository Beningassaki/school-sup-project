const statuts = {
  brouillon: { libelle: 'Brouillon', classe: 'brouillon' },
  en_attente_paiement: { libelle: 'En attente de paiement', classe: 'en_attente_paiement' },
  paye: { libelle: 'En traitement', classe: 'paye' },
  en_attente_complement: { libelle: 'Complément demandé', classe: 'en_attente_complement' },
  valide: { libelle: 'Acceptée', classe: 'valide' },
  refuse: { libelle: 'Refusée', classe: 'refuse' },
  en_traitement: { libelle: 'En traitement', classe: 'paye' },
  acceptee: { libelle: 'Acceptée', classe: 'valide' },
  refusee: { libelle: 'Refusée', classe: 'refuse' },
};

export default function StatusBadge({ statut }) {
  const valeur = String(statut || '').toLowerCase();
  const configuration = statuts[valeur] || { libelle: valeur || 'Inconnu', classe: 'brouillon' };

  return <span className={`badge badge--${configuration.classe}`}>{configuration.libelle}</span>;
}
