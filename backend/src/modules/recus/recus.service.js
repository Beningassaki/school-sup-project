// =====================================================
// SERVICE : reçus (US9) et vérification d'un document (US13)
// Règles appliquées ici :
//  - un reçu n'existe QUE pour un dossier "valide"
//  - un étudiant ne voit que ses propres reçus
//  - le code de vérification est unique et difficile à deviner
//  - un tiers qui vérifie un code ne voit que le prénom et l'initiale du nom
// =====================================================
const crypto = require('crypto');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

// Alphabet sans caractères ambigus : pas de 0/O ni de 1/I
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LONGUEUR_CODE = 6;
const MAX_ESSAIS = 5;
const FORMAT_CODE = /^SS-REC-[A-Z0-9]{6}$/;
const FORMAT_REFERENCE = /^SS-\d{4}-[A-F0-9]{20}$/;

// Fabrique un code aléatoire : SS-REC-7F3K9Q
// crypto.randomInt est imprévisible (contrairement à Math.random)
function genererCode() {
  let suffixe = '';
  for (let i = 0; i < LONGUEUR_CODE; i += 1) {
    suffixe += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return `SS-REC-${suffixe}`;
}

// ---------------------------------------------------------------
// FONCTION PARTAGÉE : appelée par Ulrich quand il valide un dossier (US8)
// Elle reçoit le "client" de SA transaction : le reçu est donc créé dans la
// même transaction que le changement de statut (tout ou rien).
// Exemple chez Ulrich, juste après avoir passé le statut à 'valide' :
//   const recu = await recusService.creerPourDemande(client, demandeId);
// ---------------------------------------------------------------
async function creerPourDemande(client, demandeId) {
  // Un seul reçu par dossier : s'il existe déjà, on le renvoie
  const existant = await client.query(
    'SELECT id, code, created_at FROM receipts WHERE request_id = $1',
    [demandeId],
  );
  if (existant.rows[0]) return existant.rows[0];

  // ON CONFLICT (code) DO NOTHING : si le code existe déjà, la transaction
  // n'est pas annulée et on retente avec un autre code
  for (let essai = 0; essai < MAX_ESSAIS; essai += 1) {
    const { rows } = await client.query(
      `INSERT INTO receipts (request_id, code)
       VALUES ($1, $2)
       ON CONFLICT (code) DO NOTHING
       RETURNING id, code, created_at`,
      [demandeId, genererCode()],
    );
    if (rows[0]) return rows[0];
  }
  throw new AppError('Impossible de générer le code du reçu', 500);
}

// Date de validation du dossier (sinon, date de création du reçu)
const DATE_VALIDATION = `COALESCE(
  (SELECT MAX(h.created_at) FROM status_history h
   WHERE h.request_id = r.id AND h.nouveau_statut = 'valide'),
  rc.created_at
)`;

// ---------- US9 : le reçu d'un dossier de l'étudiant connecté ----------
async function obtenirPourEtudiant(demandeId, studentId) {
  const { rows } = await pool.query(
    `SELECT r.reference, r.type, r.montant,
            f.filiere, u.nom, u.prenom, rc.code,
            ${DATE_VALIDATION} AS valide_le
     FROM requests r
     JOIN users u ON u.id = r.student_id
     JOIN receipts rc ON rc.request_id = r.id
     LEFT JOIN formations f ON f.id = r.formation_id
     WHERE r.id = $1 AND r.student_id = $2 AND r.statut = 'valide'`,
    [demandeId, studentId],
  );

  // Même message si le dossier n'existe pas, n'est pas validé ou appartient à
  // quelqu'un d'autre : on ne révèle rien
  if (!rows[0]) throw new AppError('Aucun reçu disponible pour ce dossier', 404);

  const r = rows[0];
  return {
    reference: r.reference,
    type: r.type,
    filiere: r.filiere,
    etudiant: { nom: r.nom, prenom: r.prenom },
    montant: r.montant,
    valide_le: r.valide_le,
    code: r.code,
  };
}

// ---------- US13 : vérification publique d'un code (sans connexion) ----------
async function verifierCode(codeSaisi) {
  const code = String(codeSaisi).trim().toUpperCase();

  // Format invalide = même réponse que "code inconnu"
  if (!FORMAT_CODE.test(code) && !FORMAT_REFERENCE.test(code)) {
    throw new AppError('Code inconnu', 404);
  }

  const { rows } = await pool.query(
    `SELECT r.reference, r.type, u.nom, u.prenom,
            ${DATE_VALIDATION} AS valide_le
     FROM receipts rc
     JOIN requests r ON r.id = rc.request_id
     JOIN users u ON u.id = r.student_id
     WHERE (rc.code = $1 OR r.reference = $1) AND r.statut = 'valide'`,
    [code],
  );
  if (!rows[0]) throw new AppError('Code inconnu', 404);

  const r = rows[0];
  return {
    authentique: true,
    reference: r.reference,
    type: r.type,
    valide_le: r.valide_le,
    // Protection des données personnelles : prénom + initiale du nom
    titulaire: `${r.prenom} ${r.nom.charAt(0).toUpperCase()}.`,
  };
}

module.exports = { creerPourDemande, obtenirPourEtudiant, verifierCode };
