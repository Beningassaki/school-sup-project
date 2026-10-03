// PROTÈGE UN GROUPE DE ROUTES : il faut être connecté, avec le bon rôle
// Utilisation (dans App.jsx) : <Route element={<ProtectedRoute roles={['agent']} />}>
// Propriétaire : ALTY
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Pas connecté : direction la page de connexion
  if (!user) return <Navigate to="/connexion" state={{ depuis: location }} replace />;

  // Connecté mais mauvais rôle : retour à l'accueil
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}