// =====================================================
// US3 : Créer une demande de légalisation
// RESPONSABLE : Beni NGASSAKI
// ROUTE : /demandes/nouvelle/legalisation
// API : POST /api/demandes   (type: 'legalisation')
// NOTE : Beni construit le module backend "demandes" (base commune avec Dreche)
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function LegalisationPage() {
  // ⬇️ ZONE DE TRAVAIL DE BENI
  return (
    <PagePlaceholder
      titre="Demande de légalisation"
      us="US3"
      responsable="Beni NGASSAKI"
      routeApi="POST /api/demandes"
      taches={[
        "Formulaire : type d'attestation et informations utiles",
        "Joindre les pièces justificatives (PDF, JPG ou PNG, 5 Mo max)",
        "Enregistrer en brouillon",
        "Envoyer la demande, puis aller au paiement (US5 · Dubien)",
      ]}
    />
  );
}