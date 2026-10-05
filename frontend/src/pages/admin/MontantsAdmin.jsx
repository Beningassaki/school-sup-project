import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';

const formater = (n) => new Intl.NumberFormat('fr-FR').format(n);

export default function MontantsAdmin() {
  const [frais, setFrais] = useState([]);
  const [saisies, setSaisies] = useState({});
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState({ type: '', texte: '' });
  const [enCours, setEnCours] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    adminApi.listerFrais()
      .then((liste) => {
        setFrais(liste);
        setSaisies(Object.fromEntries(liste.map((f) => [f.type, String(f.montant)])));
      })
      .catch(() => setMessage({ type: 'erreur', texte: 'Chargement impossible pour le moment.' }))
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer(f) {
    const valeur = saisies[f.type].trim();
    if (!/^\d+$/.test(valeur)) {
      return setErreurs({ ...erreurs, [f.type]: 'Entrez un montant en chiffres, sans virgule.' });
    }
    setErreurs({ ...erreurs, [f.type]: '' });
    setMessage({ type: '', texte: '' });
    setEnCours(f.type);
    try {
      setFrais(await adminApi.modifierFrais(f.type, Number(valeur)));
      setMessage({ type: 'succes', texte: `Montant de « ${f.libelle} » enregistré.` });
    } catch {
      setMessage({ type: 'erreur', texte: 'Enregistrement impossible pour le moment. Réessayez plus tard.' });
    } finally {
      setEnCours('');
    }
  }

  return (
    <>
      <h2>Frais et montants</h2>
      <p className="admin-vide">Les montants sont en FCFA.</p>

      {message.texte && (
        <p className={message.type === 'erreur' ? 'message-erreur admin-alerte' : 'admin-succes'}
          role={message.type === 'erreur' ? 'alert' : 'status'}>{message.texte}</p>
      )}

      {chargement ? <p className="admin-vide">Chargement…</p> : (
        <ul className="admin-liste">
          {frais.map((f) => (
            <li key={f.type} className="admin-montant">
              <div>
                <strong>{f.libelle}</strong>
                <span className="admin-vide"> Actuel : {formater(f.montant)} FCFA</span>
              </div>
              <div className="admin-champ">
                <label htmlFor={`m-${f.type}`} className="admin-sr">Montant de {f.libelle}</label>
                <input id={`m-${f.type}`} inputMode="numeric" value={saisies[f.type] ?? ''}
                  onChange={(e) => setSaisies({ ...saisies, [f.type]: e.target.value })}
                  aria-invalid={Boolean(erreurs[f.type])} />
                {erreurs[f.type] && <p className="message-erreur" role="alert">{erreurs[f.type]}</p>}
              </div>
              <button type="button" className="admin-btn" disabled={enCours === f.type} onClick={() => enregistrer(f)}>
                {enCours === f.type ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}