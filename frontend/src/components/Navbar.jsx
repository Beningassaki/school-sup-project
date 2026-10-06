// MENU : les liens changent selon le rôle de l'utilisateur
// Propriétaire : ALTY
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

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

      </nav>
    </header>
  );
}
