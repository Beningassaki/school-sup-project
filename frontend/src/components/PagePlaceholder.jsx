// CADRE "PAGE À CONSTRUIRE" : affiche le responsable et la liste des tâches.
// Chaque dev REMPLACE ce composant par sa vraie page.
// Propriétaire : ALTY
export default function PagePlaceholder({ titre, us, responsable, routeApi, taches = [] }) {
  return (
    <section className="placeholder">
      <p className="placeholder__us">
        {us} · Responsable : {responsable}
      </p>
      <h1>{titre}</h1>
      <p>🚧 Page à construire.</p>
      {routeApi && (
        <p>
          API : <code>{routeApi}</code>
        </p>
      )}
      <ul>
        {taches.map((tache) => (
          <li key={tache}>{tache}</li>
        ))}
      </ul>
    </section>
  );
}