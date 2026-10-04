// =====================================================
// US15 : Paramétrer catalogue, pièces et montants (Should)
// RESPONSABLE : Todd Gusman Hashall OKANA
// ROUTE : /admin   (réservé au rôle admin)
// API : /api/admin/...  (backend : module admin, Todd)
// =====================================================
import PagePlaceholder from '../../components/PagePlaceholder.jsx';

export default function AdminPage() {
  // ⬇️ ZONE DE TRAVAIL DE TODD
  return (
    <PagePlaceholder
      titre="Administration"
      us="US15"
      responsable="Todd Gusman Hashall OKANA"
      routeApi="/api/admin/..."
      taches={[
        "Gérer les formations (ajouter, modifier, masquer)",
        "Gérer les pièces demandées par type de demande",
        "Gérer les frais et montants",
      ]}
    />
  );
}