import './Accueil.css';
import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
    <main className="accueil-page">
      <section className="accueil-hero" aria-labelledby="accueil-title">
        <div className="accueil-hero__content">
          <span className="accueil-eyebrow">Votre avenir universitaire commence ici</span>
          <h1 id="accueil-title">Vos démarches universitaires, <span>plus simplement.</span></h1>
          <p className="accueil-hero__text">
            Trouvez votre formation, déposez vos demandes et suivez vos démarches depuis une seule plateforme.
          </p>
          <div className="accueil-hero__actions">
            <Link className="accueil-button accueil-button--primary" to="/formations">
              Trouver une formation <span aria-hidden="true">→</span>
            </Link>
            <Link className="accueil-button accueil-button--secondary" to="/connexion">
              Commencer une démarche
            </Link>
          </div>
          <div className="accueil-hero__note">
            <span className="accueil-hero__note-icon" aria-hidden="true">✓</span>
            Un espace unique pour vos services universitaires
          </div>
        </div>
        <div className="accueil-hero__visual">
          <img src="/umng-campus.jpg" alt="Entrée de la Faculté des lettres, arts et sciences humaines de l’Université Marien Ngouabi" />
        </div>
      </section>

      <section className="accueil-stats" aria-label="Les services School-Sup">
        <div className="accueil-stat"><strong>11</strong><span>établissements</span></div>
        <div className="accueil-stat"><strong>50+</strong><span>formations</span></div>
        <div className="accueil-stat"><strong>100 %</strong><span>en ligne</span></div>
        <div className="accueil-stat"><strong>24h/24</strong><span>suivi de vos demandes</span></div>
      </section>

      <section className="accueil-steps" aria-labelledby="accueil-steps-title">
        <div className="accueil-section-heading">
          <span className="accueil-eyebrow">Un parcours plus fluide</span>
          <h2 id="accueil-steps-title">Comment ça marche ?</h2>
          <p>Réalisez vos démarches universitaires en quelques étapes, à votre rythme.</p>
        </div>
        <ol className="accueil-steps__grid">
          <li className="accueil-step">
            <span className="accueil-step__number">01</span>
            <span className="accueil-step__icon" aria-hidden="true">⌕</span>
            <h3>Trouvez votre formation</h3>
            <p>Explorez les établissements et les filières disponibles.</p>
          </li>
          <li className="accueil-step">
            <span className="accueil-step__number">02</span>
            <span className="accueil-step__icon accueil-step__icon--green" aria-hidden="true">▤</span>
            <h3>Déposez votre dossier</h3>
            <p>Complétez votre demande et transmettez vos pièces en ligne.</p>
          </li>
          <li className="accueil-step">
            <span className="accueil-step__number">03</span>
            <span className="accueil-step__icon accueil-step__icon--orange" aria-hidden="true">₣</span>
            <h3>Payez en ligne</h3>
            <p>Réglez les frais associés à votre démarche depuis votre espace.</p>
          </li>
          <li className="accueil-step">
            <span className="accueil-step__number">04</span>
            <span className="accueil-step__icon accueil-step__icon--blue" aria-hidden="true">✓</span>
            <h3>Suivez votre demande</h3>
            <p>Retrouvez l’avancement de vos démarches à tout moment.</p>
          </li>
        </ol>
      </section>

      <section className="accueil-cta" aria-labelledby="accueil-cta-title">
        <div>
          <span className="accueil-eyebrow">Prêt à commencer ?</span>
          <h2 id="accueil-cta-title">Vos démarches, sans les déplacements.</h2>
          <p>Connectez-vous ou créez votre compte pour accéder à votre espace étudiant.</p>
        </div>
        <Link className="accueil-button accueil-button--light" to="/inscription">
          Créer mon compte <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
