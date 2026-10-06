// =====================================================
// US7 + US8 + US14 : consulter un dossier, puis le traiter
// ROUTE : /agent/dossiers/:id
// API : GET   /api/agent/dossiers/:id
//       GET   /api/agent/documents/:documentId/fichier  (voir une pièce)
//       PATCH /api/agent/documents/:documentId          (valide / illisible)
//       POST  /api/agent/dossiers/:id/valider           (US8)
//       POST  /api/agent/dossiers/:id/refuser           (US8, motif obligatoire)
//       POST  /api/agent/dossiers/:id/complement        (US14, motif obligatoire)
// RÈGLE : un dossier validé, refusé ou en attente de complément n'est plus traitable
// =====================================================
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { LIBELLES_TYPE, formaterDateHeure, formaterMontant } from '../../utils/format.js';
import AgentMenu from './AgentMenu.jsx';
import { ouvrirPiece } from './ouvrirFichier.js';
import './Agent.css';

const LIBELLES_PIECE = {
  a_verifier: 'À vérifier',
  valide: 'Valide',
  illisible: 'Illisible',
  manquant: 'Manquant',
};

// Transforme une erreur de l'API en texte lisible (avec le détail des champs)
function formaterErreur(erreur) {
  if (erreur.details?.length > 0) {
    return `${erreur.message} : ${erreur.details.map((d) => d.message).join(' · ')}`;
  }
  return erreur.message;
}

export default function DossierDetailPage() {
  const { id } = useParams();
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState(''); // erreur d'une action
  const [info, setInfo] = useState(''); // succès d'une action
  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);

  // Formulaire ouvert : null, 'refuser' ou 'complement'
  const [mode, setMode] = useState(null);
  const [motif, setMotif] = useState('');
  const [piece, setPiece] = useState('');

  const charger = useCallback(async () => {
    try {
      setDonnees(await api.get(`/agent/dossiers/${id}`));
      setErreur('');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    let actif = true;
    api
      .get(`/agent/dossiers/${id}`)
      .then((resultat) => {
        if (actif) {
          setDonnees(resultat);
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
  }, [id]);

  function fermerFormulaire() {
    setMode(null);
    setMotif('');
    setPiece('');
  }

  // Exécute une action, recharge le dossier, puis affiche le résultat
  async function executer(action, messageSucces) {
    setMessage('');
    setInfo('');
    setOccupe(true);
    try {
      const resultat = await action();
      await charger();
      fermerFormulaire();
      setInfo(messageSucces(resultat));
    } catch (e) {
      setMessage(formaterErreur(e));
    } finally {
      setOccupe(false);
    }
  }

  async function voir(documentId) {
    setMessage('');
    try {
      await ouvrirPiece(documentId);
    } catch (e) {
      setMessage(e.message);
    }
  }

  async function marquer(documentId, statut) {
    setMessage('');
    try {
      await api.patch(`/agent/documents/${documentId}`, { statut });
      await charger();
    } catch (e) {
      setMessage(e.message);
    }
  }

  function valider() {
    if (!window.confirm('Valider ce dossier ? Un reçu sera créé et la décision est définitive.')) {
      return;
    }
    executer(
      () => api.post(`/agent/dossiers/${id}/valider`),
      (resultat) => `Dossier validé. Code du reçu : ${resultat.code_recu}`,
    );
  }

  function soumettreRefus(evenement) {
    evenement.preventDefault();
    executer(
      () => api.post(`/agent/dossiers/${id}/refuser`, { motif }),
      () => "Dossier refusé. Le motif est visible par l'étudiant.",
    );
  }

  function soumettreComplement(evenement) {
    evenement.preventDefault();
    executer(
      () => api.post(`/agent/dossiers/${id}/complement`, { type_piece: piece, motif }),
      () => "Complément demandé. Le motif est visible par l'étudiant.",
    );
  }

  if (chargement) return <p>Chargement du dossier...</p>;

  if (erreur) {
    return (
      <div className="agent">
        <AgentMenu />
        <section className="agent-contenu">
          <p className="message-erreur">{erreur}</p>
          <Link className="btn btn--secondaire" to="/agent/dossiers">
            Retour à la liste
          </Link>
        </section>
      </div>
    );
  }

  const { dossier, pieces_requises: piecesRequises, etudiant, documents, paiement, historique } =
    donnees;
  const traitable = dossier.statut === 'paye'; // seul un dossier payé peut être traité

  return (
    <div className="agent">
      <AgentMenu />

      <section className="agent-contenu">
        <p>
          <Link to="/agent/dossiers">← Retour à la liste</Link>
        </p>
        <h1>
          Dossier {dossier.reference} <StatusBadge statut={dossier.statut} />
        </h1>

        {info && <p className="info-ok">{info}</p>}
        {message && <p className="message-erreur">{message}</p>}

        <div className="detail">
          <article className="card">
            <h2>Étudiant</h2>
            <dl>
              <dt>Nom</dt>
              <dd>
                {etudiant.prenom} {etudiant.nom}
              </dd>
              <dt>Email</dt>
              <dd>{etudiant.email}</dd>
              <dt>Téléphone</dt>
              <dd>{etudiant.telephone ?? 'Non renseigné'}</dd>
            </dl>
          </article>

          <article className="card">
            <h2>Dossier</h2>
            <dl>
              <dt>Démarche</dt>
              <dd>{LIBELLES_TYPE[dossier.type] ?? dossier.type}</dd>
              {dossier.filiere && (
                <>
                  <dt>Filière</dt>
                  <dd>
                    {dossier.filiere} ({dossier.faculte})
                  </dd>
                </>
              )}
              {dossier.details && (
                <>
                  <dt>Précisions</dt>
                  <dd>{dossier.details}</dd>
                </>
              )}
              {dossier.motif && (
                <>
                  <dt>Motif</dt>
                  <dd>{dossier.motif}</dd>
                </>
              )}
            </dl>
          </article>

          <article className="card">
            <h2>Paiement</h2>
            {paiement ? (
              <dl>
                <dt>Montant</dt>
                <dd>{formaterMontant(paiement.montant)}</dd>
                <dt>Opérateur</dt>
                <dd>{paiement.operateur}</dd>
                <dt>Date</dt>
                <dd>{formaterDateHeure(paiement.created_at)}</dd>
              </dl>
            ) : (
              <p>Aucun paiement confirmé.</p>
            )}
          </article>
        </div>

        <article className="card">
          <h2>
            Pièces justificatives ({documents.length}/{piecesRequises.length})
          </h2>
          {documents.length === 0 && <p>Aucune pièce fournie.</p>}

          {documents.map((p) => (
            <div className="piece-agent" key={p.id}>
              <div>
                <strong>{p.type_piece}</strong>
                <div>
                  {p.nom_fichier} · {LIBELLES_PIECE[p.statut] ?? p.statut}
                </div>
              </div>

              <div className="piece-agent__actions">
                <button
                  className="btn btn--secondaire btn--petit"
                  type="button"
                  onClick={() => voir(p.id)}
                >
                  Voir
                </button>
                {traitable && (
                  <>
                    <button
                      className="btn btn--petit"
                      type="button"
                      onClick={() => marquer(p.id, 'valide')}
                    >
                      Valide
                    </button>
                    <button
                      className="btn btn--danger btn--petit"
                      type="button"
                      onClick={() => marquer(p.id, 'illisible')}
                    >
                      Illisible
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </article>

        {/* ---------- US8 et US14 : décision de l'agent (dossier payé uniquement) ---------- */}
        {traitable && (
          <article className="card" style={{ marginTop: '1rem' }}>
            <h2>Décision</h2>

            <div className="actions-dossier">
              <button className="btn" type="button" disabled={occupe} onClick={valider}>
                Valider le dossier
              </button>
              <button
                className="btn btn--secondaire"
                type="button"
                disabled={occupe}
                onClick={() => setMode(mode === 'complement' ? null : 'complement')}
              >
                Demander un complément
              </button>
              <button
                className="btn btn--danger"
                type="button"
                disabled={occupe}
                onClick={() => setMode(mode === 'refuser' ? null : 'refuser')}
              >
                Refuser
              </button>
            </div>

            {mode === 'refuser' && (
              <form className="formulaire-action" onSubmit={soumettreRefus}>
                <div className="champ">
                  <label htmlFor="motif-refus">Motif du refus (visible par l'étudiant)</label>
                  <textarea
                    id="motif-refus"
                    rows={3}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Ex : Attestation non conforme"
                    required
                  />
                </div>
                <button className="btn btn--danger" type="submit" disabled={occupe}>
                  {occupe ? 'Envoi...' : 'Confirmer le refus'}
                </button>
              </form>
            )}

            {mode === 'complement' && (
              <form className="formulaire-action" onSubmit={soumettreComplement}>
                <div className="champ">
                  <label htmlFor="piece">Pièce concernée</label>
                  <select
                    id="piece"
                    value={piece}
                    onChange={(e) => setPiece(e.target.value)}
                    required
                  >
                    <option value="">Choisir une pièce...</option>
                    {piecesRequises.map((nom) => (
                      <option key={nom} value={nom}>
                        {nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="champ">
                  <label htmlFor="motif-complement">Message à l'étudiant</label>
                  <textarea
                    id="motif-complement"
                    rows={3}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Ex : Votre photo d'identité est illisible. Merci de fournir une nouvelle photo plus nette."
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={occupe}>
                  {occupe ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </article>
        )}

        {!traitable && (
          <p className="demande__aide">
            {dossier.statut === 'en_attente_complement'
              ? "Ce dossier attend une pièce de l'étudiant."
              : 'Ce dossier a été traité : il ne peut plus être modifié.'}
          </p>
        )}

        <article className="card" style={{ marginTop: '1rem' }}>
          <h2>Historique</h2>
          <ul className="historique-agent">
            {historique.map((etape, index) => (
              <li key={`${etape.created_at}-${index}`}>
                {formaterDateHeure(etape.created_at)} : <StatusBadge statut={etape.nouveau_statut} />
                {etape.motif && ` · Motif : ${etape.motif}`}
                {etape.agent_nom && ` · par ${etape.agent_prenom} ${etape.agent_nom}`}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
