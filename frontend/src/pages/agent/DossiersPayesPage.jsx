// =====================================================
// US7 : Lister et vérifier les dossiers payés
// RESPONSABLE : Ulrich ISSOKO
// ROUTE : /agent/dossiers
// API : GET /api/agent/dossiers
// INTÉGRER : <FiltresDossiers /> écrit par Todd (US11), voir son en-tête
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';
// import FiltresDossiers from './FiltresDossiers.jsx'; // à activer quand Todd a terminé

export default function DossiersPayesPage() {
  // ⬇️ ZONE DE TRAVAIL D'ULRICH
  return (
    <PagePlaceholder
      titre="Dossiers payés"
      us="US7"
      responsable="Ulrich ISSOKO"
      routeApi="GET /api/agent/dossiers"
      taches={[
        "Tableau : référence, étudiant, formation, paiement, documents, action Consulter",
        "Pagination",
        "Intégrer les filtres de Todd (US11)",
      ]}
    />
  );
}