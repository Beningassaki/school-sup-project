// Données de test en mémoire. Quand le backend sera prêt, remplace le corps de chaque
// fonction par un appel axios (les routes ci-dessous sont des suppositions à confirmer).
const attendre = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const copie = (x) => JSON.parse(JSON.stringify(x));
let prochainId = 100;

let formations = [
  { id: 1, nom: 'Informatique et Réseaux', etablissement: 'FST', niveau: 'Licence professionnelle', visible: true },
  { id: 2, nom: 'Droit privé', etablissement: 'FD', niveau: 'Licence', visible: true },
  { id: 3, nom: 'Lettres modernes', etablissement: 'FLSH', niveau: 'Licence', visible: false },
];

let pieces = {
  legalisation: [
    { id: 1, nom: "Pièce d'identité", obligatoire: true },
    { id: 2, nom: 'Attestation à légaliser', obligatoire: true },
  ],
  pre_inscription: [
    { id: 3, nom: "Pièce d'identité", obligatoire: true },
    { id: 4, nom: 'Diplôme', obligatoire: true },
    { id: 5, nom: 'Photo', obligatoire: false },
  ],
};

// Montants fictifs, pour tester l'affichage
let frais = [
  { type: 'legalisation', libelle: "Légalisation d'attestation", montant: 2000 },
  { type: 'pre_inscription', libelle: 'Pré-inscription', montant: 5000 },
];

export const adminApi = {
  // GET /api/admin/formations
  async listerFormations() { await attendre(); return copie(formations); },

  // POST /api/admin/formations  ou  PUT /api/admin/formations/:id
  async enregistrerFormation(f) {
    await attendre();
    if (f.id) formations = formations.map((x) => (x.id === f.id ? { ...x, ...f } : x));
    else formations = [...formations, { ...f, id: prochainId++, visible: true }];
    return copie(formations);
  },

  // PATCH /api/admin/formations/:id  (visible: true | false)
  async basculerFormation(id) {
    await attendre();
    formations = formations.map((x) => (x.id === id ? { ...x, visible: !x.visible } : x));
    return copie(formations);
  },

  // GET /api/admin/pieces?type=...
  async listerPieces(type) { await attendre(); return copie(pieces[type]); },

  // POST /api/admin/pieces
  async ajouterPiece(type, piece) {
    await attendre();
    pieces = { ...pieces, [type]: [...pieces[type], { ...piece, id: prochainId++ }] };
    return copie(pieces[type]);
  },

  // PATCH /api/admin/pieces/:id  (obligatoire)
  async basculerPiece(type, id) {
    await attendre();
    pieces = { ...pieces, [type]: pieces[type].map((p) => (p.id === id ? { ...p, obligatoire: !p.obligatoire } : p)) };
    return copie(pieces[type]);
  },

  // DELETE /api/admin/pieces/:id
  async supprimerPiece(type, id) {
    await attendre();
    pieces = { ...pieces, [type]: pieces[type].filter((p) => p.id !== id) };
    return copie(pieces[type]);
  },

  // GET /api/admin/frais
  async listerFrais() { await attendre(); return copie(frais); },

  // PUT /api/admin/frais/:type
  async modifierFrais(type, montant) {
    await attendre();
    frais = frais.map((f) => (f.type === type ? { ...f, montant } : f));
    return copie(frais);
  },
};