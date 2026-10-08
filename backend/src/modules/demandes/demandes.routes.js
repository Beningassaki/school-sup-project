const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const multer = require('multer');
const asyncHandler = require('../../utils/asyncHandler');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');
const { authenticate, authorize } = require('../../middlewares/auth');

const RACINE_BACKEND = path.join(__dirname, '..', '..', '..');
const RACINE_UPLOADS = path.join(RACINE_BACKEND, 'uploads');
const LIMITE_FICHIER = 5 * 1024 * 1024;
const FORMATS = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

fs.mkdirSync(RACINE_UPLOADS, { recursive: true });

const stockage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, RACINE_UPLOADS),
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage: stockage,
  limits: { fileSize: LIMITE_FICHIER, files: 5, fields: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (FORMATS[extension] !== file.mimetype) {
      callback(new AppError('Format accepté : PDF, JPG ou PNG.', 400));
      return;
    }
    callback(null, true);
  },
});

function recevoirFichiers(req, res, next) {
  upload.array('fichiers', 5)(req, res, (erreur) => {
    if (!erreur) return next();
    if (erreur.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Chaque fichier doit faire 5 Mo maximum.', 413));
    }
    if (erreur.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Vous pouvez envoyer 5 fichiers maximum.', 400));
    }
    next(erreur instanceof AppError ? erreur : new AppError(erreur.message, 400));
  });
}

async function supprimerFichiers(fichiers) {
  await Promise.all(
    fichiers.map((fichier) => fs.promises.unlink(fichier).catch(() => {})),
  );
}

function typeDocumentAutorise(type, informations, typePiece) {
  if (type === 'pre_inscription') {
    return [
      'Diplôme du baccalauréat',
      'Relevé de notes',
      'Pièce d’identité',
    ].includes(typePiece);
  }

  const obligatoires = [informations.typeDocument, 'Pièce d’identité'];
  return obligatoires.includes(typePiece) || /^Document complémentaire [1-3]$/.test(typePiece);
}

async function verifierSignature(fichier) {
  const handle = await fs.promises.open(fichier.path, 'r');
  try {
    const signature = Buffer.alloc(8);
    const { bytesRead } = await handle.read(signature, 0, signature.length, 0);
    const extension = path.extname(fichier.originalname).toLowerCase();
    if (extension === '.pdf') return signature.subarray(0, 4).toString() === '%PDF';
    if (extension === '.jpg' || extension === '.jpeg') {
      return bytesRead >= 3 && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    }
    return signature.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  } finally {
    await handle.close();
  }
}

router.post(
  '/',
  authenticate,
  authorize('etudiant'),
  asyncHandler(async (req, res) => {
    const { type, objet, informations = {}, pieces = [] } = req.body;

    if (!['legalisation', 'pre_inscription'].includes(type)) {
      throw new AppError('Type de demande invalide', 400);
    }
    if (!informations || typeof informations !== 'object' || Array.isArray(informations)) {
      throw new AppError('Les informations de la demande sont invalides', 400);
    }
    if (!Array.isArray(pieces)) {
      throw new AppError('La liste des pièces est invalide', 400);
    }

    let formationId = null;
    let montant = Number(informations.montantTotal ?? informations.montant ?? 0);
    let informationsFinales = { ...informations };

    if (type === 'pre_inscription') {
      formationId = Number(informations.formationId ?? informations.formation_id);
      if (!Number.isInteger(formationId) || formationId < 1) {
        throw new AppError('Veuillez choisir une formation valide', 400);
      }

      const formation = await pool.query(
        'SELECT id, frais FROM formations WHERE id = $1 AND actif = TRUE',
        [formationId],
      );
      if (!formation.rows[0]) throw new AppError('Formation introuvable ou inactive', 404);

      montant = formation.rows[0].frais;
      informationsFinales = { ...informationsFinales, montantTotal: montant };
    }

    if (!Number.isInteger(montant) || montant <= 0) {
      throw new AppError('Le montant de la demande est invalide', 400);
    }

    const reference = `SS-${new Date().getFullYear()}-${crypto.randomBytes(10).toString('hex').toUpperCase()}`;
    const { rows } = await pool.query(
      `INSERT INTO requests
        (reference, type, statut, student_id, formation_id, montant, objet, informations, pieces)
       VALUES ($1, $2, 'brouillon', $3, $4, $5, $6, $7, $8)
       RETURNING id, reference, type, statut, student_id, formation_id, montant,
                 objet, informations, pieces, created_at, updated_at`,
      [
        reference,
        type,
        req.user.id,
        formationId,
        montant,
        typeof objet === 'string' ? objet.trim() : null,
        JSON.stringify(informationsFinales),
        JSON.stringify(pieces),
      ],
    );

    res.status(201).json({ succes: true, data: rows[0] });
  }),
);

router.post(
  '/:id/pieces',
  authenticate,
  authorize('etudiant'),
  recevoirFichiers,
  asyncHandler(async (req, res) => {
    const fichiers = req.files ?? [];
    let conserverNouveauxFichiers = false;
    let anciensChemins = [];

    try {
      const demandeId = Number(req.params.id);
      if (!Number.isInteger(demandeId) || demandeId < 1) {
        throw new AppError('Identifiant de demande invalide', 400);
      }
      if (fichiers.length === 0) throw new AppError('Aucun fichier reçu', 400);

      let typesPieces;
      try {
        typesPieces = JSON.parse(req.body.types ?? '');
      } catch {
        throw new AppError('La liste des types de pièces est invalide', 400);
      }
      if (!Array.isArray(typesPieces) || typesPieces.length !== fichiers.length) {
        throw new AppError('Chaque fichier doit être associé à un type de pièce', 400);
      }
      if (typesPieces.some((type) => typeof type !== 'string' || !type.trim() || type.length > 100)) {
        throw new AppError('Un type de pièce est invalide', 400);
      }
      if (new Set(typesPieces).size !== typesPieces.length) {
        throw new AppError('Un même type de pièce ne peut pas être envoyé deux fois', 400);
      }
      for (const fichier of fichiers) {
        if (!(await verifierSignature(fichier))) {
          throw new AppError(`Le fichier « ${fichier.originalname} » ne correspond pas à son format déclaré`, 400);
        }
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const demandeResultat = await client.query(
          `SELECT id, type, statut, informations
           FROM requests
           WHERE id = $1 AND student_id = $2
           FOR UPDATE`,
          [demandeId, req.user.id],
        );
        const demande = demandeResultat.rows[0];
        if (!demande) throw new AppError('Demande introuvable', 404);
        if (demande.statut !== 'brouillon') {
          throw new AppError('Les pièces ne peuvent plus être modifiées après le dépôt de la demande', 409);
        }
        if (typesPieces.some((type) => !typeDocumentAutorise(demande.type, demande.informations, type))) {
          throw new AppError('Un type de pièce ne correspond pas à cette démarche', 400);
        }

        const requises = demande.type === 'pre_inscription'
          ? ['Diplôme du baccalauréat', 'Relevé de notes', 'Pièce d’identité']
          : [demande.informations.typeDocument, 'Pièce d’identité'];
        if (requises.some((type) => !typesPieces.includes(type))) {
          throw new AppError('Toutes les pièces obligatoires doivent être jointes', 400);
        }

        const existantes = await client.query(
          'SELECT chemin FROM documents WHERE request_id = $1',
          [demandeId],
        );
        anciensChemins = existantes.rows
          .map((row) => path.resolve(RACINE_BACKEND, row.chemin))
          .filter((chemin) => chemin.startsWith(`${RACINE_UPLOADS}${path.sep}`));

        await client.query('DELETE FROM documents WHERE request_id = $1', [demandeId]);
        const documents = [];
        for (let index = 0; index < fichiers.length; index += 1) {
          const fichier = fichiers[index];
          const typePiece = typesPieces[index].trim();
          const chemin = path.posix.join('uploads', path.basename(fichier.filename));
          const { rows } = await client.query(
            `INSERT INTO documents (request_id, type_piece, nom_fichier, chemin, statut)
             VALUES ($1, $2, $3, $4, 'a_verifier')
             RETURNING id, type_piece, nom_fichier, statut, created_at`,
            [demandeId, typePiece, fichier.originalname, chemin],
          );
          documents.push(rows[0]);
        }

        await client.query(
          `UPDATE requests
           SET pieces = $1, updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(documents.map((document) => ({
            type_piece: document.type_piece,
            nom: document.nom_fichier,
          }))), demandeId],
        );
        await client.query('COMMIT');
        conserverNouveauxFichiers = true;
        await supprimerFichiers(anciensChemins);
        res.json({ succes: true, data: documents });
      } catch (erreur) {
        await client.query('ROLLBACK');
        throw erreur;
      } finally {
        client.release();
      }
    } finally {
      if (!conserverNouveauxFichiers) {
        await supprimerFichiers(fichiers.map((fichier) => fichier.path));
      }
    }
  }),
);

router.get(
  '/',
  authenticate,
  authorize('etudiant'),
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT r.id, r.reference, r.type, r.statut, r.montant, r.objet,
              r.informations, r.pieces, r.created_at, r.updated_at,
              f.filiere, f.faculte
       FROM requests r
       LEFT JOIN formations f ON f.id = r.formation_id
       WHERE r.student_id = $1
       ORDER BY r.created_at DESC, r.id DESC`,
      [req.user.id],
    );
    res.json({ succes: true, data: rows });
  }),
);

router.get(
  '/:id',
  authenticate,
  authorize('etudiant'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new AppError('Identifiant invalide', 400);

    const { rows } = await pool.query(
      `SELECT id, reference, type, statut, student_id, formation_id, montant,
              objet, informations, pieces, created_at, updated_at
       FROM requests
       WHERE id = $1 AND student_id = $2`,
      [id, req.user.id],
    );
    if (!rows[0]) throw new AppError('Demande introuvable', 404);
    res.json({ succes: true, data: rows[0] });
  }),
);

module.exports = router;
