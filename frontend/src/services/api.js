// =====================================================
// CLIENT API : propriétaire ALTY
// Tous les appels au backend passent par ici.
// Utilisation dans une page :
//   import { api } from '../../services/api.js';
//   const formations = await api.get('/formations');
//   const demande = await api.post('/demandes', { type: 'legalisation' });
// Le token de connexion est ajouté automatiquement.
// =====================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CLE_SESSION = 'schoolsup_session'; // même clé que AuthContext

// Lit le token enregistré à la connexion (ou null)
function lireToken() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SESSION))?.token ?? null;
  } catch {
    return null;
  }
}

async function requete(chemin, { method = 'GET', body } = {}) {
  const headers = {};
  const token = lireToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };

  if (body instanceof FormData) {
    // Envoi de fichiers (pièces jointes) : le navigateur gère le Content-Type
    options.body = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const reponse = await fetch(`${API_URL}${chemin}`, options);
  const json = await reponse.json().catch(() => ({}));

  // Le backend répond toujours { succes, data } ou { succes: false, message }
  if (!reponse.ok) {
    const erreur = new Error(json.message || 'Erreur serveur');
    erreur.status = reponse.status;
    erreur.details = json.details; // erreurs de validation (liste de champs)
    throw erreur;
  }
  return json.data;
}

export const api = {
  get: (chemin) => requete(chemin),
  post: (chemin, body) => requete(chemin, { method: 'POST', body }),
  put: (chemin, body) => requete(chemin, { method: 'PUT', body }),
  patch: (chemin, body) => requete(chemin, { method: 'PATCH', body }),
  delete: (chemin) => requete(chemin, { method: 'DELETE' }),
};