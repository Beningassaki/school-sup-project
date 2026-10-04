// =====================================================
// US14 : Demander un complément de pièce (Should)
// RESPONSABLE : Ulrich ISSOKO
// ROUTE : /agent/complements   (liste des dossiers en attente de complément)
// API : POST /api/agent/dossiers/:id/complement
//       GET  /api/agent/complements
// RÈGLE : le motif doit être visible par l'étudiant
// MAQUETTE : fenêtre « Demander un complément » (document concerné, motif, message)
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function ComplementsPage() {
  // ⬇️ ZONE DE TRAVAIL D'ULRICH
  return (
    <PagePlaceholder
      titre="En attente de complément"
      us="US14"
      responsable="Ulrich ISSOKO"
      routeApi="GET /api/agent/complements"
      taches={[
        "Tableau : référence, étudiant, pièce demandée, motif, date, statut",
        "Fenêtre modale « Demander un complément » (utilisée aussi depuis DossierDetailPage)",
      ]}
    />
  );
}