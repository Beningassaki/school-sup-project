// =====================================================
// US5 : Payer par Mobile Money (mode DÉMONSTRATION, pas de vrai paiement)
// RESPONSABLE : Dubien NGASSAI NDONGO
// ROUTE : /mes-demandes/:id/paiement
// API : POST /api/paiements   (backend : module paiements, Dubien)
// RÈGLE : un paiement échoué ne change PAS le statut du dossier
// =====================================================
import { useParams } from 'react-router-dom';
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function PaiementPage() {
  const { id } = useParams(); // numéro de la demande, pris dans l'URL

  // ⬇️ ZONE DE TRAVAIL DE DUBIEN
  return (
    <PagePlaceholder
      titre={`Paiement de la demande n° ${id}`}
      us="US5"
      responsable="Dubien NGASSAI NDONGO"
      routeApi="POST /api/paiements"
      taches={[
        "Récapitulatif : référence, formation, montant",
        "Choisir l'opérateur (MTN, Airtel) et saisir le numéro",
        "Simuler la confirmation du paiement",
        "Écran de succès ou d'échec (avec bouton Réessayer)",
        "Après succès : rediriger vers /mes-demandes",
      ]}
    />
  );
}