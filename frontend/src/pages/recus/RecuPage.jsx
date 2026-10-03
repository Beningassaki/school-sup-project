// =====================================================
// US9 : Recevoir un reçu avec code de vérification
// RESPONSABLE : Alty DELLOT-MVOUMINA
// ROUTE : /mes-demandes/:id/recu
// API : GET /api/recus/:demandeId   (backend : module recus, Alty)
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function RecuPage() {
  // ⬇️ ZONE DE TRAVAIL D'ALTY : remplace PagePlaceholder par le vrai reçu
  return (
    <PagePlaceholder
      titre="Reçu numérique"
      us="US9"
      responsable="Alty DELLOT-MVOUMINA"
      routeApi="GET /api/recus/:demandeId"
      taches={[
        "Afficher le reçu d'un dossier validé (référence, étudiant, montant, date)",
        'Afficher le code de vérification unique',
        'Bouton pour imprimer ou télécharger le reçu',
        "Message clair si le dossier n'est pas encore validé",
      ]}
    />
  );
}