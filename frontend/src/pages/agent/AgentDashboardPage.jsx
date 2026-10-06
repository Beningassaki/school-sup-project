// =====================================================
// US7 : Tableau de bord de l'agent
// ROUTE : /agent  (rôle agent)
// API : GET /api/agent/statistiques  +  GET /api/agent/dossiers?statut=paye&limite=5
// =====================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { LIBELLES_TYPE, formaterMontant } from '../../utils/format.js';
import AgentMenu from './AgentMenu.jsx';
import './Agent.css';

export default function AgentDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recents, setRecents] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/agent/statistiques'), api.get('/agent/dossiers?statut=paye&limite=5')])
      .then(([statistiques, liste]) => {
        setStats(statistiques);
        setRecents(liste.elements);
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="agent">
      <AgentMenu />

      <section className="agent-contenu">
        <h1>Tableau de bord</h1>

        {chargement && <p>Chargement...</p>}
        {erreur && <p className="message-erreur">{erreur}</p>}

        {stats && (
          <>
            <div className="stats">
              <div className="stat">
                <strong>{stats.a_controler}</strong>
                Dossiers à contrôler
              </div>
              <div className="stat">
                <strong>{stats.en_attente_complement}</strong>
                En attente de complément
              </div>
              <div className="stat">
                <strong>{stats.valides}</strong>
                Dossiers validés
              </div>
              <div className="stat">
                <strong>{stats.refuses}</strong>
                Dossiers refusés
              </div>
            </div>

            <h2>Derniers dossiers payés à contrôler</h2>
            {recents.length === 0 ? (
              <p>Aucun dossier à contrôler pour le moment.</p>
            ) : (
              <div className="tableau-defilant">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Démarche</th>
                      <th>Montant</th>
                      <th>Documents</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recents.map((d) => (
                      <tr key={d.id}>
                        <td>{d.reference}</td>
                        <td>
                          {d.etudiant.prenom} {d.etudiant.nom}
                        </td>
                        <td>{d.filiere ?? LIBELLES_TYPE[d.type]}</td>
                        <td>{formaterMontant(d.montant)}</td>
                        <td>
                          {d.documents_fournis}/{d.documents_requis}
                        </td>
                        <td>
                          <Link className="btn btn--petit" to={`/agent/dossiers/${d.id}`}>
                            Consulter
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p>
              <Link to="/agent/dossiers">Voir tous les dossiers payés</Link>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
