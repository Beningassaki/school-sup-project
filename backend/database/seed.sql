-- =====================================================
-- School-Sup : données de test (FICTIVES uniquement)
-- Peut être relancé autant de fois que nécessaire :
-- il vide d'abord les tables, puis les remplit.
-- =====================================================

-- Vide toutes les tables et remet les numéros à 1
TRUNCATE receipts, status_history, payments, documents, requests, formations, users
  RESTART IDENTITY CASCADE;

-- ---------- Catalogue (US2) ----------
-- Numéros attribués automatiquement :
-- 1 Mathématiques, 2 Physique, 3 Chimie, 4 Biologie, 5 Géologie,
-- 6 Droit public, 7 Droit privé
INSERT INTO formations (faculte, filiere, niveau, conditions, frais) VALUES
('Faculté des Sciences et Techniques', 'Mathématiques', 'Licence', 'Baccalauréat série C ou D', 5000),
('Faculté des Sciences et Techniques', 'Physique', 'Licence', 'Baccalauréat série C ou D', 5000),
('Faculté des Sciences et Techniques', 'Chimie', 'Licence', 'Baccalauréat série C ou D', 5000),
('Faculté des Sciences et Techniques', 'Biologie', 'Licence', 'Baccalauréat série C ou D', 5000),
('Faculté des Sciences et Techniques', 'Géologie', 'Licence', 'Baccalauréat série C ou D', 5000),
('Faculté de Droit', 'Droit public', 'Licence', 'Baccalauréat toutes séries', 7500),
('Faculté de Droit', 'Droit privé', 'Licence', 'Baccalauréat toutes séries', 7500);

-- ---------- Comptes de test ----------
-- Mot de passe de TOUS les comptes de test : Test1234!
INSERT INTO users (nom, prenom, email, telephone, password_hash, role) VALUES
('Dupont', 'Jean', 'etudiant@test.local', '060000001', '$2b$10$RjOZf22Q3mvvHK7xWPI6DOI9vK9.YcwISwx25kmYte113zQ/EuBiy', 'etudiant'),
('Agent', 'Dupont', 'agent@test.local', '060000002', '$2b$10$RjOZf22Q3mvvHK7xWPI6DOI9vK9.YcwISwx25kmYte113zQ/EuBiy', 'agent'),
('Admin', 'School-Sup', 'admin@test.local', '060000003', '$2b$10$RjOZf22Q3mvvHK7xWPI6DOI9vK9.YcwISwx25kmYte113zQ/EuBiy', 'admin'),
('Mavoungou', 'Nadia', 'nadia@test.local', '060000004', '$2b$10$RjOZf22Q3mvvHK7xWPI6DOI9vK9.YcwISwx25kmYte113zQ/EuBiy', 'etudiant');

-- ---------- Demandes (dans différents statuts) ----------
-- formation_id : 1 Mathématiques, 2 Physique, 6 Droit public
INSERT INTO requests (reference, type, statut, motif, student_id, formation_id, montant) VALUES
('SS-2306-000245', 'pre_inscription', 'paye', NULL, 1, 1, 5000),
('SS-2306-000246', 'legalisation', 'en_attente_paiement', NULL, 1, NULL, 2000),
('SS-2306-000247', 'pre_inscription', 'en_attente_complement', 'Pièce d''identité illisible', 4, 6, 7500),
('SS-2306-000248', 'pre_inscription', 'valide', NULL, 4, 2, 5000),
('SS-2306-000249', 'legalisation', 'refuse', 'Attestation non conforme', 1, NULL, 2000),
('PRE-2026-0087', 'pre_inscription', 'brouillon', NULL, 4, 1, 5000);

-- ---------- Pièces jointes ----------
INSERT INTO documents (request_id, type_piece, nom_fichier, chemin, statut) VALUES
(1, 'Pièce d''identité', 'cni_jean_dupont.pdf', 'uploads/test/cni_jean.pdf', 'a_verifier'),
(1, 'Diplôme du baccalauréat', 'bac_jean_dupont.pdf', 'uploads/test/bac_jean.pdf', 'valide'),
(1, 'Relevé de notes', 'notes_jean_dupont.pdf', 'uploads/test/notes_jean.pdf', 'valide'),
(3, 'Pièce d''identité', 'identite_nadia.jpg', 'uploads/test/identite_nadia.jpg', 'illisible'),
(3, 'Diplôme du baccalauréat', 'bac_nadia.pdf', 'uploads/test/bac_nadia.pdf', 'valide');

-- ---------- Paiements ----------
INSERT INTO payments (request_id, montant, operateur, telephone, statut, transaction_ref) VALUES
(1, 5000, 'MTN', '060000001', 'confirme', 'TEST-0001'),
(3, 7500, 'Airtel', '060000004', 'confirme', 'TEST-0002'),
(4, 5000, 'MTN', '060000004', 'confirme', 'TEST-0003');

-- ---------- Historique des statuts (US16) ----------
INSERT INTO status_history (request_id, ancien_statut, nouveau_statut, motif, agent_id) VALUES
(1, NULL, 'en_attente_paiement', NULL, NULL),
(1, 'en_attente_paiement', 'paye', NULL, NULL),
(3, 'paye', 'en_attente_complement', 'Pièce d''identité illisible', 2),
(4, 'paye', 'valide', NULL, 2),
(5, 'paye', 'refuse', 'Attestation non conforme', 2);

-- ---------- Reçu du dossier validé (US9) ----------
INSERT INTO receipts (request_id, code) VALUES
(4, 'SS-REC-7F3K9Q');