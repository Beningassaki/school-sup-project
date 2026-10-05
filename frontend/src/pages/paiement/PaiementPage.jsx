import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import './PaiementPage.css';

export default function PaiementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [operateur, setOperateur] = useState('MTN');
  const [telephone, setTelephone] = useState('');
  const [simulation, setSimulation] = useState('confirme');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let actif = true;
    api
      .get(`/paiements/demandes/${id}`)
      .then((data) => {
        if (actif) setDemande(data);
      })
      .catch((error) => {
        if (actif) setErreur(error.message);
      })
      .finally(() => {
        if (actif) setChargement(false);
      });

    return () => {
      actif = false;
    };
  }, [id]);

  useEffect(() => {
    if (resultat?.paiement.statut !== 'confirme') return undefined;
    const timeout = window.setTimeout(() => navigate('/mes-demandes'), 2000);
    return () => window.clearTimeout(timeout);
  }, [resultat, navigate]);

  async function soumettre(event) {
    event.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const data = await api.post('/paiements', {
        demandeId: Number(id),
        operateur,
        telephone,
        simulation,
      });
      setResultat(data);
    } catch (error) {
      setErreur(error.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <main className="paiement-page"><p role="status">Chargement de la demande…</p></main>;
  if (erreur && !demande) {
    return (
      <main className="paiement-page">
        <p className="paiement-message paiement-message--erreur" role="alert">{erreur}</p>
        <Link className="paiement-retour" to="/mes-demandes">Retour à mes demandes</Link>
      </main>
    );
  }

  const paiementConfirme = resultat?.paiement.statut === 'confirme';

  return (
    <main className="paiement-page">
      <Link className="paiement-retour" to="/mes-demandes">← Mes demandes</Link>
      <header className="paiement-entete">
        <p className="paiement-surtitre">PAIEMENT MOBILE MONEY</p>
        <h1>{resultat ? (paiementConfirme ? 'Paiement confirmé' : 'Paiement échoué') : 'Régler ma demande'}</h1>
        <p>Demande {demande.reference}</p>
      </header>

      <section className="paiement-recap" aria-label="Récapitulatif de la demande">
        <div><span>Démarche</span><strong>{demande.type === 'legalisation' ? 'Légalisation' : 'Pré-inscription'}</strong></div>
        {demande.formation && <div><span>Formation</span><strong>{demande.formation}</strong></div>}
        <div className="paiement-total"><span>Montant à régler</span><strong>{Number(demande.montant).toLocaleString('fr-FR')} FCFA</strong></div>
      </section>

      {resultat ? (
        <section className={`paiement-resultat ${paiementConfirme ? 'paiement-resultat--succes' : 'paiement-resultat--echec'}`} aria-live="polite">
          <h2>{paiementConfirme ? 'Votre paiement est confirmé.' : 'Le paiement n’a pas abouti.'}</h2>
          <p>{paiementConfirme ? 'Votre demande est maintenant transmise au service de scolarité. Redirection vers vos demandes…' : 'Votre demande reste en attente de paiement. Vous pouvez réessayer.'}</p>
          <p className="paiement-reference">Référence de transaction : {resultat.paiement.transaction_ref}</p>
          <div className="paiement-actions">
            {paiementConfirme ? (
              <button className="paiement-bouton" onClick={() => navigate('/mes-demandes')}>Retour à mes demandes</button>
            ) : (
              <button className="paiement-bouton" onClick={() => setResultat(null)}>Réessayer</button>
            )}
          </div>
        </section>
      ) : demande.payable ? (
        <form className="paiement-formulaire" onSubmit={soumettre}>
          <fieldset className="paiement-operateurs">
            <legend>Opérateur</legend>
            {['MTN', 'Airtel'].map((nom) => (
              <label className={operateur === nom ? 'paiement-operateur paiement-operateur--actif' : 'paiement-operateur'} key={nom}>
                <input type="radio" name="operateur" value={nom} checked={operateur === nom} onChange={() => setOperateur(nom)} />
                <span>{nom}</span>
              </label>
            ))}
          </fieldset>

          <label className="paiement-champ" htmlFor="telephone-mobile-money">
            Numéro Mobile Money
            <input id="telephone-mobile-money" type="tel" autoComplete="tel" inputMode="tel" value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="06 123 45 67" required minLength={8} maxLength={20} />
          </label>

          <fieldset className="paiement-simulation">
            <legend>Résultat</legend>
            <label><input type="radio" name="simulation" value="confirme" checked={simulation === 'confirme'} onChange={() => setSimulation('confirme')} /> Succès</label>
            <label><input type="radio" name="simulation" value="echoue" checked={simulation === 'echoue'} onChange={() => setSimulation('echoue')} /> Échec</label>
          </fieldset>

          {erreur && <p className="paiement-message paiement-message--erreur" role="alert">{erreur}</p>}
          <p className="paiement-note">Mode démonstration : aucun débit réel ne sera effectué.</p>
          <button className="paiement-bouton" type="submit" disabled={envoi}>
            {envoi ? 'Traitement…' : `Simuler le paiement de ${Number(demande.montant).toLocaleString('fr-FR')} FCFA`}
          </button>
        </form>
      ) : (
        <section className="paiement-resultat">
          <h2>Cette demande n’attend pas de paiement.</h2>
          <p>Statut actuel : {demande.statut.replaceAll('_', ' ')}</p>
          <Link className="paiement-bouton paiement-bouton--lien" to="/mes-demandes">Retour à mes demandes</Link>
        </section>
      )}
    </main>
  );
}