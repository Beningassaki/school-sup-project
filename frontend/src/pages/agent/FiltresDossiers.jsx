// =====================================================
// US11 : Filtrer les dossiers par type et statut (Should)
// RESPONSABLE : Todd Gusman Hashall OKANA
// COMPOSANT réutilisable : Ulrich l'intègre dans DossiersPayesPage.jsx
// CONTRAT avec Ulrich : ce composant reçoit onChange(filtres) et renvoie
//   { type: 'legalisation' | 'pre_inscription' | '', statut: '...' | '', recherche: '' }
// API : GET /api/agent/dossiers?type=...&statut=...
// =====================================================
export default function FiltresDossiers({ onChange }) {
  // ⬇️ ZONE DE TRAVAIL DE TODD : remplace ce bloc par les vrais filtres
  return (
    <div className="card">
      <p>🚧 US11 · Filtres (Todd) : liste déroulante type, liste déroulante statut, recherche.</p>
      <button
        className="btn btn--secondaire"
        onClick={() => onChange?.({ type: '', statut: '', recherche: '' })}
      >
        Réinitialiser
      </button>
    </div>
  );
}