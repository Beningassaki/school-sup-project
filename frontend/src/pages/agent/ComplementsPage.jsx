// =====================================================
// US14 : Dossiers en attente de complément de pièce
// ROUTE : /agent/complements
// API : GET /api/agent/complements?page=1
// La demande de complément elle-même se fait depuis la page du dossier
// (DossierDetailPage), bouton "Demander un complément".
// =====================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formaterDateHeure } from '../../utils/format.js';
import AgentMenu from './AgentMenu.jsx';
import './Agent.css';

export default function ComplementsPage() {
  const [page, setPage] = useState(1);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;
    api
      .get(`/agent/complements?page=${page}`)
      .then((donnees) => {
        if (actif) {
          setResultat(donnees);
          setErreur('');
        }
      })
      .catch((e) => {
        if (actif) setErreur(e.message);
      })
      .finally(() => {
        if (actif) setChargement(false);
      });
    return () => {
      actif = false;
    };
  }, [page]);

  function changerPage(nouvellePage) {
    setChargement(true);
    setPage(nouvellePage);
  }

  const nombrePages = resultat ? Math.max(1, Math.ceil(resultat.total / resultat.limite)) : 1;

  return (
    <div className="agent">
      <AgentMenu />

      <section className="agent-contenu">
        <h1>En attente de complément</h1>
        <p>Dossiers pour lesquels une pièce complémentaire a été demandée à l'étudiant.</p>

        {erreur && <p className="message-erreur">{erreur}</p>}
        {chargement && <p>Chargement...</p>}

        {resultat && !chargement && (
          <>
            {resultat.elements.length === 0 ? (
              <p>Aucun dossier en attente de complément.</p>
            ) : (
              <div className="tableau-defilant">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Pièce demandée</th>
                      <th>Motif</th>
                      <th>Date de la demande</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultat.elements.map((d) => (
                      <tr key={d.id}>
                        <td>{d.reference}</td>
                        <td>
                          {d.etudiant.prenom} {d.etudiant.nom}
                        </td>
                        <td>{d.piece_demandee ?? '—'}</td>
                        <td className="complement-motif">{d.motif}</td>
                        <td>{formaterDateHeure(d.updated_at)}</td>
                        <td>
                          <StatusBadge statut={d.statut} />
                        </td>
                        <td>
                          <Link className="btn btn--petit" to={`/agent/dossiers/${d.id}`}>
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pagination">
              <button
                className="btn btn--secondaire btn--petit"
                disabled={page <= 1}
                onClick={() => changerPage(page - 1)}
              >
                Précédent
              </button>
              <span>
                Page {page} sur {nombrePages} · {resultat.total} dossier(s)
              </span>
              <button
                className="btn btn--secondaire btn--petit"
                disabled={page >= nombrePages}
                onClick={() => changerPage(page + 1)}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
