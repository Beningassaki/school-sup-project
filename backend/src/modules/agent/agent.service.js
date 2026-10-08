// =====================================================
// SERVICE : espace agent (US7, US8, US14)
// Règles appliquées ici :
//  - l'agent ne voit QUE les dossiers payés ou déjà traités
//    (jamais "brouillon" ni "en_attente_paiement")
//  - on ne traite (valider, refuser, demander un complément) qu'un dossier "paye"
//  - un refus et un complément exigent un motif visible par l'étudiant
//  - chaque changement de statut écrit status_history DANS LA MÊME TRANSACTION
//  - un dossier validé ou refusé n'est plus modifiable
// =====================================================
const fs = require('fs');
const path = require('path');
const pool = require('../../config/db');
const AppError = require('../../utils/AppError');
const recusService = require('../recus/recus.service');

const STATUTS_VISIBLES = ['paye', 'en_attente_complement', 'valide', 'refuse'];
const TYPES = ['legalisation', 'pre_inscription'];

// Pièces demandées par démarche.
// ⚠️ À garder identique aux pièces du module demandes (demandes.pieces.js).
const PIECES_REQUISES = {
  pre_inscription: ['Diplôme du baccalauréat', 'Relevé de notes', 'Pièce d’identité'],
  legalisation: ['Pièce d’identité', 'Attestation à légaliser'],
};

function piecesRequisesPour(type, informations = {}) {
  if (type === 'legalisation') {
    return [informations.typeDocument || 'Attestation à légaliser', 'Pièce d’identité'];
  }
  return PIECES_REQUISES[type] ?? [];
}

const RACINE_BACKEND = path.join(__dirname, '..', '..', '..');
const RACINE_UPLOADS = path.join(RACINE_BACKEND, 'uploads');

// ---------- Outils internes ----------

// Exécute des requêtes dans UNE transaction : tout réussit, ou rien n'est enregistré
async function enTransaction(travail) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultat = await travail(client);
    await client.query('COMMIT');
    return resultat;
  } catch (erreur) {
    await client.query('ROLLBACK');
    throw erreur;
  } finally {
    client.release();
  }
}

// Verrouille le dossier et vérifie qu'il est bien "paye" (le seul état traitable)
async function verrouillerDossierPaye(client, demandeId) {
  const { rows } = await client.query(
    'SELECT id, type, statut, informations FROM requests WHERE id = $1 FOR UPDATE',
    [demandeId],
  );
  // 404 aussi pour un brouillon ou un dossier non payé : l'agent ne doit pas les voir
  if (!rows[0] || !STATUTS_VISIBLES.includes(rows[0].statut)) {
    throw new AppError('Dossier introuvable', 404);
  }
  if (rows[0].statut === 'en_attente_complement') {
    throw new AppError('Ce dossier attend déjà un complément de pièce', 409);
  }
  if (rows[0].statut !== 'paye') {
    throw new AppError('Ce dossier a déjà été traité', 409);
  }
  return rows[0];
}

// Change le statut ET écrit l'historique (à appeler dans une transaction)
async function appliquerStatut(client, demandeId, nouveauStatut, motif, agentId) {
  await client.query(
    'UPDATE requests SET statut = $1, motif = $2, updated_at = NOW() WHERE id = $3',
    [nouveauStatut, motif, demandeId],
  );
  await client.query(
    `INSERT INTO status_history (request_id, ancien_statut, nouveau_statut, motif, agent_id)
     VALUES ($1, 'paye', $2, $3, $4)`,
    [demandeId, nouveauStatut, motif, agentId],
  );
}

// Appelle la notification de Dubien (US10), sans JAMAIS bloquer le traitement.
// Si son module n'existe pas encore, on ignore simplement.
async function notifierSansBloquer(demandeId, nouveauStatut) {
  try {
    const notifications = require('../notifications/notifications.service');
    await notifications.notifier(demandeId, nouveauStatut);
  } catch (erreur) {
    if (erreur.code !== 'MODULE_NOT_FOUND') {
      console.error('Notification non envoyée :', erreur.message);
    }
  }
}

// ---------- US7 : compteurs du tableau de bord ----------
async function statistiques() {
  const { rows } = await pool.query(
    `SELECT statut, COUNT(*)::int AS total
     FROM requests
     WHERE statut::text = ANY($1)
     GROUP BY statut`,
    [STATUTS_VISIBLES],
  );
  const total = (statut) => rows.find((r) => r.statut === statut)?.total ?? 0;
  return {
    a_controler: total('paye'),
    en_attente_complement: total('en_attente_complement'),
    valides: total('valide'),
    refuses: total('refuse'),
  };
}

// ---------- US7 : liste des dossiers (filtres et pagination) ----------
async function lister({ statut = 'paye', type, recherche, page = 1, limite = 10 }) {
  if (!STATUTS_VISIBLES.includes(statut)) throw new AppError('Statut invalide', 400);
  if (type && !TYPES.includes(type)) throw new AppError('Type de démarche invalide', 400);

  // Conditions construites avec des paramètres ($1, $2...) : jamais de texte collé
  const valeurs = [statut];
  const conditions = ['r.statut = $1'];

  if (type) {
    valeurs.push(type);
    conditions.push(`r.type = $${valeurs.length}`);
  }
  if (recherche) {
    valeurs.push(`%${recherche}%`);
    const n = valeurs.length;
    conditions.push(`(r.reference ILIKE $${n} OR u.nom ILIKE $${n} OR u.prenom ILIKE $${n})`);
  }

  const base = `FROM requests r
    JOIN users u ON u.id = r.student_id
    LEFT JOIN formations f ON f.id = r.formation_id
    WHERE ${conditions.join(' AND ')}`;

  const compte = await pool.query(`SELECT COUNT(*)::int AS total ${base}`, valeurs);

  const { rows } = await pool.query(
    `SELECT r.id, r.reference, r.type, r.statut, r.motif, r.montant, r.informations,
            r.created_at, r.updated_at,
            u.nom, u.prenom, f.filiere,
            (SELECT COUNT(*)::int FROM documents d WHERE d.request_id = r.id) AS documents_fournis
     ${base}
     ORDER BY r.updated_at DESC, r.id DESC
     LIMIT $${valeurs.length + 1} OFFSET $${valeurs.length + 2}`,
    [...valeurs, limite, (page - 1) * limite],
  );

  return {
    elements: rows.map(({ nom, prenom, ...dossier }) => ({
      ...dossier,
      etudiant: { nom, prenom },
      documents_requis: piecesRequisesPour(dossier.type, dossier.informations).length,
    })),
    total: compte.rows[0].total,
    page,
    limite,
  };
}

// ---------- US7 : détail d'un dossier ----------
async function detail(demandeId) {
  const dossier = await pool.query(
    `SELECT r.id, r.reference, r.type, r.statut, r.motif, r.montant, r.informations, r.created_at,
            f.faculte, f.filiere, u.nom, u.prenom, u.email, u.telephone
     FROM requests r
     JOIN users u ON u.id = r.student_id
     LEFT JOIN formations f ON f.id = r.formation_id
     WHERE r.id = $1 AND r.statut::text = ANY($2)`,
    [demandeId, STATUTS_VISIBLES],
  );
  if (!dossier.rows[0]) throw new AppError('Dossier introuvable', 404);
  const { nom, prenom, email, telephone, ...infos } = dossier.rows[0];

  // Pas de colonne "chemin" : information interne au serveur
  const documents = await pool.query(
    `SELECT id, type_piece, nom_fichier, statut, created_at
     FROM documents WHERE request_id = $1 ORDER BY id`,
    [demandeId],
  );

  const paiement = await pool.query(
    `SELECT montant, operateur, statut, created_at
     FROM payments WHERE request_id = $1 AND statut = 'confirme'
     ORDER BY id DESC LIMIT 1`,
    [demandeId],
  );

  const historique = await pool.query(
    `SELECT h.ancien_statut, h.nouveau_statut, h.motif, h.created_at,
            a.prenom AS agent_prenom, a.nom AS agent_nom
     FROM status_history h
     LEFT JOIN users a ON a.id = h.agent_id
     WHERE h.request_id = $1
     ORDER BY h.created_at, h.id`,
    [demandeId],
  );

  const piecesRequises = piecesRequisesPour(infos.type, infos.informations);
  return {
    dossier: { ...infos, documents_requis: piecesRequises.length },
    pieces_requises: piecesRequises,
    etudiant: { nom, prenom, email, telephone },
    documents: documents.rows,
    paiement: paiement.rows[0] ?? null,
    historique: historique.rows,
  };
}

// ---------- US7 : retrouver le fichier d'une pièce sur le disque ----------
async function cheminFichier(documentId) {
  const { rows } = await pool.query(
    `SELECT d.chemin, d.nom_fichier
     FROM documents d
     JOIN requests r ON r.id = d.request_id
     WHERE d.id = $1 AND r.statut::text = ANY($2)`,
    [documentId, STATUTS_VISIBLES],
  );
  if (!rows[0]) throw new AppError('Pièce introuvable', 404);

  // Protection : le fichier doit se trouver DANS le dossier uploads
  const absolu = path.resolve(RACINE_BACKEND, rows[0].chemin);
  if (!absolu.startsWith(RACINE_UPLOADS + path.sep)) throw new AppError('Pièce introuvable', 404);
  if (!fs.existsSync(absolu)) throw new AppError('Fichier introuvable sur le serveur', 404);

  return { absolu, nom: rows[0].nom_fichier };
}

// ---------- US7 : marquer une pièce valide ou illisible ----------
async function changerStatutDocument(documentId, statut) {
  const { rows } = await pool.query(
    `SELECT r.statut
     FROM documents d
     JOIN requests r ON r.id = d.request_id
     WHERE d.id = $1 AND r.statut::text = ANY($2)`,
    [documentId, STATUTS_VISIBLES],
  );
  if (!rows[0]) throw new AppError('Pièce introuvable', 404);

  // Un dossier déjà traité n'est plus modifiable (règle produit)
  if (rows[0].statut !== 'paye') throw new AppError('Ce dossier ne peut plus être modifié', 409);

  const maj = await pool.query(
    `UPDATE documents SET statut = $1 WHERE id = $2
     RETURNING id, type_piece, nom_fichier, statut`,
    [statut, documentId],
  );
  return maj.rows[0];
}

// ---------- US8 : valider un dossier (et créer son reçu) ----------
async function valider(demandeId, agentId) {
  const resultat = await enTransaction(async (client) => {
    const dossier = await verrouillerDossierPaye(client, demandeId);

    // Toutes les pièces demandées doivent être là, et aucune ne doit être refusée
    const { rows: pieces } = await client.query(
      'SELECT type_piece, statut FROM documents WHERE request_id = $1',
      [demandeId],
    );
    const details = [
      ...piecesRequisesPour(dossier.type, dossier.informations)
        .filter((piece) => !pieces.some((p) => p.type_piece === piece))
        .map((piece) => ({ champ: 'documents', message: `Pièce manquante : ${piece}` })),
      ...pieces
        .filter((p) => p.statut === 'illisible' || p.statut === 'manquant')
        .map((p) => ({ champ: 'documents', message: `Pièce à corriger : ${p.type_piece}` })),
    ];
    if (details.length > 0) {
      const erreur = new AppError(
        'Impossible de valider : demandez un complément pour les pièces en cause',
        400,
      );
      erreur.details = details;
      throw erreur;
    }

    await appliquerStatut(client, demandeId, 'valide', null, agentId);

    // Le reçu est créé dans la MÊME transaction (fonction du module recus)
    const recu = await recusService.creerPourDemande(client, demandeId);
    return { id: demandeId, statut: 'valide', code_recu: recu.code };
  });

  // Après la transaction : une erreur de notification ne peut pas annuler la validation
  await notifierSansBloquer(demandeId, 'valide');
  return resultat;
}

// ---------- US8 : refuser un dossier (motif obligatoire) ----------
async function refuser(demandeId, agentId, motif) {
  const resultat = await enTransaction(async (client) => {
    await verrouillerDossierPaye(client, demandeId);
    await appliquerStatut(client, demandeId, 'refuse', motif, agentId);
    return { id: demandeId, statut: 'refuse' };
  });

  await notifierSansBloquer(demandeId, 'refuse');
  return resultat;
}

// ---------- US14 : demander un complément de pièce (motif obligatoire) ----------
async function demanderComplement(demandeId, agentId, { type_piece: typePiece, motif }) {
  const resultat = await enTransaction(async (client) => {
    const dossier = await verrouillerDossierPaye(client, demandeId);

    // La pièce demandée doit faire partie des pièces de cette démarche
    if (!piecesRequisesPour(dossier.type, dossier.informations).includes(typePiece)) {
      throw new AppError("Cette pièce n'est pas demandée pour cette démarche", 400);
    }

    // Si l'étudiant avait déjà fourni cette pièce, elle est marquée "illisible"
    await client.query(
      "UPDATE documents SET statut = 'illisible' WHERE request_id = $1 AND type_piece = $2",
      [demandeId, typePiece],
    );

    // Le motif commence par le nom de la pièce : "Pièce d'identité : Document illisible".
    // L'étudiant le voit tel quel ; la liste des compléments le découpe pour l'agent.
    await appliquerStatut(client, demandeId, 'en_attente_complement', `${typePiece} : ${motif}`, agentId);
    return { id: demandeId, statut: 'en_attente_complement' };
  });

  await notifierSansBloquer(demandeId, 'en_attente_complement');
  return resultat;
}

// ---------- US14 : liste des dossiers en attente de complément ----------
async function complements({ recherche, page, limite }) {
  const resultat = await lister({ statut: 'en_attente_complement', recherche, page, limite });
  return {
    ...resultat,
    elements: resultat.elements.map((dossier) => {
      const [piece, ...reste] = (dossier.motif ?? '').split(' : ');
      return {
        ...dossier,
        piece_demandee: reste.length > 0 ? piece : null,
        motif: reste.length > 0 ? reste.join(' : ') : dossier.motif,
      };
    }),
  };
}

module.exports = {
  statistiques,
  lister,
  detail,
  cheminFichier,
  changerStatutDocument,
  valider,
  refuser,
  demanderComplement,
  complements,
};
