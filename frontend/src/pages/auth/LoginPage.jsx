// =====================================================
// US1 : Se connecter
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /connexion
// API : POST /api/auth/login   (backend : module auth, Todd)
// APRÈS CONNEXION : appeler login(token, user) de useAuth() (voir AuthContext)
// ⚠️ Quand cette US est finie : supprimer l'outil de test de rôle dans Navbar.jsx
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function LoginPage() {
  // ⬇️ ZONE DE TRAVAIL DE TODD
  return (
    <PagePlaceholder
      titre="Connexion"
      us="US1"
      responsable="Todd Gusman Hashall OKANA"
      routeApi="POST /api/auth/login"
      taches={[
        "Formulaire email + mot de passe",
        "Appel à l'API, puis login(token, user) pour enregistrer la session",
        "Redirection selon le rôle (étudiant, agent, admin)",
        "Afficher les erreurs (identifiants incorrects) avec la classe .message-erreur",
      ]}
    />
  );
}