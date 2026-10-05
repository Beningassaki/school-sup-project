// =====================================================
// US15 : Paramétrer catalogue, pièces et montants (Should)
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /admin   (réservé au rôle admin)
// API : /api/admin/...
// =====================================================
import { useState } from 'react';
import FormationsAdmin from './FormationsAdmin.jsx';
import PiecesAdmin from './PiecesAdmin.jsx';
import MontantsAdmin from './MontantsAdmin.jsx';
import './AdminPage.css';

const ONGLETS = [
  { id: 'formations', libelle: 'Formations', Composant: FormationsAdmin },
  { id: 'pieces', libelle: 'Pièces demandées', Composant: PiecesAdmin },
  { id: 'montants', libelle: 'Frais et montants', Composant: MontantsAdmin },
];

export default function AdminPage() {
  const [actif, setActif] = useState('formations');
  const { Composant } = ONGLETS.find((o) => o.id === actif);

  return (
    <main className="admin-page">
      <header className="admin-entete">
        <h1>Administration</h1>
        <p>Gérez le catalogue, les pièces demandées et les frais.</p>
      </header>

      <div className="admin-onglets" role="tablist" aria-label="Sections d'administration">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            id={`onglet-${o.id}`}
            role="tab"
            aria-selected={o.id === actif}
            aria-controls="admin-panneau"
            className={o.id === actif ? 'actif' : ''}
            onClick={() => setActif(o.id)}
          >
            {o.libelle}
          </button>
        ))}
      </div>

      <section id="admin-panneau" role="tabpanel" aria-labelledby={`onglet-${actif}`} className="admin-carte">
        <Composant />
      </section>
    </main>
  );
}