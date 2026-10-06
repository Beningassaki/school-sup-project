// =====================================================
// US16 : Accéder à l'historique du dossier
// ROUTE : /mes-demandes/:id/historique  (étudiant connecté)
// API : GET /api/suivi/:demandeId/historique
// RÈGLE : le motif d'un refus ou d'un complément est visible par l'étudiant
// =====================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formaterDateHeure } from '../../utils/format.js';
import './Historique.css';

export default function HistoriquePage() {
  const { id } = useParams();
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get(`/suivi/${id}/historique`)
      .then(setDonnees)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p>Chargement de l'historique...</p>;

  if (erreur) {
    return (
      <section className="historique">
        <p className="message-erreur">{erreur}</p>
        <Link className="btn btn--secondaire" to="/mes-demandes">
          Retour à mes demandes
        </Link>
      </section>
    );
  }

  return (
    <section className="card historique">
      <h1>Historique du dossier</h1>
      <p>
        Dossier {donnees.reference} · Statut actuel : <StatusBadge statut={donnees.statut} />
      </p>

      <ol className="chrono">
        {donnees.historique.map((etape, index) => (
          <li className="chrono__etape" key={`${etape.created_at}-${index}`}>
            {/* Pas d'ancien statut = c'est la création du dossier */}
            <p className="chrono__titre">
              {etape.ancien_statut ? 'Changement de statut' : 'Création du dossier'}
            </p>
            <StatusBadge statut={etape.nouveau_statut} />
            <p className="chrono__date">{formaterDateHeure(etape.created_at)}</p>
            {etape.motif && <p className="chrono__motif">Motif : {etape.motif}</p>}
          </li>
        ))}
      </ol>

      <Link className="btn btn--secondaire" to="/mes-demandes">
        Retour à mes demandes
      </Link>
    </section>
  );
}
