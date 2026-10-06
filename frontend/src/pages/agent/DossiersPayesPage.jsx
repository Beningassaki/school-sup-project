// =====================================================
// US7 : Lister et vérifier les dossiers payés
// ROUTES : /agent/dossiers  (payés)
//          /agent/dossiers?statut=valide ou ?statut=refuse
// API : GET /api/agent/dossiers?statut=...&type=...&recherche=...&page=...
// FILTRES (US11) : composant FiltresDossiers de Todd. Contrat :
//   onChange({ type, statut, recherche })
// =====================================================
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { LIBELLES_TYPE, formaterMontant } from '../../utils/format.js';
import AgentMenu from './AgentMenu.jsx';
import FiltresDossiers from './FiltresDossiers.jsx';
import './Agent.css';

const TITRES = {
  paye: 'Dossiers payés à contrôler',
  en_attente_complement: 'Dossiers en attente de complément',
  valide: 'Dossiers validés',
  refuse: 'Dossiers refusés',
};

export default function DossiersPayesPage() {
  const [params] = useSearchParams();
  const statutUrl = params.get('statut') || 'paye';

  const [filtres, setFiltres] = useState({ type: '', statut: '', recherche: '' });
  const [page, setPage] = useState(1);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  // Le statut des filtres (s'il est choisi) l'emporte sur celui de l'adresse
  const statut = filtres.statut || statutUrl;

  useEffect(() => {
    let actif = true;
    const requete = new URLSearchParams({ statut, page });
    if (filtres.type) requete.set('type', filtres.type);
    if (filtres.recherche) requete.set('recherche', filtres.recherche);

    api
      .get(`/agent/dossiers?${requete.toString()}`)
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
  }, [statut, filtres.type, filtres.recherche, page]);

  function changerFiltres(nouveauxFiltres) {
    setChargement(true);
    setPage(1);
    setFiltres(nouveauxFiltres);
  }

  function changerPage(nouvellePage) {
    setChargement(true);
    setPage(nouvellePage);
  }

  const nombrePages = resultat ? Math.max(1, Math.ceil(resultat.total / resultat.limite)) : 1;

  return (
    <div className="agent">
      <AgentMenu />

      <section className="agent-contenu">
        <h1>{TITRES[statut] ?? 'Dossiers'}</h1>

        <FiltresDossiers onChange={changerFiltres} />

        {erreur && <p className="message-erreur">{erreur}</p>}
        {chargement && <p>Chargement...</p>}

        {resultat && !chargement && (
          <>
            {resultat.elements.length === 0 ? (
              <p>Aucun dossier ne correspond.</p>
            ) : (
              <div className="tableau-defilant">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Étudiant</th>
                      <th>Formation</th>
                      <th>Paiement</th>
                      <th>Documents</th>
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
