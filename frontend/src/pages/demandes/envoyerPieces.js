import { api } from '../../services/api.js';

export async function envoyerPieces(demandeId, pieces) {
  const formulaire = new FormData();
  formulaire.append('types', JSON.stringify(pieces.map((piece) => piece.typePiece)));
  pieces.forEach((piece) => formulaire.append('fichiers', piece.fichier));

  return api.post(`/demandes/${demandeId}/pieces`, formulaire);
}
