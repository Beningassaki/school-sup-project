const crypto = require('crypto');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

/**
 * Récupérer le contexte d'une demande avant paiement
 */
async function obtenirContexte(demandeId, userId) {
  const { rows } = await pool.query(
    `
    SELECT
      d.id,
      d.type,
      d.objet,
      d.statut,
      d.informations,
      d.created_at
    FROM demandes d
    WHERE d.id = $1
      AND d.user_id = $2
    `,
    [demandeId, userId],
  );

  const demande = rows[0];

  if (!demande) {
    throw new AppError('Demande introuvable', 404);
  }

  const informations = demande.informations || {};

  const montant =
    Number(informations.montantTotal) ||
    Number(informations.montant) ||
    Number(informations.frais) ||
    0;

  return {
    id: demande.id,
    demandeId: demande.id,
    type: demande.type,
    objet: demande.objet,
    statut: demande.statut,
    montant,
    informations,
    payable:
      demande.statut === 'en_attente_paiement' ||
      demande.statut === 'BROUILLON',
  };
}

/**
 * Simuler un paiement
 */
async function simulerPaiement(
  { demandeId, operateur, telephone, simulation },
  userId,
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Récupération de la demande
    const demandeResult = await client.query(
      `
      SELECT
        id,
        type,
        objet,
        statut,
        informations
      FROM demandes
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE
      `,
      [demandeId, userId],
    );

    const demande = demandeResult.rows[0];

    if (!demande) {
      throw new AppError('Demande introuvable', 404);
    }

    // Informations financières stockées dans JSONB
    const informations = demande.informations || {};

    const montant =
      Number(informations.montantTotal) ||
      Number(informations.montant) ||
      Number(informations.frais) ||
      0;

    if (montant <= 0) {
      throw new AppError(
        'Le montant de la demande est invalide ou non défini',
        400,
      );
    }

    // Une demande BROUILLON passe à l'état d'attente de paiement
    if (demande.statut === 'BROUILLON') {
      await client.query(
        `
        UPDATE demandes
        SET statut = 'en_attente_paiement',
            updated_at = NOW()
        WHERE id = $1
        `,
        [demande.id],
      );
    } else if (demande.statut !== 'en_attente_paiement') {
      throw new AppError(
        'Cette demande ne peut pas être payée dans son état actuel',
        409,
      );
    }

    const statutPaiement = simulation || 'confirme';

    const transactionRef = `SS-PAY-${crypto
      .randomBytes(12)
      .toString('hex')
      .toUpperCase()}`;

    // Enregistrement du paiement
    const paiementResult = await client.query(
      `
      INSERT INTO payments (
        request_id,
        montant,
        operateur,
        telephone,
        statut,
        transaction_ref
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        statut,
        transaction_ref,
        created_at
      `,
      [
        demande.id,
        montant,
        operateur || null,
        telephone || null,
        statutPaiement,
        transactionRef,
      ],
    );

    // Paiement confirmé => demande payée
    if (statutPaiement === 'confirme') {
      await client.query(
        `
        UPDATE demandes
        SET statut = 'paye',
            updated_at = NOW()
        WHERE id = $1
        `,
        [demande.id],
      );
    }

    await client.query('COMMIT');

    return {
      demandeId: demande.id,
      montant,
      paiement: paiementResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  obtenirContexte,
  simulerPaiement,
};