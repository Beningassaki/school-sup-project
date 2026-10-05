// =====================================================
// TOUTES LES ROUTES DU SITE : propriétaire ALTY
// ⚠️ Personne ne modifie ce fichier sans prévenir Alty.
// Chaque dev travaille uniquement dans SES fichiers de pages.
// =====================================================
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Accueil from './pages/Accueil.jsx';
import NotFound from './pages/NotFound.jsx';

// Todd : US1, US15
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import AdminPage from './pages/admin/AdminPage.jsx';
// Dreche : US2, US4
import CataloguePage from './pages/catalogue/CataloguePage.jsx';
import PreInscriptionPage from './pages/demandes/PreInscriptionPage.jsx';
// Beni : US3, US6
import LegalisationPage from './pages/demandes/LegalisationPage.jsx';
import MesDemandesPage from './pages/suivi/MesDemandesPage.jsx';
// Dubien : US5
import PaiementPage from './pages/paiement/PaiementPage.jsx';
// Ulrich : US7, US8, US14
import AgentDashboardPage from './pages/agent/AgentDashboardPage.jsx';
import DossiersPayesPage from './pages/agent/DossiersPayesPage.jsx';
import DossierDetailPage from './pages/agent/DossierDetailPage.jsx';
import ComplementsPage from './pages/agent/ComplementsPage.jsx';
// Alty : US9, US13, US16
import RecuPage from './pages/recus/RecuPage.jsx';
import VerificationPage from './pages/recus/VerificationPage.jsx';
import HistoriquePage from './pages/suivi/HistoriquePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ===== PAGES PUBLIQUES ===== */}
        <Route path="/" element={<Accueil />} />
        <Route path="/formations" element={<CataloguePage />} /> {/* US2 · Dreche */}
        <Route path="/connexion" element={<LoginPage />} /> {/* US1 · Todd */}
        <Route path="/inscription" element={<RegisterPage />} /> {/* US1 · Todd */}
        <Route path="/verification" element={<VerificationPage />} /> {/* US13 · Alty */}

        {/* ===== ESPACE ÉTUDIANT (connexion obligatoire) ===== */}
        <Route element={<ProtectedRoute roles={['etudiant']} />}>
          <Route path="/demandes/nouvelle/legalisation" element={<LegalisationPage />} /> {/* US3 · Beni */}
          <Route path="/demandes/nouvelle/pre-inscription" element={<PreInscriptionPage />} /> {/* US4 · Dreche */}
          <Route path="/mes-demandes" element={<MesDemandesPage />} /> {/* US6 · Beni */}
          <Route path="/mes-demandes/:id/paiement" element={<PaiementPage />} /> {/* US5 · Dubien */}
          <Route path="/mes-demandes/:id/historique" element={<HistoriquePage />} /> {/* US16 · Alty */}
          <Route path="/mes-demandes/:id/recu" element={<RecuPage />} /> {/* US9 · Alty */}
        </Route>
 
 <Route path="/connexion" element={<LoginPage />} />

        {/* ===== ESPACE AGENT ===== */}
        <Route element={<ProtectedRoute roles={['agent']} />}>
          <Route path="/agent" element={<AgentDashboardPage />} /> {/* US7 · Ulrich */}
          <Route path="/agent/dossiers" element={<DossiersPayesPage />} /> {/* US7 · Ulrich (+ filtre US11 · Todd) */}
          <Route path="/agent/dossiers/:id" element={<DossierDetailPage />} /> {/* US7, US8 · Ulrich */}
          <Route path="/agent/complements" element={<ComplementsPage />} /> {/* US14 · Ulrich */}
        </Route>

        {/* ===== ESPACE ADMIN ===== */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} /> {/* US15 · Todd */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}