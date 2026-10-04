// =====================================================
// US4 : Créer une demande de pré-inscription
// RESPONSABLE : Dreche NDONGALA
// ROUTE : /demandes/nouvelle/pre-inscription
// API : POST /api/demandes   (type: 'pre_inscription')
// MAQUETTE FIGMA : parcours en 5 étapes (Choix, Profil, Documents, Paiement, Confirmation)
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function PreInscriptionPage() {
  // ⬇️ ZONE DE TRAVAIL DE DRECHE
  return (
    <PagePlaceholder
      titre="Pré-inscription"
      us="US4"
      responsable="Dreche NDONGALA"
      routeApi="POST /api/demandes"
      taches={[
        "Étape 1 : choisir la filière (liste venant de /api/formations)",
        "Étape 2 : informations personnelles",
        "Étape 3 : joindre les pièces (PDF, JPG ou PNG, 5 Mo max)",
        "Enregistrer en brouillon, puis continuer vers le paiement (US5 · Dubien)",
        "Barre de progression des étapes",
      ]}
    />
  );
}