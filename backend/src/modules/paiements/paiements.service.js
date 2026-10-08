const crypto = require('crypto');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

async function obtenirContexte(demandeId, userId) {
  const { rows } = await pool.query(
    `SELECT id, reference, type, objet, statut, montant, informations, created_at
     FROM requests
     WHERE id = $1 AND student_id = $2`,
    [demandeId, userId],
  );
  const demande = rows[0];
  if (!demande) throw new AppError('Demande introuvable', 404);

  return {
    ...demande,
    demandeId: demande.id,
    payable: ['brouillon', 'en_attente_paiement'].includes(demande.statut),
  };
}

async function simulerPaiement({ demandeId, operateur, telephone, simulation }, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, statut, montant
       FROM requests
       WHERE id = $1 AND student_id = $2
       FOR UPDATE`,
      [demandeId, userId],
    );
    const demande = rows[0];
    if (!demande) throw new AppError('Demande introuvable', 404);
    if (!['brouillon', 'en_attente_paiement'].includes(demande.statut)) {
      throw new AppError('Cette demande ne peut pas être payée dans son état actuel', 409);
    }
    if (!Number.isInteger(demande.montant) || demande.montant <= 0) {
      throw new AppError('Le montant de la demande est invalide', 400);
    }

    await client.query(
      `UPDATE requests
       SET statut = 'en_attente_paiement', updated_at = NOW()
       WHERE id = $1`,
      [demande.id],
    );

    const transactionRef = `SS-PAY-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const paiement = await client.query(
      `INSERT INTO payments
        (request_id, montant, operateur, telephone, statut, transaction_ref)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, statut, transaction_ref, created_at`,
      [demande.id, demande.montant, operateur, telephone, simulation, transactionRef],
    );

    if (simulation === 'confirme') {
      await client.query(
        `UPDATE requests SET statut = 'paye', updated_at = NOW() WHERE id = $1`,
        [demande.id],
      );
    }

    await client.query('COMMIT');
    return { demandeId: demande.id, montant: demande.montant, paiement: paiement.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { obtenirContexte, simulerPaiement };
