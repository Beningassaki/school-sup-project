// MENU : les liens changent selon le rôle de l'utilisateur
// Propriétaire : ALTY
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  // ⚠️ OUTIL DE TEST (visible seulement en développement).
  // Simule un rôle pour tester sa page sans attendre la connexion (US1).
  // À SUPPRIMER quand Todd a terminé l'US1.
  const simulerRole = (role) => {
    if (role === 'visiteur') logout();
    else login('token-test', { id: 1, nom: 'Utilisateur Test', role });
  };

  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <Link to="/" className="navbar__logo">School-Sup</Link>

        <NavLink to="/formations">Formations</NavLink>
        <NavLink to="/verification">Vérifier un document</NavLink>

        {/* Liens étudiant */}
        {user?.role === 'etudiant' && <NavLink to="/mes-demandes">Mes demandes</NavLink>}

        {/* Liens agent */}
        {user?.role === 'agent' && <NavLink to="/agent">Espace agent</NavLink>}

        {/* Lien admin */}
        {user?.role === 'admin' && <NavLink to="/admin">Administration</NavLink>}

        {/* Connexion / déconnexion */}
        {!user && <NavLink to="/connexion">Connexion</NavLink>}
        {user && <button className="btn btn--secondaire" onClick={logout}>Déconnexion</button>}

        {/* Outil de test de rôle (développement uniquement) */}
        {import.meta.env.DEV && (
          <select value={user?.role ?? 'visiteur'} onChange={(e) => simulerRole(e.target.value)}>
            <option value="visiteur">Test : visiteur</option>
            <option value="etudiant">Test : étudiant</option>
            <option value="agent">Test : agent</option>
            <option value="admin">Test : admin</option>
          </select>
        )}
      </nav>
    </header>
  );
}