// MENU LATÉRAL de l'espace agent (comme sur la maquette)
import { Link, useLocation } from 'react-router-dom';

const LIENS = [
  { vers: '/agent', libelle: 'Tableau de bord' },
  { vers: '/agent/dossiers', libelle: 'Dossiers payés' },
  { vers: '/agent/complements', libelle: 'En attente de complément' },
  { vers: '/agent/dossiers?statut=valide', libelle: 'Dossiers validés' },
  { vers: '/agent/dossiers?statut=refuse', libelle: 'Dossiers refusés' },
];

export default function AgentMenu() {
  const { pathname, search } = useLocation();
  const courant = pathname + search;

  return (
    <nav className="agent-menu">
      {LIENS.map((lien) => (
        <Link key={lien.vers} to={lien.vers} className={courant === lien.vers ? 'actif' : ''}>
          {lien.libelle}
        </Link>
      ))}
    </nav>
  );
}
