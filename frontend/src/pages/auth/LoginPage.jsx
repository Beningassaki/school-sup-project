// =====================================================
// US1 : Se connecter
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /connexion
// API : POST /api/auth/login   (backend : module auth, Todd)
// APRÈS CONNEXION : appeler login(token, user) de useAuth() (voir AuthContext)
// ⚠️ Quand cette US est finie : supprimer l'outil de test de rôle dans Navbar.jsx
// =====================================================
// =====================================================
// US1 : Se connecter
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /connexion
// API : POST /api/auth/login
// =====================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // ⚠️ garde ton chemin corrigé
import { api } from '../../services/api.js';
import './LoginPage.css';

// ⚠️ garde tes vraies routes
const ACCUEIL_PAR_ROLE = {
  etudiant: '/mes-demandes',
  agent: '/agent/dossiers',
  admin: '/admin',
};

const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficher, setAfficher] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [chargement, setChargement] = useState(false);

  function valider() {
    const e = {};
    if (!email.trim()) e.email = 'Entrez votre email.';
    else if (!emailValide(email)) e.email = 'Entrez un email valide.';
    if (!motDePasse) e.motDePasse = 'Entrez votre mot de passe.';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setErreurServeur('');
    if (!valider()) return;

    setChargement(true);
    try {
      const data = await api.post('/auth/login', {
        email: email.trim(),
        motDePasse,
      });
      login(data.token, data.user);
      navigate(ACCUEIL_PAR_ROLE[data.user.role] || '/', { replace: true });
    } catch (err) {
      setErreurServeur(
        err.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Connexion impossible pour le moment. Réessayez plus tard.'
      );
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-main">
        <div className="login-box">
          <Link to="/" className="login-logo" aria-label="School-Sup, accueil">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 9l10-5 10 5-10 5L2 9z" />
              <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
            </svg>
            School-Sup
          </Link>

          <h1>Connectez-vous</h1>
          <p className="login-sub">Accédez à votre espace personnel.</p>

          {erreurServeur && (
            <p className="message-erreur login-alerte" role="alert">{erreurServeur}</p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(erreurs.email)}
              />
              {erreurs.email && <p className="message-erreur" role="alert">{erreurs.email}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="motDePasse">Mot de passe</label>
              <div className="login-pw">
                <input
                  id="motDePasse"
                  type={afficher ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  aria-invalid={Boolean(erreurs.motDePasse)}
                />
                <button type="button" onClick={() => setAfficher(!afficher)}>
                  {afficher ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {erreurs.motDePasse && <p className="message-erreur" role="alert">{erreurs.motDePasse}</p>}
            </div>

            <button type="submit" className="login-submit" disabled={chargement}>
              {chargement ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="login-bas">
            Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
        </div>
      </section>

      <aside className="login-aside" aria-label="Présentation de School-Sup">
        <h2>Un espace unique pour toutes vos démarches</h2>
        <ul>
          <li>Pré-inscription</li>
          <li>Légalisation</li>
          <li>Suivi des dossiers</li>
          <li>Documents numériques</li>
        </ul>
      </aside>
    </main>
  );
}
