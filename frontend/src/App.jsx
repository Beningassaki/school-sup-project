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
import NouvelleDemandePage from './pages/demandes/NouvelleDemandePage.jsx';

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

        {/* =====================================================
            PAGES PUBLIQUES
        ===================================================== */}

        <Route path="/" element={<Accueil />} />

        <Route
          path="/formations"
          element={<CataloguePage />}
        />

        <Route
          path="/connexion"
          element={<LoginPage />}
        />

        <Route
          path="/inscription"
          element={<RegisterPage />}
        />

        <Route
          path="/verification"
          element={<VerificationPage />}
        />


        {/* =====================================================
            ESPACE ÉTUDIANT
            Connexion obligatoire
        ===================================================== */}

        <Route element={<ProtectedRoute roles={['etudiant']} />}>

          {/* Nouvelle demande */}
          <Route
            path="/demandes/nouvelle"
            element={<NouvelleDemandePage />}
          />

          {/* Pré-inscription */}
          <Route
            path="/demandes/nouvelle/pre-inscription"
            element={<PreInscriptionPage />}
          />

          {/* Légalisation */}
          <Route
            path="/demandes/nouvelle/legalisation"
            element={<LegalisationPage />}
          />

          {/* Mes demandes */}
          <Route
            path="/mes-demandes"
            element={<MesDemandesPage />}
          />

          {/* Paiement */}
          <Route
            path="/mes-demandes/:id/paiement"
            element={<PaiementPage />}
          />

          {/* Historique */}
          <Route
            path="/mes-demandes/:id/historique"
            element={<HistoriquePage />}
          />

          {/* Reçu */}
          <Route
            path="/mes-demandes/:id/recu"
            element={<RecuPage />}
          />

        </Route>


        {/* =====================================================
            ESPACE AGENT
        ===================================================== */}

        <Route element={<ProtectedRoute roles={['agent']} />}>

          <Route
            path="/agent"
            element={<AgentDashboardPage />}
          />

          <Route
            path="/agent/dossiers"
            element={<DossiersPayesPage />}
          />

          <Route
            path="/agent/dossiers/:id"
            element={<DossierDetailPage />}
          />

          <Route
            path="/agent/complements"
            element={<ComplementsPage />}
          />

        </Route>


        {/* =====================================================
            ESPACE ADMIN
        ===================================================== */}

        <Route element={<ProtectedRoute roles={['admin']} />}>

          <Route
            path="/admin"
            element={<AdminPage />}
          />

        </Route>


        {/* =====================================================
            PAGE INTROUVABLE
        ===================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Route>

    </Routes>
  );
}