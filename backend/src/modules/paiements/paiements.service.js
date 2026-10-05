const crypto = require('crypto');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

async function obtenirContexte(demandeId, studentId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.reference, r.type, r.statut, r.montant, f.filiere AS formation
     FROM requests r
     LEFT JOIN formations f ON f.id = r.formation_id
     WHERE r.id = $1 AND r.student_id = $2`,
    [demandeId, studentId],
  );

  if (!rows[0]) throw new AppError('Demande introuvable', 404);
  return { ...rows[0], payable: rows[0].statut === 'en_attente_paiement' };
}

async function simulerPaiement({ demandeId, operateur, telephone, simulation }, studentId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const demandeResult = await client.query(
      `SELECT id, reference, statut, montant
       FROM requests
       WHERE id = $1 AND student_id = $2
       FOR UPDATE`,
      [demandeId, studentId],
    );
    const demande = demandeResult.rows[0];

    if (!demande) throw new AppError('Demande introuvable', 404);
    if (demande.statut !== 'en_attente_paiement') {
      throw new AppError('Cette demande ne peut pas être payée dans son état actuel', 409);
    }

    const statutPaiement = simulation;
    const transactionRef = `SS-PAY-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const paiementResult = await client.query(
      `INSERT INTO payments (request_id, montant, operateur, telephone, statut, transaction_ref)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, statut, transaction_ref, created_at`,
      [demande.id, demande.montant, operateur, telephone, statutPaiement, transactionRef],
    );

    if (statutPaiement === 'confirme') {
      await client.query("UPDATE requests SET statut = 'paye', updated_at = NOW() WHERE id = $1", [
        demande.id,
      ]);
      await client.query(
        `INSERT INTO status_history (request_id, ancien_statut, nouveau_statut)
         VALUES ($1, 'en_attente_paiement', 'paye')`,
        [demande.id],
      );
    }

    await client.query('COMMIT');
    return {
      demandeId: demande.id,
      reference: demande.reference,
      montant: demande.montant,
      paiement: paiementResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { obtenirContexte, simulerPaiement };