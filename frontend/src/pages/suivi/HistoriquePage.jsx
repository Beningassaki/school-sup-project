// =====================================================
// US16 : Accéder à l'historique du dossier (Should)
// RESPONSABLE : Alty DELLOT-MVOUMINA
// ROUTE : /mes-demandes/:id/historique
// API : GET /api/suivi/:demandeId/historique
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function HistoriquePage() {
  // ⬇️ ZONE DE TRAVAIL D'ALTY
  return (
    <PagePlaceholder
      titre="Historique du dossier"
      us="US16"
      responsable="Alty DELLOT-MVOUMINA"
      routeApi="GET /api/suivi/:demandeId/historique"
      taches={[
        'Liste chronologique des changements de statut (date, heure, nouveau statut)',
        'Afficher le motif quand il y en a un (refus, complément)',
        'Utiliser le composant StatusBadge pour chaque statut',
      ]}
    />
  );
}