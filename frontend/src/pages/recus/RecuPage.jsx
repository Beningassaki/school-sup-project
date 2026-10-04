// =====================================================
// US9 : Recevoir un reçu avec code de vérification
// ROUTE : /mes-demandes/:id/recu  (étudiant connecté)
// API : GET /api/recus/:demandeId
// L'impression utilise le navigateur : "Imprimer" permet aussi
// d'enregistrer en PDF (choisir "Enregistrer au format PDF").
// =====================================================
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { LIBELLES_TYPE, formaterDate, formaterMontant } from '../../utils/format.js';
import './Recu.css';

export default function RecuPage() {
  const { id } = useParams(); // numéro du dossier, pris dans l'URL
  const [recu, setRecu] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get(`/recus/${id}`)
      .then(setRecu)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p>Chargement du reçu...</p>;

  // Dossier non validé, inexistant ou appartenant à un autre étudiant
  if (erreur) {
    return (
      <section className="recu">
        <p className="message-erreur">{erreur}</p>
        <Link className="btn btn--secondaire" to="/mes-demandes">
          Retour à mes demandes
        </Link>
      </section>
    );
  }

  const lienVerification = `${window.location.origin}/verification?code=${recu.code}`;

  return (
    <section className="recu">
      <article className="card recu__carte">
        <header>
          <p className="recu__marque">School-Sup · Université Marien Ngouabi</p>
          <h1>Reçu numérique</h1>
        </header>

        <dl className="recu__lignes">
          <dt>Référence</dt>
          <dd>{recu.reference}</dd>

          <dt>Démarche</dt>
          <dd>{LIBELLES_TYPE[recu.type] ?? recu.type}</dd>

          {/* La filière n'existe que pour une pré-inscription */}
          {recu.filiere && (
            <>
              <dt>Filière</dt>
              <dd>{recu.filiere}</dd>
            </>
          )}

          <dt>Étudiant</dt>
          <dd>
            {recu.etudiant.prenom} {recu.etudiant.nom}
          </dd>

          <dt>Montant payé</dt>
          <dd>{formaterMontant(recu.montant)}</dd>

          <dt>Dossier validé le</dt>
          <dd>{formaterDate(recu.valide_le)}</dd>
        </dl>

        <div className="recu__code">
          <span>Code de vérification</span>
          <strong>{recu.code}</strong>
        </div>

        <p className="recu__aide">
          Ce code prouve que votre demande est validée. Toute personne peut le contrôler sur :{' '}
          {lienVerification}
        </p>
      </article>

      {/* Ces boutons ne sont pas imprimés (classe no-print) */}
      <div className="recu__actions no-print">
        <button className="btn" type="button" onClick={() => window.print()}>
          Imprimer ou enregistrer en PDF
        </button>
        <Link className="btn btn--secondaire" to="/mes-demandes">
          Retour à mes demandes
        </Link>
      </div>
    </section>
  );
}