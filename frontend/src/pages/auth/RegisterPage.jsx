// =====================================================
// US1 : Créer un compte étudiant
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /inscription
// API : POST /api/auth/register
// =====================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import './LoginPage.css';
import './RegisterPage.css';

const ETAPES = ['Informations personnelles', 'Coordonnées', 'Sécurité'];

const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const telValide = (v) => /^\+?\d{8,15}$/.test(v.replace(/[\s.-]/g, ''));

export default function RegisterPage() {
  const navigate = useNavigate();

  const [etape, setEtape] = useState(0);
  const [f, setF] = useState({
    nom: '', prenom: '', dateNaissance: '', nationalite: '',
    email: '', telephone: '', motDePasse: '', confirmation: '', cgu: false,
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [afficher, setAfficher] = useState(false);
  const [chargement, setChargement] = useState(false);

  const maj = (champ) => (e) =>
    setF({ ...f, [champ]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  function valider(n) {
    const e = {};
    if (n === 0) {
      const aujourdhui = new Date().toISOString().slice(0, 10);
      if (f.nom.trim().length < 2) e.nom = 'Entrez votre nom.';
      if (f.prenom.trim().length < 2) e.prenom = 'Entrez votre prénom.';
      if (!f.dateNaissance) e.dateNaissance = 'Entrez votre date de naissance.';
      else if (f.dateNaissance >= aujourdhui || f.dateNaissance < '1940-01-01')
        e.dateNaissance = 'Date de naissance invalide.';
      if (!f.nationalite) e.nationalite = 'Choisissez votre nationalité.';
    }
    if (n === 1) {
      if (!emailValide(f.email)) e.email = 'Entrez un email valide.';
      if (!telValide(f.telephone)) e.telephone = 'Entrez un numéro valide (8 à 15 chiffres).';
    }
    if (n === 2) {
      const solide = f.motDePasse.length >= 8 && /[A-Za-z]/.test(f.motDePasse) && /\d/.test(f.motDePasse);
      if (!solide) e.motDePasse = '8 caractères minimum, avec au moins une lettre et un chiffre.';
      if (!f.confirmation || f.confirmation !== f.motDePasse)
        e.confirmation = 'Les mots de passe ne correspondent pas.';
      if (!f.cgu) e.cgu = 'Acceptez les conditions pour continuer.';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setErreurServeur('');
    if (!valider(etape)) return;
    if (etape < ETAPES.length - 1) return setEtape(etape + 1);

    setChargement(true);
    try {
      await api.post('/auth/register', {
        nom: f.nom.trim(),
        prenom: f.prenom.trim(),
        dateNaissance: f.dateNaissance,
        nationalite: f.nationalite,
        email: f.email.trim(),
        telephone: f.telephone.trim(),
        motDePasse: f.motDePasse, // ⚠️ confirmer les noms de champs avec le backend
      });
      navigate('/connexion', { state: { inscrit: true } });
    } catch (err) {
      if (err.status === 409) {
        setErreurServeur(err.message || 'Un compte existe déjà avec cet email.');
        setEtape(1);
      } else if (err.status === 400) {
        setErreurServeur(err.details?.[0]?.message || err.message || 'Vérifiez les informations saisies.');
      } else {
        setErreurServeur(err.message || "Création du compte impossible pour le moment. Réessayez plus tard.");
      }
    } finally {
      setChargement(false);
    }
  }

  const Erreur = ({ nom }) =>
    erreurs[nom] ? <p className="message-erreur" role="alert">{erreurs[nom]}</p> : null;

  return (
    <main className="register-page">
      <div className="register-top">
        <Link to="/" className="login-logo" aria-label="School-Sup, accueil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 9l10-5 10 5-10 5L2 9z" />
            <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
          </svg>
          School-Sup
        </Link>
        <Link to="/connexion">Retour</Link>
      </div>

      <section className="register-card">
        <h1>Créer un compte</h1>
        <p className="login-sub">Rejoignez la communauté School-Sup.</p>

        <ol className="register-steps" aria-label="Étapes de l'inscription">
          {ETAPES.map((nom, i) => (
            <li
              key={nom}
              className={i === etape ? 'actif' : i < etape ? 'fait' : ''}
              aria-current={i === etape ? 'step' : undefined}
            >
              <span className="num">{i < etape ? '✓' : i + 1}</span>
              <span>{nom}</span>
            </li>
          ))}
        </ol>

        {erreurServeur && (
          <p className="message-erreur login-alerte" role="alert">{erreurServeur}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {etape === 0 && (
            <>
              <div className="register-row">
                <div className="login-field">
                  <label htmlFor="nom">Nom</label>
                  <input id="nom" autoComplete="family-name" placeholder="Dupont"
                    value={f.nom} onChange={maj('nom')} aria-invalid={Boolean(erreurs.nom)} />
                  <Erreur nom="nom" />
                </div>
                <div className="login-field">
                  <label htmlFor="prenom">Prénom</label>
                  <input id="prenom" autoComplete="given-name" placeholder="Jean"
                    value={f.prenom} onChange={maj('prenom')} aria-invalid={Boolean(erreurs.prenom)} />
                  <Erreur nom="prenom" />
                </div>
              </div>
              <div className="register-row">
                <div className="login-field">
                  <label htmlFor="dateNaissance">Date de naissance</label>
                  <input id="dateNaissance" type="date" autoComplete="bday"
                    value={f.dateNaissance} onChange={maj('dateNaissance')}
                    aria-invalid={Boolean(erreurs.dateNaissance)} />
                  <Erreur nom="dateNaissance" />
                </div>
                <div className="login-field">
                  <label htmlFor="nationalite">Nationalité</label>
                  <select id="nationalite" value={f.nationalite} onChange={maj('nationalite')}
                    aria-invalid={Boolean(erreurs.nationalite)}>
                    <option value="">Choisir…</option>
                    <option>Congolaise</option>
                    <option>Autre</option>
                  </select>
                  <Erreur nom="nationalite" />
                </div>
              </div>
            </>
          )}

          {etape === 1 && (
            <>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" placeholder="votre@email.com"
                  value={f.email} onChange={maj('email')} aria-invalid={Boolean(erreurs.email)} />
                <Erreur nom="email" />
              </div>
              <div className="login-field">
                <label htmlFor="telephone">Téléphone</label>
                <input id="telephone" type="tel" autoComplete="tel" placeholder="+242 06 000 00 00"
                  value={f.telephone} onChange={maj('telephone')} aria-invalid={Boolean(erreurs.telephone)} />
                <Erreur nom="telephone" />
                <p className="register-aide">Utilisé pour les notifications et le paiement Mobile Money.</p>
              </div>
            </>
          )}

          {etape === 2 && (
            <>
              <div className="login-field">
                <label htmlFor="motDePasse">Mot de passe</label>
                <div className="login-pw">
                  <input id="motDePasse" type={afficher ? 'text' : 'password'} autoComplete="new-password"
                    value={f.motDePasse} onChange={maj('motDePasse')}
                    aria-invalid={Boolean(erreurs.motDePasse)} />
                  <button type="button" onClick={() => setAfficher(!afficher)}>
                    {afficher ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <Erreur nom="motDePasse" />
              </div>
              <div className="login-field">
                <label htmlFor="confirmation">Confirmer le mot de passe</label>
                <input id="confirmation" type={afficher ? 'text' : 'password'} autoComplete="new-password"
                  value={f.confirmation} onChange={maj('confirmation')}
                  aria-invalid={Boolean(erreurs.confirmation)} />
                <Erreur nom="confirmation" />
              </div>
              <label className="register-cgu">
                <input type="checkbox" checked={f.cgu} onChange={maj('cgu')} />
                J'accepte les conditions d'utilisation
              </label>
              <Erreur nom="cgu" />
            </>
          )}

          <div className="register-actions">
            {etape > 0 && (
              <button type="button" className="register-retour" onClick={() => setEtape(etape - 1)}>
                Retour
              </button>
            )}
            <button type="submit" className="login-submit" disabled={chargement}>
              {chargement ? 'Création…' : etape === ETAPES.length - 1 ? 'Créer mon compte' : 'Suivant'}
            </button>
          </div>
        </form>

        <p className="login-bas">
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
