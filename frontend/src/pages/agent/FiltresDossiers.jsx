// =====================================================
// US11 : Filtrer les dossiers par type et statut (Should)
// RESPONSABLE : Todd Gusman Hashall OKANA
// COMPOSANT réutilisable : Ulrich l'intègre dans DossiersPayesPage.jsx
// CONTRAT avec Ulrich : ce composant reçoit onChange(filtres) et renvoie
//   { type: 'legalisation' | 'pre_inscription' | '', statut: '...' | '', recherche: '' }
// API : GET /api/agent/dossiers?type=...&statut=...
// =====================================================
import { useEffect, useRef, useState } from 'react';
import './FiltresDossiers.css';

const VIDE = { type: '', statut: '', recherche: '' };

const TYPES = [
  { valeur: 'legalisation', libelle: 'Légalisation' },
  { valeur: 'pre_inscription', libelle: 'Pré-inscription' },
];

// ⚠️ À confirmer avec Ulrich et le backend : valeurs exactes des statuts
const STATUTS = [
  { valeur: 'paye', libelle: 'Payé' },
  { valeur: 'en_attente_complement', libelle: 'Complément demandé' },
  { valeur: 'valide', libelle: 'Validé' },
  { valeur: 'refuse', libelle: 'Refusé' },
];

export default function FiltresDossiers({ onChange }) {
  const [filtres, setFiltres] = useState(VIDE);
  const dernierEnvoi = useRef(JSON.stringify(VIDE));
  const surChangement = useRef(onChange);

  useEffect(() => {
    surChangement.current = onChange;
  }, [onChange]);

  // Prévient le parent 300 ms après le dernier changement (évite un appel API à chaque lettre)
  useEffect(() => {
    const cle = JSON.stringify(filtres);
    if (cle === dernierEnvoi.current) return;
    const minuteur = setTimeout(() => {
      dernierEnvoi.current = cle;
      surChangement.current?.(filtres);
    }, 300);
    return () => clearTimeout(minuteur);
  }, [filtres]);

  const maj = (champ) => (e) => setFiltres({ ...filtres, [champ]: e.target.value });
  const actif = Object.values(filtres).some(Boolean);

  return (
    <form className="filtres" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="filtres-grille">
        <div className="filtres-champ">
          <label htmlFor="f-recherche">Recherche</label>
          <input id="f-recherche" type="search" placeholder="Nom ou numéro de dossier"
            value={filtres.recherche} onChange={maj('recherche')} />
        </div>

        <div className="filtres-champ">
          <label htmlFor="f-type">Type de demande</label>
          <select id="f-type" value={filtres.type} onChange={maj('type')}>
            <option value="">Tous</option>
            {TYPES.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
          </select>
        </div>

        <div className="filtres-champ">
          <label htmlFor="f-statut">Statut</label>
          <select id="f-statut" value={filtres.statut} onChange={maj('statut')}>
            <option value="">Tous</option>
            {STATUTS.map((s) => <option key={s.valeur} value={s.valeur}>{s.libelle}</option>)}
          </select>
        </div>
      </div>

      {actif && (
        <div className="filtres-pied">
          <button type="button" className="filtres-reset" onClick={() => setFiltres(VIDE)}>
            Réinitialiser
          </button>
        </div>
      )}
    </form>
  );
}
