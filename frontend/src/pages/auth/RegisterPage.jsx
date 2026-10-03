// =====================================================
// US1 : Créer un compte étudiant
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /inscription
// API : POST /api/auth/register
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function RegisterPage() {
  // ⬇️ ZONE DE TRAVAIL DE TODD
  return (
    <PagePlaceholder
      titre="Créer un compte"
      us="US1"
      responsable="Todd Gusman Hashall OKANA"
      routeApi="POST /api/auth/register"
      taches={[
        "Formulaire : nom, prénom, email, téléphone, mot de passe",
        "Validation des champs avant envoi",
        "Après création : rediriger vers /connexion",
      ]}
    />
  );
}