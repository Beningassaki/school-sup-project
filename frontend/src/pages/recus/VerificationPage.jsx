// =====================================================
// US13 : Vérifier un document via son code (Could : en dernier)
// RESPONSABLE : Alty DELLOT-MVOUMINA
// ROUTE : /verification   (page PUBLIQUE, pas de connexion)
// API : GET /api/recus/verification/:code
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function VerificationPage() {
  // ⬇️ ZONE DE TRAVAIL D'ALTY
  return (
    <PagePlaceholder
      titre="Vérifier un document"
      us="US13"
      responsable="Alty DELLOT-MVOUMINA"
      routeApi="GET /api/recus/verification/:code"
      taches={[
        'Champ pour saisir le code de vérification',
        'Afficher « document authentique » avec les infos du reçu, ou « code inconnu »',
      ]}
    />
  );
}