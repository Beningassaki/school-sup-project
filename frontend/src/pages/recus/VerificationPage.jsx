// =====================================================
// US13 : Vérifier un document via son code (page PUBLIQUE)
// ROUTE : /verification  (accepte aussi /verification?code=SS-REC-XXXXXX)
// API : GET /api/recus/verification/:code
// =====================================================
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { LIBELLES_TYPE, formaterDate } from '../../utils/format.js';
import './Recu.css';

export default function VerificationPage() {
  const [params] = useSearchParams();
  const codeDansUrl = params.get('code') || '';

  const [code, setCode] = useState(codeDansUrl);
  const [resultat, setResultat] = useState(null); // réponse de l'API si le code est valide
  const [erreur, setErreur] = useState('');
  const [occupe, setOccupe] = useState(false);

  async function verifier(valeur) {
    setErreur('');
    setResultat(null);
    setOccupe(true);
    try {
      const code = encodeURIComponent(valeur.trim().toUpperCase());
      setResultat(await api.get(`/recus/verification/${code}`));
    } catch (e) {
      // 404 = code inconnu ; autre erreur (ex : trop de tentatives) = message du serveur
      setErreur(
        e.status === 404
          ? "Code inconnu : ce document n'a pas été délivré par School-Sup, ou le code est erroné."
          : e.message,
      );
    } finally {
      setOccupe(false);
    }
  }

  // Si le code est dans l'adresse (lien du reçu), on vérifie tout de suite
  useEffect(() => {
    if (codeDansUrl) verifier(codeDansUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeDansUrl]);

  function soumettre(evenement) {
    evenement.preventDefault();
    if (!code.trim()) {
      setErreur('Saisissez le code de vérification');
      setResultat(null);
      return;
    }
    verifier(code);
  }

  return (
    <section className="card verif">
      <h1>Vérifier un document</h1>
      <p>
        Saisissez le code de vérification du reçu (SS-REC-XXXXXX) ou la référence
        affichée dans « Mes demandes » (SS-AAAA-...).
      </p>

      <form onSubmit={soumettre}>
        <div className="champ">
          <label htmlFor="code">Code de vérification</label>
          <input
            id="code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setErreur(''); // l'erreur disparaît dès que l'utilisateur modifie le champ
            }}
            placeholder="Code du reçu ou référence de demande"
            autoComplete="off"
          />
        </div>
        <button className="btn" type="submit" disabled={occupe}>
          {occupe ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>

      {erreur && <p className="message-erreur">{erreur}</p>}

      {resultat && (
        <div className="verif__ok">
          <h2>Document authentique</h2>
          <dl className="recu__lignes">
            <dt>Référence</dt>
            <dd>{resultat.reference}</dd>
            <dt>Démarche</dt>
            <dd>{LIBELLES_TYPE[resultat.type] ?? resultat.type}</dd>
            <dt>Titulaire</dt>
            <dd>{resultat.titulaire}</dd>
            <dt>Validé le</dt>
            <dd>{formaterDate(resultat.valide_le)}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
