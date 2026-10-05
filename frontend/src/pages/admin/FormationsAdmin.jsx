import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';

const VIDE = { nom: '', etablissement: '', niveau: 'Licence' };
const NIVEAUX = ['Licence', 'Licence professionnelle', 'Master', 'Doctorat'];

export default function FormationsAdmin() {
  const [liste, setListe] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [editId, setEditId] = useState(null);
  const [erreurs, setErreurs] = useState({});
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
    executer(() => adminApi.listerFormations()).finally(() => setChargement(false));
  }, []);

  const maj = (champ) => (e) => setForm({ ...form, [champ]: e.target.value });

  function annuler() {
    setForm(VIDE);
    setEditId(null);
    setErreurs({});
  }

  async function soumettre(ev) {
    ev.preventDefault();
    const e = {};
    if (form.nom.trim().length < 3) e.nom = 'Entrez le nom de la formation.';
    if (!form.etablissement.trim()) e.etablissement = "Entrez l'établissement.";
    setErreurs(e);
    if (Object.keys(e).length) return;

    const ok = await executer(
      () => adminApi.enregistrerFormation({ ...form, nom: form.nom.trim(), etablissement: form.etablissement.trim(), id: editId }),
      editId ? 'Formation modifiée.' : 'Formation ajoutée.'
    );
    if (ok) annuler();
  }

  function modifier(f) {
    setEditId(f.id);
    setForm({ nom: f.nom, etablissement: f.etablissement, niveau: f.niveau });
    setErreurs({});
  }

  return (
    <>
      <form className="admin-form" onSubmit={soumettre} noValidate>
        <h2>{editId ? 'Modifier la formation' : 'Ajouter une formation'}</h2>
        <div className="admin-grille">
          <div className="admin-champ admin-large">
            <label htmlFor="fo-nom">Nom de la formation</label>
            <input id="fo-nom" value={form.nom} onChange={maj('nom')} placeholder="Informatique et Réseaux"
              aria-invalid={Boolean(erreurs.nom)} />
            {erreurs.nom && <p className="message-erreur" role="alert">{erreurs.nom}</p>}
          </div>
          <div className="admin-champ">
            <label htmlFor="fo-etab">Établissement</label>
            <input id="fo-etab" value={form.etablissement} onChange={maj('etablissement')} placeholder="FST"
              aria-invalid={Boolean(erreurs.etablissement)} />
            {erreurs.etablissement && <p className="message-erreur" role="alert">{erreurs.etablissement}</p>}
          </div>
          <div className="admin-champ">
            <label htmlFor="fo-niveau">Niveau</label>
            <select id="fo-niveau" value={form.niveau} onChange={maj('niveau')}>
              {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-actions">
          <button type="submit" className="admin-btn">{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button type="button" className="admin-btn-sec" onClick={annuler}>Annuler</button>}
        </div>
      </form>

      {message.texte && (
        <p className={message.type === 'erreur' ? 'message-erreur admin-alerte' : 'admin-succes'}
          role={message.type === 'erreur' ? 'alert' : 'status'}>{message.texte}</p>
      )}

      <h2>Catalogue</h2>
      {chargement ? <p className="admin-vide">Chargement…</p> : liste.length === 0 ? (
        <p className="admin-vide">Aucune formation. Ajoutez la première ci-dessus.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Formation</th><th>Établissement</th><th>Niveau</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {liste.map((f) => (
                <tr key={f.id} className={f.visible ? '' : 'masquee'}>
                  <td>{f.nom}</td>
                  <td>{f.etablissement}</td>
                  <td>{f.niveau}</td>
                  <td><span className={`admin-badge ${f.visible ? 'ok' : 'off'}`}>{f.visible ? 'Visible' : 'Masquée'}</span></td>
                  <td className="admin-cell-actions">
                    <button type="button" className="admin-lien" onClick={() => modifier(f)}>Modifier</button>
                    <button type="button" className="admin-lien"
                      onClick={() => executer(() => adminApi.basculerFormation(f.id), f.visible ? 'Formation masquée.' : 'Formation de nouveau visible.')}>
                      {f.visible ? 'Masquer' : 'Afficher'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}