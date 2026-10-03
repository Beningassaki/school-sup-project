// =====================================================
// SESSION UTILISATEUR : propriétaire ALTY (Todd branche la vraie connexion, US1)
// Utilisation dans une page :
//   const { user, token, login, logout } = useAuth();
//   user.role vaut 'etudiant', 'agent' ou 'admin' (null si non connecté)
// =====================================================
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const CLE_SESSION = 'schoolsup_session';

// Relit la session au rechargement de la page
function lireSession() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SESSION));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(lireSession); // { token, user } ou null

  // À appeler après une connexion réussie
  const login = (token, user) => {
    const nouvelle = { token, user };
    localStorage.setItem(CLE_SESSION, JSON.stringify(nouvelle));
    setSession(nouvelle);
  };

  const logout = () => {
    localStorage.removeItem(CLE_SESSION);
    setSession(null);
  };

  const valeur = { user: session?.user ?? null, token: session?.token ?? null, login, logout };
  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);