// =====================================================
// SERVICE : historique d'un dossier (US16)
// Règle : un étudiant ne consulte que l'historique de SES dossiers
// =====================================================
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

async function obtenir(demandeId, studentId) {
  // 1. Le dossier doit appartenir à cet étudiant
  const dossier = await pool.query(
    'SELECT reference, statut FROM requests WHERE id = $1 AND student_id = $2',
    [demandeId, studentId],
  );
  if (!dossier.rows[0]) throw new AppError('Demande introuvable', 404);

  // 2. Les changements de statut, du plus ancien au plus récent.
  // On ne renvoie PAS agent_id : l'étudiant ne voit pas quel agent a traité son dossier.
  const { rows } = await pool.query(
    `SELECT ancien_statut, nouveau_statut, motif, created_at
     FROM status_history
     WHERE request_id = $1
     ORDER BY created_at, id`,
    [demandeId],
  );

  return {
    reference: dossier.rows[0].reference,
    statut: dossier.rows[0].statut,
    historique: rows,
  };
}

module.exports = { obtenir };