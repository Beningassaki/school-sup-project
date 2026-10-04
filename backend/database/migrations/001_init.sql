-- =====================================================
-- School-Sup : migration 001 (création des tables)
-- Ne JAMAIS modifier ce fichier une fois poussé sur GitHub.
-- Pour changer la base, créer 002_nom.sql, 003_nom.sql...
-- =====================================================

-- ---------- TYPES (listes de valeurs autorisées) ----------

-- Les 3 rôles de l'application
CREATE TYPE user_role AS ENUM ('etudiant', 'agent', 'admin');

-- Les 2 types de demandes du MVP
CREATE TYPE request_type AS ENUM ('legalisation', 'pre_inscription');

-- Les étapes de vie d'un dossier
CREATE TYPE request_status AS ENUM (
  'brouillon',              -- l'étudiant n'a pas fini sa demande
  'en_attente_paiement',    -- demande déposée, paiement à faire
  'paye',                   -- paiement confirmé : visible par l'agent
  'en_attente_complement',  -- l'agent a demandé une pièce en plus
  'valide',                 -- dossier accepté (plus modifiable)
  'refuse'                  -- dossier refusé avec motif (plus modifiable)
);

-- Le statut d'une pièce jointe
CREATE TYPE document_status AS ENUM ('a_verifier', 'valide', 'illisible', 'manquant');

-- Le statut d'un paiement Mobile Money
CREATE TYPE payment_status AS ENUM ('en_cours', 'confirme', 'echoue');

-- ---------- TABLE users : tous les comptes ----------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,                  -- numéro automatique
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,        -- un email = un seul compte
  telephone     VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,               -- mot de passe HACHÉ (jamais en clair)
  role          user_role NOT NULL DEFAULT 'etudiant',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- TABLE formations : le catalogue (US2) ----------
CREATE TABLE formations (
  id          SERIAL PRIMARY KEY,
  faculte     VARCHAR(150) NOT NULL,
  filiere     VARCHAR(150) NOT NULL,
  niveau      VARCHAR(50),
  conditions  TEXT,                                  -- conditions d'accès
  frais       INTEGER NOT NULL DEFAULT 0,            -- en FCFA
  actif       BOOLEAN NOT NULL DEFAULT TRUE          -- FALSE = cachée du catalogue
);

-- ---------- TABLE requests : les demandes / dossiers ----------
CREATE TABLE requests (
  id            SERIAL PRIMARY KEY,
  reference     VARCHAR(30) NOT NULL UNIQUE,         -- ex : SS-2306-000245
  type          request_type NOT NULL,
  statut        request_status NOT NULL DEFAULT 'brouillon',
  motif         TEXT,                                -- motif de refus ou de complément
  student_id    INTEGER NOT NULL REFERENCES users(id),
  formation_id  INTEGER REFERENCES formations(id),   -- vide pour une légalisation
  montant       INTEGER NOT NULL DEFAULT 0,          -- en FCFA
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- TABLE documents : les pièces jointes d'une demande ----------
CREATE TABLE documents (
  id            SERIAL PRIMARY KEY,
  request_id    INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  type_piece    VARCHAR(100) NOT NULL,               -- ex : Pièce d'identité
  nom_fichier   VARCHAR(255) NOT NULL,
  chemin        VARCHAR(500) NOT NULL,               -- emplacement du fichier sur le serveur
  statut        document_status NOT NULL DEFAULT 'a_verifier',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- TABLE payments : les paiements Mobile Money ----------
CREATE TABLE payments (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES requests(id),
  montant         INTEGER NOT NULL,
  operateur       VARCHAR(30) NOT NULL,              -- ex : MTN, Airtel
  telephone       VARCHAR(20) NOT NULL,
  statut          payment_status NOT NULL DEFAULT 'en_cours',
  transaction_ref VARCHAR(60),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- TABLE status_history : historique horodaté (US16) ----------
CREATE TABLE status_history (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  ancien_statut   request_status,                    -- vide à la création du dossier
  nouveau_statut  request_status NOT NULL,
  motif           TEXT,
  agent_id        INTEGER REFERENCES users(id),      -- qui a fait le changement
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- TABLE receipts : reçus avec code unique (US9, US13) ----------
CREATE TABLE receipts (
  id          SERIAL PRIMARY KEY,
  request_id  INTEGER NOT NULL UNIQUE REFERENCES requests(id),  -- 1 reçu par dossier
  code        VARCHAR(30) NOT NULL UNIQUE,           -- code de vérification unique
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------- INDEX : accélèrent les recherches fréquentes ----------
CREATE INDEX idx_requests_student ON requests(student_id);
CREATE INDEX idx_requests_statut ON requests(statut);
CREATE INDEX idx_documents_request ON documents(request_id);
CREATE INDEX idx_history_request ON status_history(request_id);