import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Upload,
  X,
} from 'lucide-react';

import { api } from '../../services/api.js';
import LegalisationPaiement from './LegalisationPaiement.jsx';
import './LegalisationPage.css';

export default function LegalisationPage() {
  const [etape, setEtape] = useState(1);

  // Informations demande
  const [typeDocument, setTypeDocument] = useState('');
  const [anneeObtention, setAnneeObtention] = useState('');
  const [nombreCopies, setNombreCopies] = useState(1);

  // Documents
  const [documents, setDocuments] = useState([]);
  const [certification, setCertification] = useState(false);

  // Demande
  const [demandeId, setDemandeId] = useState(null);
  const [reference, setReference] = useState('');

  // Confirmation paiement
  const [transaction, setTransaction] = useState('');
  const [dateDepot, setDateDepot] = useState('');
  const [paiementReussi, setPaiementReussi] = useState(false);

  // Messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Tarif légalisation
  const montantUnitaire = 5000;

  const montantTotal = useMemo(() => {
    return Number(nombreCopies || 0) * montantUnitaire;
  }, [nombreCopies]);

  const objet = 'Demande de légalisation de document';

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function nettoyerMessages() {
    setError('');
    setMessage('');
  }

  /*
   * Récupération robuste de l'ID
   * selon la structure renvoyée par l'API.
   */
  function obtenirIdDemande(response) {
    return (
      response?.id ||
      response?.demande?.id ||
      response?.data?.id ||
      response?.data?.demande?.id ||
      null
    );
  }

  /*
   * Création de la demande de légalisation
   */
  async function creerDemande() {
    const payload = {
      type: 'legalisation',

      objet,

      informations: {
        typeDocument,
        anneeObtention,
        nombreCopies: Number(nombreCopies),
        montantUnitaire,
        montantTotal,
      },

      pieces: documents.map((file) => ({
        nom: file.name,
        fichier: file.name,
        type_mime: file.type,
        taille: file.size,
      })),
    };

    console.log(
      'Création demande légalisation :',
      payload
    );

    const response = await api.post(
      '/demandes',
      payload
    );

    console.log(
      'Réponse création demande :',
      response
    );

    return response;
  }

  /*
   * ÉTAPE 1 → ÉTAPE 2
   */
  function continuerVersDocuments(e) {
    e.preventDefault();

    nettoyerMessages();

    if (!typeDocument) {
      setError(
        'Veuillez sélectionner le type de document.'
      );
      return;
    }

    if (!anneeObtention) {
      setError(
        "Veuillez renseigner l'année d'obtention."
      );
      return;
    }

    if (
      !nombreCopies ||
      Number(nombreCopies) < 1
    ) {
      setError(
        'Veuillez sélectionner le nombre de copies.'
      );
      return;
    }

    setEtape(2);
    scrollTop();
  }

  /*
   * Ajouter des documents
   */
  function ajouterDocuments(e) {
    nettoyerMessages();

    const fichiers = Array.from(
      e.target.files || []
    );

    if (!fichiers.length) {
      return;
    }

    const fichiersValides = [];

    for (const file of fichiers) {
      const extension = file.name
        .split('.')
        .pop()
        ?.toLowerCase();

      const extensionsAutorisees = [
        'pdf',
        'jpg',
        'jpeg',
        'png',
      ];

      if (
        !extensionsAutorisees.includes(
          extension
        )
      ) {
        setError(
          `Le fichier "${file.name}" n'est pas accepté. Utilisez PDF, JPG ou PNG.`
        );
        continue;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          `Le fichier "${file.name}" dépasse la taille maximale de 5 Mo.`
        );
        continue;
      }

      fichiersValides.push(file);
    }

    setDocuments((anciens) => [
      ...anciens,
      ...fichiersValides,
    ]);

    e.target.value = '';
  }

  /*
   * Supprimer un document
   */
  function supprimerDocument(index) {
    setDocuments((anciens) =>
      anciens.filter(
        (_, i) => i !== index
      )
    );
  }

  /*
   * ÉTAPE 2 → ÉTAPE 3
   */
  async function continuerVersPaiement(e) {
    e.preventDefault();

    nettoyerMessages();

    if (documents.length < 2) {
      setError(
        'Veuillez ajouter au moins 2 documents avant de continuer.'
      );
      return;
    }

    if (!certification) {
      setError(
        'Veuillez confirmer que les informations fournies sont exactes.'
      );
      return;
    }

    setLoading(true);

    try {
      let id = demandeId;

      /*
       * Création de la demande si elle
       * n'existe pas encore.
       */
      if (!id) {
        const response =
          await creerDemande();

        id = obtenirIdDemande(
          response
        );

        console.log(
          'ID demande récupéré :',
          id
        );

        if (!id) {
          console.error(
            'Réponse inattendue du backend :',
            response
          );

          throw new Error(
            "La demande a été créée mais son identifiant n'a pas été retourné par le serveur."
          );
        }

        id = Number(id);

        setDemandeId(id);

        const nouvelleReference =
          `LEG-${new Date().getFullYear()}-${String(
            id
          ).padStart(4, '0')}`;

        setReference(
          nouvelleReference
        );
      }

      /*
       * Passage à l'écran de paiement.
       */
      setEtape(3);

      scrollTop();
    } catch (err) {
      console.error(
        'Erreur préparation paiement :',
        err
      );

      setError(
        err?.message ||
          'Impossible de préparer le paiement.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Retour à une étape précédente
   */
  function retourEtape(numero) {
    nettoyerMessages();

    setEtape(numero);

    scrollTop();
  }

  /*
   * Paiement réussi
   */
  function paiementTermine(resultat) {
    console.log(
      'Paiement légalisation terminé :',
      resultat
    );

    const date = resultat?.date
      ? new Date(resultat.date)
      : new Date();

    setTransaction(
      resultat?.transaction ||
        `LEG-TX-${Date.now()}`
    );

    setDateDepot(
      date.toLocaleDateString(
        'fr-FR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      )
    );

    setPaiementReussi(true);

    setMessage(
      'Votre paiement a été confirmé avec succès.'
    );

    setEtape(4);

    scrollTop();
  }

  /*
   * ÉTAPE 1
   */
  function renderEtape1() {
    return (
      <form
        className="legalisation-form"
        onSubmit={
          continuerVersDocuments
        }
      >
        <div className="form-section">

          <div className="section-title">
            <FileText size={22} />

            <div>
              <h2>
                Informations du document
              </h2>

              <p>
                Renseignez les informations
                concernant le document à
                légaliser.
              </p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>
                Type de document
              </label>

              <select
                value={typeDocument}
                onChange={(e) =>
                  setTypeDocument(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Sélectionner un document
                </option>

                <option value="diplome">
                  Diplôme
                </option>

                <option value="attestation">
                  Attestation
                </option>

                <option value="releve">
                  Relevé de notes
                </option>

                <option value="certificat">
                  Certificat
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Année d'obtention
              </label>

              <input
                type="number"
                min="1950"
                max={
                  new Date().getFullYear()
                }
                placeholder="Ex : 2025"
                value={anneeObtention}
                onChange={(e) =>
                  setAnneeObtention(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Nombre de copies
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={nombreCopies}
                onChange={(e) =>
                  setNombreCopies(
                    Math.max(
                      1,
                      Number(
                        e.target.value || 1
                      )
                    )
                  )
                }
              />
            </div>

          </div>

          <div className="price-box">
            <span>
              Montant à payer
            </span>

            <strong>
              {montantTotal.toLocaleString(
                'fr-FR'
              )}{' '}
              FCFA
            </strong>
          </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              window.history.back()
            }
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <button
            type="submit"
            className="btn-primary"
          >
            Continuer
            <ArrowRight size={18} />
          </button>

        </div>
      </form>
    );
  }

  /*
   * ÉTAPE 2
   */
  function renderEtape2() {
    return (
      <div className="legalisation-form">

        <div className="form-section">

          <div className="section-title">
            <Upload size={22} />

            <div>
              <h2>
                Documents justificatifs
              </h2>

              <p>
                Ajoutez les documents
                nécessaires à votre demande.
              </p>
            </div>
          </div>

          <label className="upload-zone">

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={ajouterDocuments}
              hidden
            />

            <Upload size={34} />

            <strong>
              Cliquez pour ajouter vos
              documents
            </strong>

            <span>
              PDF, JPG ou PNG — 5 Mo
              maximum par fichier
            </span>

          </label>

          {documents.length > 0 && (
            <div className="documents-list">

              {documents.map(
                (file, index) => (
                  <div
                    className="document-item"
                    key={`${file.name}-${index}`}
                  >

                    <div className="document-icon">
                      <FileText size={20} />
                    </div>

                    <div className="document-info">
                      <strong>
                        {file.name}
                      </strong>

                      <span>
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{' '}
                        Mo
                      </span>
                    </div>

                    <button
                      type="button"
                      className="delete-document"
                      onClick={() =>
                        supprimerDocument(
                          index
                        )
                      }
                    >
                      <X size={18} />
                    </button>

                  </div>
                )
              )}

            </div>
          )}

          <div className="documents-counter">
            {documents.length} document
            {documents.length > 1
              ? 's'
              : ''}{' '}
            ajouté
            {documents.length > 1
              ? 's'
              : ''}
          </div>

          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={certification}
              onChange={(e) =>
                setCertification(
                  e.target.checked
                )
              }
            />

            <span>
              Je certifie que les
              informations fournies sont
              exactes et que les documents
              transmis sont authentiques.
            </span>

          </label>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              retourEtape(1)
            }
            disabled={loading}
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={
              continuerVersPaiement
            }
            disabled={loading}
          >
            {loading ? (
              'Préparation...'
            ) : (
              <>
                Continuer vers le paiement
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </div>

      </div>
    );
  }

  /*
   * ÉTAPE 3
   *
   * Paiement exclusivement dédié
   * à la légalisation.
   */
  function renderEtape3() {
    return (
      <LegalisationPaiement
        demandeId={demandeId}
        reference={reference}
        montant={montantTotal}
        onBack={() =>
          retourEtape(2)
        }
        onSuccess={paiementTermine}
      />
    );
  }

  /*
   * ÉTAPE 4
   */
  function renderEtape4() {
    return (
      <div className="confirmation-card">

        <div className="confirmation-icon">
          <Check size={42} />
        </div>

        <h2>
          Demande confirmée
        </h2>

        <p>
          Votre demande de légalisation
          a été enregistrée et votre
          paiement a été confirmé.
        </p>

        <div className="confirmation-details">

          <div>
            <span>
              Référence
            </span>

            <strong>
              {reference}
            </strong>
          </div>

          <div>
            <span>
              Transaction
            </span>

            <strong>
              {transaction}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {dateDepot}
            </strong>
          </div>

          <div>
            <span>
              Montant
            </span>

            <strong>
              {montantTotal.toLocaleString(
                'fr-FR'
              )}{' '}
              FCFA
            </strong>
          </div>

        </div>

        <div className="confirmation-actions">

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              (window.location.href =
                '/mes-demandes')
            }
          >
            Voir mes demandes
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              (window.location.href = '/')
            }
          >
            Retour à l'accueil
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="legalisation-page">

      <div className="legalisation-container">

        {/* EN-TÊTE */}
        <div className="page-header">

          <div className="header-icon">
            <FileText size={30} />
          </div>

          <div>
            <h1>
              Demande de légalisation
            </h1>

            <p>
              Faites légaliser vos
              documents administratifs en
              quelques étapes.
            </p>
          </div>

        </div>

        {/* BARRE DE PROGRESSION */}
        <div className="steps-container">

          <div
            className={
              etape >= 1
                ? 'step active'
                : 'step'
            }
          >
            <div className="step-number">
              {etape > 1 ? (
                <Check size={18} />
              ) : (
                '1'
              )}
            </div>

            <span>
              Informations
            </span>
          </div>

          <div
            className={
              etape >= 2
                ? 'step active'
                : 'step'
            }
          >
            <div className="step-number">
              {etape > 2 ? (
                <Check size={18} />
              ) : (
                '2'
              )}
            </div>

            <span>
              Documents
            </span>
          </div>

          <div
            className={
              etape >= 3
                ? 'step active'
                : 'step'
            }
          >
            <div className="step-number">
              {etape > 3 ? (
                <Check size={18} />
              ) : (
                '3'
              )}
            </div>

            <span>
              Paiement
            </span>
          </div>

          <div
            className={
              etape >= 4
                ? 'step active'
                : 'step'
            }
          >
            <div className="step-number">
              {etape >= 4 ? (
                <Check size={18} />
              ) : (
                '4'
              )}
            </div>

            <span>
              Confirmation
            </span>
          </div>

        </div>

        {/* ERREUR */}
        {error && (
          <div className="alert alert-error">
            <X size={20} />
            <span>
              {error}
            </span>
          </div>
        )}

        {/* SUCCÈS */}
        {message && (
          <div className="alert alert-success">
            <CheckCircle2 size={20} />
            <span>
              {message}
            </span>
          </div>
        )}

        {/* CONTENU */}
        {etape === 1 &&
          renderEtape1()}

        {etape === 2 &&
          renderEtape2()}

        {etape === 3 &&
          renderEtape3()}

        {etape === 4 &&
          paiementReussi &&
          renderEtape4()}

      </div>
    </div>
  );
}