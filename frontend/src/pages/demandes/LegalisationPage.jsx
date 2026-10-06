// =====================================================
// US3 : DEMANDE DE LÉGALISATION
// RESPONSABLE : Beni NGASSAKI
// =====================================================

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Save,
  Upload,
  X,
} from 'lucide-react';

import { api } from '../../services/api.js';
import './LegalisationPage.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const TYPES_DOCUMENTS = [
  'Diplôme du baccalauréat',
  'Diplôme universitaire',
  'Attestation de réussite',
  'Certificat de scolarité',
  'Relevé de notes',
  'Autre document',
];

const ANNEES = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
];

const NOMBRE_COPIES = [
  '1 copie',
  '2 copies',
  '3 copies',
  '4 copies',
  '5 copies',
];

const ETAPES = [
  'Formulaire',
  'Documents',
  'Paiement',
  'Confirmation',
];

/**
 * Barre de progression
 */
function Progression({ etape }) {
  const pourcentage = etape * 25;

  return (
    <div className="progress-wrapper">
      <div className="progress-steps">
        {ETAPES.map((nom, index) => {
          const numero = index + 1;
          const termine = numero < etape;
          const actif = numero === etape;

          return (
            <div
              className={`progress-step ${
                actif ? 'active' : ''
              } ${termine ? 'completed' : ''}`}
              key={nom}
            >
              <div className="progress-step-top">
                <div className="progress-number">
                  {termine ? (
                    <Check size={16} />
                  ) : (
                    numero
                  )}
                </div>

                <span>{nom}</span>
              </div>

              {numero < ETAPES.length && (
                <div className="progress-line">
                  <span />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-label">
        Étape {etape} sur 4 · {ETAPES[etape - 1]} ·{' '}
        {pourcentage} %
      </div>
    </div>
  );
}

/**
 * PAGE PRINCIPALE
 */
export default function LegalisationPage() {
  const [etape, setEtape] = useState(1);

  // ==============================
  // FORMULAIRE
  // ==============================

  const [typeDocument, setTypeDocument] = useState(
    'Diplôme du baccalauréat'
  );

  const [anneeObtention, setAnneeObtention] = useState(
    '2025'
  );

  const [nombreCopies, setNombreCopies] = useState(
    '2 copies'
  );

  const [objet, setObjet] = useState(
    'Constitution de mon dossier universitaire'
  );

  // ==============================
  // DOCUMENTS
  // ==============================

  const [documents, setDocuments] = useState([]);

  const [certification, setCertification] =
    useState(false);

  // ==============================
  // ETAT
  // ==============================

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');

  const [error, setError] = useState('');

  // ==============================
  // DEMANDE
  // ==============================

  const [demandeId, setDemandeId] = useState(null);

  const [reference, setReference] = useState(
    'LEG-2026-0000'
  );

  // ==============================
  // PAIEMENT
  // ==============================

  const [dateDepot, setDateDepot] = useState('');

  const [transaction, setTransaction] = useState('');

  const [paiementReussi, setPaiementReussi] =
    useState(false);

  const [operateur, setOperateur] = useState('MTN');

  const [telephone, setTelephone] = useState('');

  /**
   * Nombre numérique de copies
   */
  const nombreCopiesValue = useMemo(() => {
    return parseInt(nombreCopies, 10) || 1;
  }, [nombreCopies]);

  /**
   * Tarif provisoire
   *
   * 1 000 FCFA / copie
   */
  const montantUnitaire = 1000;

  const montantTotal =
    montantUnitaire * nombreCopiesValue;

  /**
   * Nettoyage des messages
   */
  function clearMessages() {
    setMessage('');
    setError('');
  }

  /**
   * Retour en haut
   */
  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // =====================================================
  // ETAPE 1 -> ETAPE 2
  // =====================================================

  function continuerVersDocuments() {
    clearMessages();

    if (!typeDocument) {
      setError(
        'Veuillez sélectionner le type de document.'
      );
      return;
    }

    if (!anneeObtention) {
      setError(
        'Veuillez sélectionner l’année d’obtention.'
      );
      return;
    }

    if (!nombreCopies) {
      setError(
        'Veuillez sélectionner le nombre de copies.'
      );
      return;
    }

    setEtape(2);

    scrollTop();
  }

  // =====================================================
  // GESTION DES FICHIERS
  // =====================================================

  function handleFiles(event) {
    clearMessages();

    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const fichiersValides = [];

    for (const file of files) {
      const extension = file.name
        .split('.')
        .pop()
        ?.toLowerCase();

      const typesAutorises = [
        'pdf',
        'jpg',
        'jpeg',
        'png',
      ];

      if (!typesAutorises.includes(extension)) {
        setError(
          `Le fichier "${file.name}" n'est pas autorisé. Utilisez PDF, JPG ou PNG.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `Le fichier "${file.name}" dépasse la taille maximale de 5 Mo.`
        );
        continue;
      }

      fichiersValides.push(file);
    }

    if (fichiersValides.length > 0) {
      setDocuments((anciens) => [
        ...anciens,
        ...fichiersValides,
      ]);
    }

    event.target.value = '';
  }

  /**
   * Supprimer un document
   */
  function supprimerDocument(index) {
    setDocuments((anciens) =>
      anciens.filter(
        (_document, documentIndex) =>
          documentIndex !== index
      )
    );
  }

  /**
   * Taille lisible
   */
  function formatFileSize(size) {
    if (size < 1024) {
      return `${size} octets`;
    }

    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} Ko`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // =====================================================
  // CREATION / ENREGISTREMENT DE LA DEMANDE
  // =====================================================

  async function creerDemande() {
    return api.post('/demandes', {
      type: 'legalisation',
      objet,
      informations: {
        typeDocument,
        anneeObtention,
        nombreCopies,
        montantUnitaire,
        montantTotal,
      },
      pieces: documents.map((file) => ({
        nom: file.name,
        fichier: file.name,
        type_mime: file.type,
        taille: file.size,
      })),
    });
  }

  // =====================================================
  // ENREGISTRER BROUILLON
  // =====================================================

  async function enregistrerBrouillon() {
    clearMessages();

    setLoading(true);

    try {
      const demande = await creerDemande();

      if (demande?.id) {
        setDemandeId(demande.id);

        setReference(
          `LEG-${new Date().getFullYear()}-${String(
            demande.id
          ).padStart(4, '0')}`
        );
      }

      setMessage(
        'Votre brouillon a été enregistré avec succès.'
      );
    } catch (err) {
      setError(
        err.message ||
          'Une erreur est survenue lors de l’enregistrement.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ETAPE 2 -> ETAPE 3
  // =====================================================

  async function continuerVersPaiement() {
    clearMessages();

    /**
     * Deux documents obligatoires :
     *
     * 1. Document à légaliser
     * 2. Pièce d'identité
     */
    if (documents.length < 2) {
      setError(
        'Veuillez ajouter au minimum deux documents : le document à légaliser et une pièce d’identité.'
      );

      return;
    }

    /**
     * Certification obligatoire
     */
    if (!certification) {
      setError(
        'Veuillez confirmer que les pièces transmises sont conformes aux documents originaux.'
      );

      return;
    }

    setLoading(true);

    try {
      let id = demandeId;

      /**
       * Si aucune demande n'a encore été créée,
       * on la crée maintenant.
       */
      if (!id) {
        const demande = await creerDemande();

        id = demande?.id || null;

        setDemandeId(id);

        if (id) {
          setReference(
            `LEG-${new Date().getFullYear()}-${String(
              id
            ).padStart(4, '0')}`
          );
        }
      }

      /**
       * Si la demande existe, on passe simplement
       * à l'écran de paiement.
       */
      setEtape(3);

      scrollTop();
    } catch (err) {
      setError(
        err.message ||
          'Une erreur est survenue lors de la préparation du paiement.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // PAIEMENT
  // =====================================================

  async function effectuerPaiement() {
    clearMessages();

    if (!telephone.trim()) {
      setError('Veuillez saisir votre numéro Mobile Money.');
      return;
    }

    setLoading(true);

    try {
      /**
       * Si la demande n'existe pas encore,
       * on la crée.
       */
      let id = demandeId;

      if (!id) {
        const demande = await creerDemande();

        id = demande?.id || null;

        setDemandeId(id);

        if (id) {
          setReference(
            `LEG-${new Date().getFullYear()}-${String(
              id
            ).padStart(4, '0')}`
          );
        }
      }

      if (!id) {
        throw new Error('La demande n’a pas pu être enregistrée.');
      }

      const resultatPaiement = await api.post('/paiements', {
        demandeId: Number(id),
        operateur,
        telephone: telephone.trim(),
        simulation: 'confirme',
      });

      const paiement = resultatPaiement?.paiement;

      if (paiement?.statut !== 'confirme') {
        throw new Error('Le paiement n’a pas été confirmé.');
      }

      const datePaiement = new Date(paiement.created_at);
      setDateDepot(
        Number.isNaN(datePaiement.getTime())
          ? 'Date non disponible'
          : datePaiement.toLocaleString('fr-FR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })
      );
      setTransaction(paiement.transaction_ref || '');
      setPaiementReussi(true);

      setEtape(4);

      scrollTop();
    } catch (err) {
      setPaiementReussi(false);

      setError(
        err.message ||
          'Le paiement n’a pas pu être effectué.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RETOUR
  // =====================================================

  function retourEtape(numero) {
    clearMessages();

    setEtape(numero);

    scrollTop();
  }

  // =====================================================
  // TELECHARGEMENT CONFIRMATION
  // =====================================================

  function telechargerConfirmation() {
    const contenu = `
UNIVERSITÉ MARIEN NGOUABI
PORTAIL ÉTUDIANT

CONFIRMATION DE DEMANDE DE LÉGALISATION

Référence : ${reference}

Document : ${typeDocument}

Année d'obtention : ${anneeObtention}

Nombre de copies : ${nombreCopies}

Objet : ${objet}

Montant payé : ${montantTotal.toLocaleString(
      'fr-FR'
    )} FCFA

Paiement : ${
      paiementReussi ? 'Réussi' : 'Échec'
    }

Transaction : ${transaction}

Date de dépôt : ${dateDepot}

Votre demande a été soumise avec succès.

Conservez précieusement votre référence :

${reference}
`.trim();

    const blob = new Blob(
      [contenu],
      {
        type: 'text/plain;charset=utf-8',
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
      `confirmation-${reference}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  // =====================================================
  // ETAPE 1
  // =====================================================

  function renderEtape1() {
    return (
      <>
        <button
          type="button"
          className="back-button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} />

          <span>Choix démarche</span>
        </button>

        <div className="page-introduction">
          <div className="breadcrumb">
            03 · DÉMARCHES / LÉGALISATION
          </div>

          <h1>
            Votre demande de légalisation
          </h1>

          <p>
            Précisez le document concerné et le
            nombre de copies souhaitées.
          </p>
        </div>

        <Progression etape={1} />

        <div className="legalisation-content">
          <div className="main-column">
            <section className="form-card">
              <div className="form-section">
                <h2>
                  Document à légaliser
                </h2>

                <div className="form-group">
                  <label htmlFor="typeDocument">
                    Type de document *
                  </label>

                  <select
                    id="typeDocument"
                    value={typeDocument}
                    onChange={(event) =>
                      setTypeDocument(
                        event.target.value
                      )
                    }
                  >
                    {TYPES_DOCUMENTS.map(
                      (type) => (
                        <option
                          value={type}
                          key={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="anneeObtention">
                      Année d’obtention *
                    </label>

                    <select
                      id="anneeObtention"
                      value={anneeObtention}
                      onChange={(event) =>
                        setAnneeObtention(
                          event.target.value
                        )
                      }
                    >
                      {ANNEES.map(
                        (annee) => (
                          <option
                            value={annee}
                            key={annee}
                          >
                            {annee}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="nombreCopies">
                      Nombre de copies *
                    </label>

                    <select
                      id="nombreCopies"
                      value={nombreCopies}
                      onChange={(event) =>
                        setNombreCopies(
                          event.target.value
                        )
                      }
                    >
                      {NOMBRE_COPIES.map(
                        (nombre) => (
                          <option
                            value={nombre}
                            key={nombre}
                          >
                            {nombre}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="objet">
                    Objet de la demande
                  </label>

                  <input
                    id="objet"
                    type="text"
                    value={objet}
                    onChange={(event) =>
                      setObjet(
                        event.target.value
                      )
                    }
                    placeholder="Objet de votre demande"
                  />
                </div>

                <p className="form-help">
                  * Champs obligatoires · Référence :
                  {' '}
                  {reference}
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    enregistrerBrouillon
                  }
                  disabled={loading}
                >
                  <Save size={17} />

                  {loading
                    ? 'Enregistrement...'
                    : 'Enregistrer le brouillon'}
                </button>

                <button
                  type="button"
                  className="continue-button"
                  onClick={
                    continuerVersDocuments
                  }
                  disabled={loading}
                >
                  Continuer vers les documents

                  <ArrowRight size={19} />
                </button>
              </div>
            </section>
          </div>

          <aside className="side-column">
            <div className="student-card">
              <h2>
                Nadia Mavoungou
              </h2>

              <p>
                nadia.mavoungou@example.com
              </p>

              <p>
                +242 06 123 45 67
              </p>
            </div>

            <div className="summary-card">
              <h2>
                Votre demande
              </h2>

              <div className="summary-row">
                <span>Référence</span>

                <strong>
                  {reference}
                </strong>
              </div>

              <div className="summary-row">
                <span>Démarche</span>

                <strong>
                  Légalisation
                </strong>
              </div>

              <div className="summary-row">
                <span>Copies</span>

                <strong>
                  {nombreCopies}
                </strong>
              </div>
            </div>

            <div className="info-card">
              <Info size={18} />

              <span>
                Tarif indicatif : 1 000 FCFA par
                copie, soit{' '}
                {montantTotal.toLocaleString(
                  'fr-FR'
                )}{' '}
                FCFA pour cette demande.
              </span>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // =====================================================
  // ETAPE 2
  // =====================================================

  function renderEtape2() {
    return (
      <>
        <button
          type="button"
          className="back-button"
          onClick={() => retourEtape(1)}
        >
          <ArrowLeft size={18} />

          <span>
            Formulaire légalisation
          </span>
        </button>

        <div className="page-introduction">
          <div className="breadcrumb">
            03 · DÉMARCHES / LÉGALISATION
          </div>

          <h1>
            Ajoutez vos documents
          </h1>

          <p>
            Demande {reference} ·{' '}
            {typeDocument} ·{' '}
            {nombreCopies}.
          </p>
        </div>

        <Progression etape={2} />

        <div className="legalisation-content">
          <div className="main-column">
            <div className="documents-info">
              <Info size={18} />

              <span>
                Ajoutez au minimum deux documents :
                le document à légaliser et votre pièce
                d’identité. PDF, JPG ou PNG · 5 Mo max
                par fichier.
              </span>
            </div>

            {documents.map(
              (file, index) => (
                <div
                  className="document-card"
                  key={`${file.name}-${index}`}
                >
                  <div className="document-card-header">
                    <strong>
                      {index === 0
                        ? typeDocument
                        : index === 1
                        ? 'Pièce d’identité'
                        : 'Document complémentaire'}

                      {index < 2 && ' *'}
                    </strong>

                    <CheckCircle2 size={19} />
                  </div>

                  <div className="document-info">
                    <div className="file-type">
                      {file.name
                        .split('.')
                        .pop()
                        ?.toUpperCase()}
                    </div>

                    <div className="file-details">
                      <strong>
                        {file.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          file.size
                        )}{' '}
                        · Importé
                      </span>
                    </div>

                    <button
                      type="button"
                      className="replace-button"
                      onClick={() =>
                        supprimerDocument(
                          index
                        )
                      }
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )
            )}

            <label
              className="upload-zone"
              htmlFor="documents"
            >
              <Upload size={27} />

              <strong>
                Ajouter un document
              </strong>

              <span>
                PDF, JPG ou PNG · 5 Mo max.
              </span>

              <input
                id="documents"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFiles}
                hidden
              />
            </label>

            <label className="certification">
              <input
                type="checkbox"
                checked={certification}
                onChange={(event) =>
                  setCertification(
                    event.target.checked
                  )
                }
              />

              <span className="checkbox-custom">
                {certification && (
                  <Check size={13} />
                )}
              </span>

              <span>
                Je certifie que les pièces transmises
                sont conformes à mes documents
                originaux.
              </span>
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="text-button"
                onClick={
                  enregistrerBrouillon
                }
                disabled={loading}
              >
                <Save size={17} />

                {loading
                  ? 'Enregistrement...'
                  : 'Enregistrer le brouillon'}
              </button>

              <button
                type="button"
                className="continue-button"
                onClick={
                  continuerVersPaiement
                }
                disabled={loading}
              >
                {loading
                  ? 'Préparation...'
                  : 'Continuer vers le paiement'}

                <ArrowRight size={19} />
              </button>
            </div>
          </div>

          <aside className="side-column">
            <div className="summary-card">
              <h2>
                Dossier de légalisation
              </h2>

              <div className="summary-row">
                <span>Référence</span>

                <strong>
                  {reference}
                </strong>
              </div>

              <div className="summary-row">
                <span>Document</span>

                <strong>
                  {typeDocument}
                </strong>
              </div>

              <div className="summary-row">
                <span>Copies</span>

                <strong>
                  {nombreCopies}
                </strong>
              </div>

              <div className="summary-row">
                <span>Documents</span>

                <strong>
                  {documents.length}
                </strong>
              </div>
            </div>

            <div className="documents-status">
              <CheckCircle2 size={18} />

              <span>
                {documents.length} document
                {documents.length > 1
                  ? 's'
                  : ''}{' '}
                ajouté
                {documents.length > 1
                  ? 's'
                  : ''}.

                {documents.length >= 2
                  ? ' Votre dossier est prêt.'
                  : ' Ajoutez encore un document.'}
              </span>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // =====================================================
  // ETAPE 3
  // =====================================================

  function renderEtape3() {
    return (
      <>
        <button
          type="button"
          className="back-button"
          onClick={() => retourEtape(2)}
        >
          <ArrowLeft size={18} />

          <span>
            Documents
          </span>
        </button>

        <div className="page-introduction">
          <div className="breadcrumb">
            03 · DÉMARCHES / LÉGALISATION
          </div>

          <h1>
            Effectuez votre paiement
          </h1>

          <p>
            Votre dossier est prêt. Vérifiez le
            montant avant de procéder au paiement.
          </p>
        </div>

        <Progression etape={3} />

        <div className="legalisation-content">
          <div className="main-column">
            <section className="payment-card">
              <div className="payment-icon">
                <CheckCircle2 size={34} />
              </div>

              <h2>
                Récapitulatif du paiement
              </h2>

              <div className="payment-summary">
                <div className="payment-row">
                  <span>
                    Démarche
                  </span>

                  <strong>
                    Légalisation
                  </strong>
                </div>

                <div className="payment-row">
                  <span>
                    Document
                  </span>

                  <strong>
                    {typeDocument}
                  </strong>
                </div>

                <div className="payment-row">
                  <span>
                    Année
                  </span>

                  <strong>
                    {anneeObtention}
                  </strong>
                </div>

                <div className="payment-row">
                  <span>
                    Nombre de copies
                  </span>

                  <strong>
                    {nombreCopies}
                  </strong>
                </div>

                <div className="payment-row">
                  <span>
                    Documents transmis
                  </span>

                  <strong>
                    {documents.length}
                  </strong>
                </div>

                <div className="payment-row total">
                  <span>
                    Total à payer
                  </span>

                  <strong>
                    {montantTotal.toLocaleString(
                      'fr-FR'
                    )}{' '}
                    FCFA
                  </strong>
                </div>
              </div>

              <div className="payment-method">
                <div>
                  <strong>
                    Paiement sécurisé
                  </strong>

                  <span>
                    Le paiement sera confirmé avant
                    l’envoi définitif de votre demande.
                  </span>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="legalisation-operateur">Opérateur Mobile Money</label>
                  <select
                    id="legalisation-operateur"
                    value={operateur}
                    onChange={(event) => setOperateur(event.target.value)}
                  >
                    <option value="MTN">MTN</option>
                    <option value="Airtel">Airtel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="legalisation-telephone">Numéro Mobile Money</label>
                  <input
                    id="legalisation-telephone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={telephone}
                    onChange={(event) => setTelephone(event.target.value)}
                    placeholder="+242 06 123 45 67"
                  />
                </div>
              </div>

              <p className="form-help">Mode démonstration : aucun débit réel ne sera effectué.</p>

              <div className="form-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    retourEtape(2)
                  }
                  disabled={loading}
                >
                  <ArrowLeft size={17} />

                  Retour aux documents
                </button>

                <button
                  type="button"
                  className="continue-button"
                  onClick={
                    effectuerPaiement
                  }
                  disabled={loading}
                >
                  {loading
                    ? 'Paiement en cours...'
                    : `Payer ${montantTotal.toLocaleString(
                        'fr-FR'
                      )} FCFA`}

                  <ArrowRight size={19} />
                </button>
              </div>
            </section>
          </div>

          <aside className="side-column">
            <div className="summary-card">
              <h2>
                Votre demande
              </h2>

              <div className="summary-row">
                <span>
                  Référence
                </span>

                <strong>
                  {reference}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Démarche
                </span>

                <strong>
                  Légalisation
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Copies
                </span>

                <strong>
                  {nombreCopies}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Total
                </span>

                <strong>
                  {montantTotal.toLocaleString(
                    'fr-FR'
                  )}{' '}
                  FCFA
                </strong>
              </div>
            </div>

            <div className="info-card">
              <Info size={18} />

              <span>
                Le tarif actuel affiché est de
                1 000 FCFA par copie.
              </span>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // =====================================================
  // ETAPE 4
  // =====================================================

  function renderEtape4() {
    return (
      <>
        <button
          type="button"
          className="back-button"
          onClick={() =>
            window.location.href =
              '/mes-demandes'
          }
        >
          <ArrowLeft size={18} />

          <span>
            Mes démarches
          </span>
        </button>

        <div className="page-introduction confirmation-introduction">
          <div className="breadcrumb">
            03 · DÉMARCHES / LÉGALISATION
          </div>

          <h1>
            Votre demande est soumise
          </h1>

          <p>
            Votre dossier a été transmis.
            Vous pouvez désormais suivre son
            traitement.
          </p>
        </div>

        <Progression etape={4} />

        <div className="confirmation-grid">
          <section className="confirmation-card">
            <div className="confirmation-card-header">
              <div className="confirmation-success-icon">
                <CheckCircle2 size={39} />
              </div>

              <span className="submitted-badge">
                Soumis
              </span>
            </div>

            <h2>
              Légalisation
            </h2>

            <div className="confirmation-details">
              <div className="confirmation-row">
                <span>
                  Référence
                </span>

                <strong>
                  {reference}
                </strong>
              </div>

              <div className="confirmation-row">
                <span>
                  Date de dépôt
                </span>

                <strong>
                  {dateDepot}
                </strong>
              </div>

              <div className="confirmation-row">
                <span>
                  Document
                </span>

                <strong>
                  {typeDocument} ·{' '}
                  {anneeObtention} ·{' '}
                  {nombreCopies}
                </strong>
              </div>

              <div className="confirmation-row">
                <span>
                  Paiement
                </span>

                <strong>
                  {montantTotal.toLocaleString(
                    'fr-FR'
                  )}{' '}
                  FCFA ·{' '}
                  {paiementReussi
                    ? 'Réussi'
                    : 'Échec'}
                </strong>
              </div>

              <div className="confirmation-row">
                <span>
                  Transaction
                </span>

                <strong>
                  {transaction}
                </strong>
              </div>
            </div>
          </section>

          <aside className="confirmation-sidebar">
            <div className="confirmation-alert">
              <CheckCircle2 size={18} />

              <p>
                La confirmation est disponible
                dans votre espace. Conservez
                précieusement votre référence de
                demande.
              </p>
            </div>

            <div className="next-step-card">
              <h2>
                Et maintenant ?
              </h2>

              <p>
                Votre dossier sera vérifié par le
                service concerné. Consultez
                régulièrement son statut depuis
                votre espace étudiant.
              </p>
            </div>
          </aside>
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            className="continue-button"
            onClick={() =>
              (window.location.href =
                '/mes-demandes')
            }
          >
            Suivre ma demande

            <ArrowRight size={19} />
          </button>

          <button
            type="button"
            className="download-confirmation-button"
            onClick={
              telechargerConfirmation
            }
          >
            Télécharger la confirmation

            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // RENDU
  // =====================================================

  return (
    <div className="legalisation-page">
      <div className="legalisation-container">

        {/* Messages */}
        {error && (
          <div className="alert error">
            <X size={18} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError('')
              }
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {message && (
          <div className="alert success">
            <CheckCircle2 size={18} />

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage('')
              }
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Etape actuelle */}
        {etape === 1 && renderEtape1()}

        {etape === 2 && renderEtape2()}

        {etape === 3 && renderEtape3()}

        {etape === 4 && renderEtape4()}
      </div>

      <footer className="legalisation-footer">
        <span>
          Maquette • données d’exemple à valider.
          Formations, frais, délais et conditions
          non officiels.
        </span>

        <strong>
          Besoin d’aide ? Contacter l’assistance
        </strong>
      </footer>
    </div>
  );
}
