// =====================================================
// OUVRIR UNE PIÈCE JOINTE : le navigateur ne peut pas envoyer le jeton de
// connexion avec un simple lien. On télécharge donc le fichier avec fetch
// (jeton inclus), puis on l'affiche dans un nouvel onglet.
// =====================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CLE_SESSION = 'schoolsup_session';

function lireToken() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SESSION))?.token ?? null;
  } catch {
    return null;
  }
}

export async function ouvrirPiece(documentId) {
  // On ouvre l'onglet tout de suite : après un await, le navigateur le bloquerait
  const onglet = window.open('', '_blank');

  try {
    const reponse = await fetch(`${API_URL}/agent/documents/${documentId}/fichier`, {
      headers: { Authorization: `Bearer ${lireToken()}` },
    });

    if (!reponse.ok) {
      const json = await reponse.json().catch(() => ({}));
      throw new Error(json.message || "Impossible d'ouvrir la pièce");
    }

    const fichier = await reponse.blob();
    if (onglet) onglet.location.href = URL.createObjectURL(fichier);
  } catch (erreur) {
    if (onglet) onglet.close();
    throw erreur;
  }
}
