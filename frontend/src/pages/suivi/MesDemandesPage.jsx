// =====================================================
// US6 : Suivre le statut de mes demandes
// RESPONSABLE : Beni NGASSAKI
// ROUTE : /mes-demandes
// API : GET /api/suivi/mes-demandes   (backend : module suivi, Beni)
// UTILISER : le composant StatusBadge pour afficher chaque statut
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function MesDemandesPage() {
  // ⬇️ ZONE DE TRAVAIL DE BENI
  return (
    <PagePlaceholder
      titre="Mes demandes"
      us="US6"
      responsable="Beni NGASSAKI"
      routeApi="GET /api/suivi/mes-demandes"
      taches={[
        "Tableau : référence, type, date, statut (StatusBadge)",
        "Afficher le motif en cas de refus ou de complément demandé",
        "Boutons selon le statut : Payer (vers /mes-demandes/:id/paiement), Voir le reçu (US9), Historique (US16)",
      ]}
    />
  );
}