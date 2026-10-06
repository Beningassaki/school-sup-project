const pool = require('../../config/db');

async function mesDemandes(studentId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.reference, r.type, r.statut, r.motif, r.montant,
            r.created_at, f.filiere AS formation, f.faculte
     FROM requests r
     LEFT JOIN formations f ON f.id = r.formation_id
     WHERE r.student_id = $1
     ORDER BY r.created_at DESC, r.id DESC`,
    [studentId],
  );

  return rows;
}

module.exports = { mesDemandes };
