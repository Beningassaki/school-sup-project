import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';

const TYPES = [
  { valeur: 'legalisation', libelle: 'Légalisation' },
  { valeur: 'pre_inscription', libelle: 'Pré-inscription' },
];

export default function PiecesAdmin() {
  const [type, setType] = useState('legalisation');
  const [liste, setListe] = useState([]);
  const [nom, setNom] = useState('');
  const [obligatoire, setObligatoire] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState({ type: '', texte: '' });
  const [chargement, setChargement] = useState(true);

  async function executer(action, succes) {
    setMessage({ type: '', texte: '' });
    try {
      setListe(await action());
      if (succes) setMessage({ type: 'succes', texte: succes });
      return true;
    } catch {
      setMessage({ type: 'erreur', texte: 'Action impossible pour le moment. Réessayez plus tard.' });
      return false;
    }
  }

  useEffect(() => {
    setChargement(true);
    executer(() => adminApi.listerPieces(type)).finally(() => setChargement(false));
  }, [type]);

  async function ajouter(ev) {
    ev.preventDefault();
    if (nom.trim().length < 2) return setErreur('Entrez le nom de la pièce.');
    if (liste.some((p) => p.nom.toLowerCase() === nom.trim().toLowerCase()))
      return setErreur('Cette pièce existe déjà pour ce type de demande.');
    setErreur('');
    const ok = await executer(() => adminApi.ajouterPiece(type, { nom: nom.trim(), obligatoire }), 'Pièce ajoutée.');
    if (ok) { setNom(''); setObligatoire(true); }
  }

  function retirer(p) {
    if (window.confirm(`Retirer « ${p.nom} » des pièces demandées ?`))
      executer(() => adminApi.supprimerPiece(type, p.id), 'Pièce retirée.');
  }

  return (
    <>
      <div className="admin-segments" role="group" aria-label="Type de demande">
        {TYPES.map((t) => (
          <button key={t.valeur} type="button" className={t.valeur === type ? 'actif' : ''}
            aria-pressed={t.valeur === type} onClick={() => setType(t.valeur)}>{t.libelle}</button>
        ))}
      </div>

      <form className="admin-form" onSubmit={ajouter} noValidate>
        <h2>Ajouter une pièce</h2>
        <div className="admin-champ">
          <label htmlFor="pi-nom">Nom de la pièce</label>
          <input id="pi-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Acte de naissance"
            aria-invalid={Boolean(erreur)} />
          {erreur && <p className="message-erreur" role="alert">{erreur}</p>}
        </div>
        <label className="admin-check">
          <input type="checkbox" checked={obligatoire} onChange={(e) => setObligatoire(e.target.checked)} />
          Pièce obligatoire
        </label>
        <div className="admin-actions"><button type="submit" className="admin-btn">Ajouter</button></div>
      </form>

      {message.texte && (
        <p className={message.type === 'erreur' ? 'message-erreur admin-alerte' : 'admin-succes'}
          role={message.type === 'erreur' ? 'alert' : 'status'}>{message.texte}</p>
      )}

      <h2>Pièces demandées</h2>
      {chargement ? <p className="admin-vide">Chargement…</p> : liste.length === 0 ? (
        <p className="admin-vide">Aucune pièce demandée pour ce type de demande.</p>
      ) : (
        <ul className="admin-liste">
          {liste.map((p) => (
            <li key={p.id}>
              <span>{p.nom}</span>
              <span className={`admin-badge ${p.obligatoire ? 'ok' : 'off'}`}>{p.obligatoire ? 'Obligatoire' : 'Facultative'}</span>
              <span className="admin-cell-actions">
                <button type="button" className="admin-lien"
                  onClick={() => executer(() => adminApi.basculerPiece(type, p.id), 'Pièce mise à jour.')}>
                  {p.obligatoire ? 'Rendre facultative' : 'Rendre obligatoire'}
                </button>
                <button type="button" className="admin-lien danger" onClick={() => retirer(p)}>Retirer</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}