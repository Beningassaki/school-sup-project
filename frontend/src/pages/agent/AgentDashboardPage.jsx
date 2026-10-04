// =====================================================
// US7 : Tableau de bord de l'agent
// RESPONSABLE : Ulrich ISSOKO
// ROUTE : /agent
// API : GET /api/agent/statistiques   (backend : module agent, Ulrich)
// MAQUETTE : 5 compteurs (à contrôler, en attente de complément, validés, refusés, payés)
//            + tableau « Dossiers payés à contrôler »
// 💡 Ulrich peut créer un menu latéral (AgentLayout) comme sur la maquette
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function AgentDashboardPage() {
  // ⬇️ ZONE DE TRAVAIL D'ULRICH
  return (
    <PagePlaceholder
      titre="Tableau de bord agent"
      us="US7"
      responsable="Ulrich ISSOKO"
      routeApi="GET /api/agent/statistiques"
      taches={[
        "Cartes de compteurs par statut",
        "Tableau des derniers dossiers payés avec bouton « Consulter »",
        "Menu latéral : Tableau de bord, Dossiers payés, En attente de complément, Validés, Refusés",
      ]}
    />
  );
}