// CONTROLLER : reçoit la requête, appelle le service, renvoie la réponse
const service = require('./agent.service');
const asyncHandler = require('../../utils/asyncHandler');
const lireId = require('../../utils/lireId');

// Lit un nombre entier dans l'URL (page, limite), avec valeur par défaut et maximum
function lireEntier(valeur, defaut, max = Infinity) {
  const nombre = Number.parseInt(valeur, 10);
  if (!Number.isInteger(nombre) || nombre < 1) return defaut;
  return Math.min(nombre, max);
}

const texteOuUndefined = (valeur) => (valeur ? String(valeur).trim() : undefined);

// GET /api/agent/statistiques
const statistiques = asyncHandler(async (_req, res) => {
  res.json({ succes: true, data: await service.statistiques() });
});

// GET /api/agent/dossiers?statut=paye&type=...&recherche=...&page=1&limite=10
const lister = asyncHandler(async (req, res) => {
  const data = await service.lister({
    statut: req.query.statut || undefined,
    type: req.query.type || undefined,
    recherche: texteOuUndefined(req.query.recherche),
    page: lireEntier(req.query.page, 1),
    limite: lireEntier(req.query.limite, 10, 50),
  });
  res.json({ succes: true, data });
});

// GET /api/agent/dossiers/:id
const detail = asyncHandler(async (req, res) => {
  res.json({ succes: true, data: await service.detail(lireId(req.params.id)) });
});

// GET /api/agent/documents/:documentId/fichier  (renvoie le fichier lui-même)
const fichier = asyncHandler(async (req, res, next) => {
  const { absolu, nom } = await service.cheminFichier(lireId(req.params.documentId));
  res.sendFile(
    absolu,
    { headers: { 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(nom)}` } },
    (erreur) => {
      if (erreur) next(erreur);
    },
  );
});

// PATCH /api/agent/documents/:documentId  { statut: 'valide' | 'illisible' }
const statutDocument = asyncHandler(async (req, res) => {
  const data = await service.changerStatutDocument(lireId(req.params.documentId), req.body.statut);
  res.json({ succes: true, data });
});

// POST /api/agent/dossiers/:id/valider  (US8)
const valider = asyncHandler(async (req, res) => {
  const data = await service.valider(lireId(req.params.id), req.user.id);
  res.json({ succes: true, data });
});

// POST /api/agent/dossiers/:id/refuser  { motif }  (US8)
const refuser = asyncHandler(async (req, res) => {
  const data = await service.refuser(lireId(req.params.id), req.user.id, req.body.motif);
  res.json({ succes: true, data });
});

// POST /api/agent/dossiers/:id/complement  { type_piece, motif }  (US14)
const complement = asyncHandler(async (req, res) => {
  const data = await service.demanderComplement(lireId(req.params.id), req.user.id, req.body);
  res.json({ succes: true, data });
});

// GET /api/agent/complements  (US14)
const complements = asyncHandler(async (req, res) => {
  const data = await service.complements({
    recherche: texteOuUndefined(req.query.recherche),
    page: lireEntier(req.query.page, 1),
    limite: lireEntier(req.query.limite, 10, 50),
  });
  res.json({ succes: true, data });
});

module.exports = {
  statistiques,
  lister,
  detail,
  fichier,
  statutDocument,
  valider,
  refuser,
  complement,
  complements,
};
