// =====================================================
// US7 + US8 : Consulter un dossier, puis le valider ou le refuser avec motif
// RESPONSABLE : Ulrich ISSOKO
// ROUTE : /agent/dossiers/:id
// API : GET /api/agent/dossiers/:id
//       POST /api/agent/dossiers/:id/valider
//       POST /api/agent/dossiers/:id/refuser   (motif obligatoire)
// RÈGLE : un dossier validé ou refusé n'est plus modifiable
// =====================================================
import { useParams } from 'react-router-dom';
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function DossierDetailPage() {
  const { id } = useParams();

  // ⬇️ ZONE DE TRAVAIL D'ULRICH
  return (
    <PagePlaceholder
      titre={`Dossier n° ${id}`}
      us="US7 · US8"
      responsable="Ulrich ISSOKO"
      routeApi="GET /api/agent/dossiers/:id"
      taches={[
        "Onglets : informations de l'étudiant, documents, paiement, historique",
        "Voir et télécharger chaque pièce, avec son statut",
        "Boutons « Valider le dossier » et « Refuser » (fenêtre avec motif obligatoire)",
        "Bouton « Demander un complément » (US14, voir ComplementsPage)",
      ]}
    />
  );
}