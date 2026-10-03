// =====================================================
// US2 : Consulter le catalogue des formations
// RESPONSABLE : Dreche NDONGALA
// ROUTE : /formations   (publique)
// API : GET /api/formations   (déjà fonctionnelle côté backend)
// ✅ CETTE PAGE EST UN EXEMPLE COMPLET fourni par Alty : elle montre comment
//    appeler l'API, gérer le chargement et les erreurs. Dreche l'améliore
//    (design, regroupement par faculté, recherche, détail d'une formation).
// =====================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export default function CataloguePage() {
  const [formations, setFormations] = useState([]); // les données reçues
  const [chargement, setChargement] = useState(true); // true pendant l'appel
  const [erreur, setErreur] = useState('');

  // S'exécute une seule fois, à l'ouverture de la page
  useEffect(() => {
    api
      .get('/formations')
      .then(setFormations)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <p>Chargement des formations...</p>;
  if (erreur) return <p className="message-erreur">{erreur}</p>;

  return (
    <section>
      <h1>Catalogue des formations</h1>
      <div className="grille">
        {formations.map((f) => (
          <article className="card" key={f.id}>
            <h2>{f.filiere}</h2>
            <p>{f.faculte} · {f.niveau}</p>
            <p>{f.conditions}</p>
            <p><strong>Frais : {f.frais} FCFA</strong></p>
            <Link className="btn" to="/demandes/nouvelle/pre-inscription">Me pré-inscrire</Link>
          </article>
        ))}
      </div>
    </section>
  );
}