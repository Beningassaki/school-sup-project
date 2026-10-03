// PAGE D'ACCUEIL : propriétaire ALTY
import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
    <section>
      <h1>School-Sup</h1>
      <p>Vos démarches administratives à l'Université Marien Ngouabi, en ligne et sans déplacement.</p>
      <div className="grille">
        <div className="card">
          <h2>Pré-inscription</h2>
          <p>Choisissez votre filière et déposez votre dossier à distance.</p>
          <Link className="btn" to="/demandes/nouvelle/pre-inscription">Commencer</Link>
        </div>
        <div className="card">
          <h2>Légalisation d'attestation</h2>
          <p>Faites légaliser vos documents sans vous déplacer.</p>
          <Link className="btn" to="/demandes/nouvelle/legalisation">Commencer</Link>
        </div>
        <div className="card">
          <h2>Formations</h2>
          <p>Consultez les facultés, filières et conditions d'accès.</p>
          <Link className="btn btn--secondaire" to="/formations">Voir le catalogue</Link>
        </div>
      </div>
    </section>
  );
}