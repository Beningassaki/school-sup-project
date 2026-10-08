// =====================================================
// US4 : Créer une demande de pré-inscription
// =====================================================
// RESPONSABLE : Dreche NDONGALA
// ROUTE : /demandes/nouvelle/pre-inscription
// API : POST /api/demandes (type: 'pre_inscription')
// =====================================================

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  Mail,
  Phone,
  Upload,
  Wallet,
} from "lucide-react";

import { api } from "../../services/api.js";
import "./PreInscriptionPage.css";

const STEPS = [
  "Choix",
  "Profil",
  "Documents",
  "Paiement",
  "Confirmation",
];

const DOCUMENT_TYPES = [
  {
    key: "diplome",
    label: "Diplôme du baccalauréat",
  },
  {
    key: "releve",
    label: "Relevé de notes",
  },
  {
    key: "identite",
    label: "Pièce d’identité",
  },
];

function formatBytes(bytes) {
  if (!bytes) return "";

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function StepProgress({ currentStep }) {
  return (
    <>
      <div className="preinscription-progress">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const completed = number < currentStep;
          const active = number === currentStep;

          return (
            <div
              key={label}
              className={`progress-step ${
                active ? "active" : ""
              } ${completed ? "completed" : ""}`}
            >
              <div className="progress-step-top">
                <span className="progress-circle">
                  {completed ? <Check size={15} /> : number}
                </span>

                <span>{label}</span>
              </div>

              <div className="progress-line" />
            </div>
          );
        })}
      </div>

      <p className="progress-caption">
        Étape {currentStep} sur 5 · {STEPS[currentStep - 1]} ·{" "}
        {currentStep * 20} %
      </p>
    </>
  );
}

function PaymentProgress({ currentStep }) {
  const steps = ["Récapitulatif", "Moyen", "Validation"];

  return (
    <>
      <div className="payment-progress">
        {steps.map((label, index) => {
          const number = index + 1;
          const completed = number < currentStep;
          const active = number === currentStep;

          return (
            <div
              key={label}
              className={`payment-progress-item ${
                active ? "active" : ""
              } ${completed ? "completed" : ""}`}
            >
              <div className="payment-progress-title">
                <span>
                  {completed ? <Check size={14} /> : number}
                </span>

                {label}
              </div>

              <div className="payment-progress-line" />
            </div>
          );
        })}
      </div>

      <p className="progress-caption">
        Étape {currentStep} sur 3 · {steps[currentStep - 1]} ·{" "}
        {Math.round((currentStep / 3) * 100)} %
      </p>
    </>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="form-field">
      <span className="form-label">
        {label} {required && <span>*</span>}
      </span>

      {children}
    </label>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
}) {
  return (
    <Field label={label} required={required}>
      <div className="select-wrapper">
        <select value={value} onChange={onChange}>
          <option value="">Sélectionner</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown size={18} />
      </div>
    </Field>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function ChoiceCard({ formation }) {
  return (
    <div className="choice-card">
      <h2>Votre choix</h2>

      <SummaryRow
        label="Formation"
        value={formation?.filiere || formation?.nom}
      />

      <SummaryRow
        label="Durée"
        value={
          formation?.duree
            ? `${formation.duree} · ${
                formation?.modalite || "Présentiel"
              }`
            : "—"
        }
      />

      <SummaryRow
        label="Frais"
        value={
          formation?.frais
            ? `${Number(formation.frais).toLocaleString("fr-FR")} FCFA`
            : "—"
        }
      />

      {formation?.id && (
        <Link to={`/formations/${formation.id}`}>
          Consulter la fiche de formation
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

function DossierCard({ demande, form }) {
  return (
    <div className="choice-card">
      <h2>Votre dossier</h2>

      <SummaryRow
        label="Référence"
        value={demande?.reference}
      />

      <SummaryRow
        label="Année"
        value={form.annee}
      />

      <SummaryRow
        label="Étape"
        value="Informations personnelles"
      />
    </div>
  );
}

function WarningCard({ children }) {
  return (
    <div className="warning-card">
      <Info size={18} />
      <p>{children}</p>
    </div>
  );
}

export default function PreInscriptionPage() {
  const [searchParams] = useSearchParams();

  const formationId = searchParams.get("formation");

  const [formation, setFormation] = useState(null);
  const [demande, setDemande] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentStep, setPaymentStep] = useState(1);

  const [loading, setLoading] = useState(true);
  const [creatingDemand, setCreatingDemand] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    annee: "2026–2027",
    niveau: "",
    faculte: "",

    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "Congolaise",

    email: "",
    telephone: "",
    adresse: "",

    diplome: "",
    anneeDiplome: "",

    documents: {
      diplome: null,
      releve: null,
      identite: null,
    },

    certification: false,

    operateur: "MTN",
    numeroPaiement: "",
  });

  // =====================================================
  // CHARGEMENT DE LA FORMATION
  // =====================================================

  useEffect(() => {
    if (!formationId) return undefined;

    let mounted = true;

    async function loadFormation() {
      try {
        setLoading(true);
        setError("");

        const data = await api.get(
          `/formations/${formationId}`
        );

        if (!mounted) return;

        setFormation(data);

        setForm((previous) => ({
          ...previous,

          faculte:
            data?.faculte ||
            data?.faculty ||
            "",

          niveau:
            data?.niveau ||
            data?.level ||
            "",
        }));
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            "Impossible de récupérer la formation."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFormation();

    return () => {
      mounted = false;
    };
  }, [formationId]);

  // =====================================================
  // MISE À JOUR D'UN CHAMP
  // =====================================================

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // =====================================================
  // CRÉATION DU DOSSIER
  // =====================================================

  async function createDemand() {
    if (demande) {
      setCurrentStep(2);
      return;
    }

    if (!formation?.id) {
      setError("Formation introuvable.");
      return;
    }

    if (!form.annee || !form.faculte || !form.niveau) {
      setError(
        "Veuillez compléter les informations de formation."
      );
      return;
    }

    try {
      setCreatingDemand(true);
      setError("");

      /*
       * Création de la demande.
       *
       * IMPORTANT :
       * Le backend attend :
       * - type
       * - objet
       * - informations
       * - pieces
       *
       * Le montant de la formation est enregistré
       * dans informations.montantTotal.
       */

      const montantFormation = Number(formation.frais) || 0;

      if (montantFormation <= 0) {
        setError(
          "Le montant de la formation est invalide."
        );
        return;
      }

      const response = await api.post("/demandes", {
        type: "pre_inscription",

        objet: `Pré-inscription ${
          formation.filiere ||
          formation.nom ||
          ""
        }`,

        informations: {
          formationId: formation.id,
          formation_id: formation.id,

          filiere:
            formation.filiere ||
            formation.nom ||
            "",

          niveau: form.niveau,

          faculte: form.faculte,

          annee: form.annee,

          montantTotal: montantFormation,
        },

        pieces: [],
      });

      /*
       * Le backend renvoie :
       * {
       *   succes: true,
       *   data: {...}
       * }
       *
       * On récupère donc data.
       */

      const nouvelleDemande =
        response?.data || response;

      setDemande(nouvelleDemande);

      setCurrentStep(2);
    } catch (err) {
      setError(
        err?.message ||
          "Impossible de créer la demande de pré-inscription."
      );
    } finally {
      setCreatingDemand(false);
    }
  }

  // =====================================================
  // PAIEMENT
  // =====================================================

  async function confirmerPaiement() {
    if (!demande?.id) {
      setError(
        "La demande doit être enregistrée avant le paiement."
      );
      return;
    }

    if (!form.numeroPaiement.trim()) {
      setError(
        "Veuillez saisir votre numéro Mobile Money."
      );
      return;
    }

    try {
      setCreatingDemand(true);
      setError("");

      await api.post("/paiements", {
        demandeId: Number(demande.id),
        operateur: form.operateur,
        telephone: form.numeroPaiement.trim(),
        simulation: "confirme",
      });

      setCurrentStep(5);
    } catch (err) {
      setError(
        err?.message ||
          "Le paiement de démonstration a échoué."
      );
    } finally {
      setCreatingDemand(false);
    }
  }

  // =====================================================
  // ÉTAPE 1
  // =====================================================

  function renderStep1() {
    const facultyOptions = formation?.faculte
      ? [formation.faculte]
      : [];

    const levelOptions = formation?.niveau
      ? [formation.niveau]
      : [];

    return (
      <>
        <div className="page-back">
          <button
            type="button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={17} />
            Nouvelle démarche
          </button>
        </div>

        <div className="page-eyebrow">
          03 · DÉMARCHES / PRÉ-INSCRIPTION
        </div>

        <h1>Choisissez votre formation</h1>

        <p className="page-intro">
          Sélectionnez d’abord une faculté, puis la filière
          qui vous intéresse.
        </p>

        <StepProgress currentStep={1} />

        <div className="step-layout">
          <section className="card">
            <h2>Faculté et filière</h2>

            <div className="form-grid two-columns">
              <SelectField
                label="Année universitaire"
                required
                value={form.annee}
                onChange={(e) =>
                  updateForm("annee", e.target.value)
                }
                options={["2026–2027"]}
              />

              <SelectField
                label="Niveau demandé"
                required
                value={form.niveau}
                onChange={(e) =>
                  updateForm("niveau", e.target.value)
                }
                options={levelOptions}
              />
            </div>

            <SelectField
              label="Faculté"
              required
              value={form.faculte}
              onChange={(e) =>
                updateForm("faculte", e.target.value)
              }
              options={facultyOptions}
            />

            <Field label="Filière" required>
              <input
                value={
                  formation?.filiere ||
                  formation?.nom ||
                  ""
                }
                readOnly
              />
            </Field>

            <Field label="Frais de formation">
              <input
                value={
                  formation?.frais
                    ? `${Number(
                        formation.frais
                      ).toLocaleString("fr-FR")} FCFA`
                    : ""
                }
                readOnly
              />
            </Field>

            <p className="required-note">
              * Champs obligatoires
            </p>
          </section>

          <aside>
            <ChoiceCard formation={formation} />

            <WarningCard>
              Formation et calendrier d’exemple à valider.
              La pré-inscription ne garantit pas l’admission.
            </WarningCard>
          </aside>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="step-actions">
          <button
            type="button"
            className="draft-button"
          >
            Enregistrer le brouillon
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={createDemand}
            disabled={creatingDemand}
          >
            {creatingDemand
              ? "Création du dossier..."
              : "Continuer vers mon profil"}

            {!creatingDemand && (
              <ArrowRight size={18} />
            )}
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // ÉTAPE 2
  // =====================================================

  function renderStep2() {
    return (
      <>
        <div className="page-back">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
          >
            <ArrowLeft size={17} />
            Choix de formation
          </button>
        </div>

        <div className="page-eyebrow">
          03 · DÉMARCHES / PRÉ-INSCRIPTION
        </div>

        <h1>Vos informations personnelles</h1>

        <p className="page-intro">
          Dossier{" "}
          {demande?.reference || "PRE-2026-XXXX"} ·{" "}
          {formation?.filiere || formation?.nom} · Année{" "}
          {form.annee}.
        </p>

        <StepProgress currentStep={2} />

        <div className="step-layout">
          <div>
            <section className="card">
              <h2>Identité</h2>

              <div className="form-grid two-columns">
                <Field label="Nom" required>
                  <input
                    value={form.nom}
                    onChange={(e) =>
                      updateForm("nom", e.target.value)
                    }
                  />
                </Field>

                <Field label="Prénom" required>
                  <input
                    value={form.prenom}
                    onChange={(e) =>
                      updateForm(
                        "prenom",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Date de naissance"
                  required
                >
                  <div className="input-with-icon">
                    <input
                      type="date"
                      value={form.dateNaissance}
                      onChange={(e) =>
                        updateForm(
                          "dateNaissance",
                          e.target.value
                        )
                      }
                    />

                    <CalendarDays size={18} />
                  </div>
                </Field>

                <Field
                  label="Lieu de naissance"
                  required
                >
                  <input
                    value={form.lieuNaissance}
                    onChange={(e) =>
                      updateForm(
                        "lieuNaissance",
                        e.target.value
                      )
                    }
                  />
                </Field>
              </div>

              <SelectField
                label="Nationalité"
                required
                value={form.nationalite}
                onChange={(e) =>
                  updateForm(
                    "nationalite",
                    e.target.value
                  )
                }
                options={[
                  "Congolaise",
                  "Gabonaise",
                  "Camerounaise",
                  "Centrafricaine",
                  "Autre",
                ]}
              />
            </section>

            <section className="card">
              <h2>Coordonnées</h2>

              <div className="form-grid two-columns">
                <Field
                  label="Adresse email"
                  required
                >
                  <div className="input-with-icon">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateForm(
                          "email",
                          e.target.value
                        )
                      }
                    />

                    <Mail size={18} />
                  </div>
                </Field>

                <Field label="Téléphone" required>
                  <div className="input-with-icon">
                    <input
                      value={form.telephone}
                      onChange={(e) =>
                        updateForm(
                          "telephone",
                          e.target.value
                        )
                      }
                    />

                    <Phone size={18} />
                  </div>
                </Field>
              </div>

              <Field
                label="Adresse de résidence"
                required
              >
                <input
                  value={form.adresse}
                  onChange={(e) =>
                    updateForm(
                      "adresse",
                      e.target.value
                    )
                  }
                />
              </Field>
            </section>

            <section className="card">
              <h2>Parcours scolaire</h2>

              <div className="form-grid two-columns">
                <SelectField
                  label="Diplôme obtenu"
                  required
                  value={form.diplome}
                  onChange={(e) =>
                    updateForm(
                      "diplome",
                      e.target.value
                    )
                  }
                  options={[
                    "Baccalauréat · Série C",
                    "Baccalauréat · Série D",
                    "Baccalauréat · Série A",
                    "Autre",
                  ]}
                />

                <SelectField
                  label="Année d’obtention"
                  required
                  value={form.anneeDiplome}
                  onChange={(e) =>
                    updateForm(
                      "anneeDiplome",
                      e.target.value
                    )
                  }
                  options={[
                    "2026",
                    "2025",
                    "2024",
                    "2023",
                  ]}
                />
              </div>
            </section>
          </div>

          <aside>
            <DossierCard
              demande={demande}
              form={form}
            />

            <ChoiceCard formation={formation} />
          </aside>
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="draft-button"
          >
            Enregistrer le brouillon
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentStep(3)}
          >
            Continuer vers les documents
            <ArrowRight size={18} />
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // DOCUMENTS
  // =====================================================

  function handleFileChange(key, file) {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format accepté : PDF, JPG ou PNG."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "La taille maximale est de 5 Mo par document."
      );
      return;
    }

    setError("");

    setForm((previous) => ({
      ...previous,

      documents: {
        ...previous.documents,
        [key]: file,
      },
    }));
  }

  function renderStep3() {
    const documentCount = Object.values(
      form.documents
    ).filter(Boolean).length;

    return (
      <>
        <div className="page-back">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
          >
            <ArrowLeft size={17} />
            Informations personnelles
          </button>
        </div>

        <div className="page-eyebrow">
          03 · DÉMARCHES / PRÉ-INSCRIPTION
        </div>

        <h1>Complétez votre dossier</h1>

        <p className="page-intro">
          Dossier{" "}
          {demande?.reference || "PRE-2026-XXXX"} · Ajoutez
          les pièces nécessaires à votre candidature.
        </p>

        <StepProgress currentStep={3} />

        <div className="step-layout">
          <div>
            <div className="info-banner">
              <Info size={18} />

              <span>
                Pièces et formats indicatifs à valider :
                PDF, JPG ou PNG, 5 Mo maximum par document.
              </span>
            </div>

            {DOCUMENT_TYPES.map((document) => {
              const file =
                form.documents[document.key];

              return (
                <section
                  className="document-card"
                  key={document.key}
                >
                  <div className="document-header">
                    <strong>
                      {document.label}{" "}
                      <span>*</span>
                    </strong>

                    {file && (
                      <CheckCircle2
                        size={20}
                        className="success-icon"
                      />
                    )}
                  </div>

                  {file ? (
                    <div className="uploaded-file">
                      <div className="file-type">
                        {file.type ===
                        "application/pdf"
                          ? "PDF"
                          : "IMG"}
                      </div>

                      <div className="file-info">
                        <strong>
                          {file.name}
                        </strong>

                        <span>
                          {formatBytes(file.size)} ·
                          Importé
                        </span>
                      </div>

                      <label className="replace-button">
                        Remplacer

                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              document.key,
                              e.target.files?.[0]
                            )
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="upload-zone">
                      <Upload size={20} />

                      <span>
                        Ajouter le document
                      </span>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            document.key,
                            e.target.files?.[0]
                          )
                        }
                      />
                    </label>
                  )}
                </section>
              );
            })}

            <label className="certification">
              <input
                type="checkbox"
                checked={form.certification}
                onChange={(e) =>
                  updateForm(
                    "certification",
                    e.target.checked
                  )
                }
              />

              <span>
                Je certifie l’exactitude de mes
                informations et l’authenticité des
                documents transmis.
              </span>
            </label>
          </div>

          <aside>
            <div className="choice-card">
              <h2>Récapitulatif</h2>

              <SummaryRow
                label="Référence"
                value={
                  demande?.reference ||
                  "PRE-2026-XXXX"
                }
              />

              <SummaryRow
                label="Formation"
                value={
                  formation?.filiere ||
                  formation?.nom
                }
              />

              <SummaryRow
                label="Frais"
                value={
                  formation?.frais
                    ? `${Number(
                        formation.frais
                      ).toLocaleString(
                        "fr-FR"
                      )} FCFA`
                    : "À valider"
                }
              />
            </div>

            <div className="success-banner">
              <CheckCircle2 size={18} />

              {documentCount} documents sur 3 ajoutés.
            </div>
          </aside>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="step-actions">
          <button
            type="button"
            className="draft-button"
          >
            Enregistrer le brouillon
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              if (documentCount !== 3) {
                setError(
                  "Veuillez ajouter les 3 documents requis."
                );
                return;
              }

              if (!form.certification) {
                setError(
                  "Veuillez confirmer l’authenticité des documents transmis."
                );
                return;
              }

              setError("");
              setCurrentStep(4);
              setPaymentStep(1);
            }}
          >
            Continuer vers le paiement
            <ArrowRight size={18} />
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // PAIEMENT
  // =====================================================

  function renderStep4() {
    const amount = formation?.frais
      ? `${Number(
          formation.frais
        ).toLocaleString("fr-FR")} FCFA`
      : "0 FCFA";

    return (
      <>
        <div className="page-back">
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
          >
            <ArrowLeft size={17} />
            Récapitulatif
          </button>
        </div>

        <div className="page-eyebrow">
          04 · PAIEMENT MOBILE MONEY
        </div>

        <h1>Comment souhaitez-vous payer ?</h1>

        <p className="page-intro">
          Choisissez l’opérateur associé à votre numéro
          de téléphone.
        </p>

        <PaymentProgress
          currentStep={paymentStep}
        />

        {paymentStep === 1 && (
          <div className="payment-layout">
            <section className="card">
              <h2>Récapitulatif</h2>

              <SummaryRow
                label="Formation"
                value={
                  formation?.filiere ||
                  formation?.nom
                }
              />

              <SummaryRow
                label="Année"
                value={form.annee}
              />

              <SummaryRow
                label="Référence"
                value={
                  demande?.reference ||
                  "PRE-2026-XXXX"
                }
              />

              <SummaryRow
                label="Montant"
                value={amount}
              />

              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  setPaymentStep(2)
                }
              >
                Choisir le moyen de paiement
                <ArrowRight size={18} />
              </button>
            </section>

            <div className="amount-card">
              <span>Montant à payer</span>

              <strong>{amount}</strong>

              <small>
                Frais récupérés depuis la formation
              </small>
            </div>
          </div>
        )}

        {paymentStep === 2 && (
          <>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method ${
                  form.operateur === "MTN"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateForm("operateur", "MTN")
                }
              >
                <div className="operator-logo">
                  MTN
                </div>

                <strong>
                  MTN Mobile Money
                </strong>

                <span>
                  Paiement depuis votre téléphone
                </span>

                <span className="radio">
                  {form.operateur === "MTN" && (
                    <span />
                  )}
                </span>
              </button>

              <button
                type="button"
                className={`payment-method ${
                  form.operateur === "Airtel"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateForm(
                    "operateur",
                    "Airtel"
                  )
                }
              >
                <div className="operator-logo">
                  Airtel
                </div>

                <strong>
                  Airtel Money
                </strong>

                <span>
                  Paiement depuis votre téléphone
                </span>

                <span className="radio">
                  {form.operateur === "Airtel" && (
                    <span />
                  )}
                </span>
              </button>

              <div className="amount-card">
                <span>Montant à payer</span>

                <strong>{amount}</strong>

                <small>
                  Frais récupérés depuis la formation
                </small>
              </div>
            </div>

            <div className="payment-layout">
              <section className="card">
                <h2>
                  Votre numéro de paiement
                </h2>

                <Field
                  label={`Numéro ${form.operateur} Money`}
                  required
                >
                  <div className="input-with-icon">
                    <input
                      value={form.numeroPaiement}
                      onChange={(e) =>
                        updateForm(
                          "numeroPaiement",
                          e.target.value
                        )
                      }
                      placeholder="+242 06 123 45 67"
                    />

                    <Phone size={18} />
                  </div>
                </Field>

                <p className="field-help">
                  Le compte Mobile Money doit disposer
                  du montant requis.
                </p>

                <div className="security-banner">
                  <Info size={18} />

                  <span>
                    Ne saisissez jamais votre code secret
                    Mobile Money dans le portail étudiant.
                  </span>
                </div>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    if (!form.numeroPaiement.trim()) {
                      setError(
                        "Veuillez saisir votre numéro de paiement."
                      );
                      return;
                    }

                    setError("");
                    setPaymentStep(3);
                  }}
                >
                  Continuer vers la validation
                  <ArrowRight size={18} />
                </button>
              </section>

              <aside>
                <div className="concerned-card">
                  <h2>
                    Pré-inscription concernée
                  </h2>

                  <SummaryRow
                    label="Formation"
                    value={
                      formation?.filiere ||
                      formation?.nom
                    }
                  />

                  <SummaryRow
                    label="Référence"
                    value={
                      demande?.reference ||
                      "PRE-2026-XXXX"
                    }
                  />

                  <SummaryRow
                    label="Montant"
                    value={amount}
                  />
                </div>
              </aside>
            </div>
          </>
        )}

        {paymentStep === 3 && (
          <div className="payment-validation-layout">
            <section className="card validation-card">
              <div className="validation-icon">
                <Wallet size={28} />
              </div>

              <h2>
                Validez votre paiement
              </h2>

              <p>
                Mode démonstration : aucun débit réel ne
                sera effectué. Une confirmation de test
                sera enregistrée.
              </p>

              <div className="validation-summary">
                <SummaryRow
                  label="Opérateur"
                  value={`${form.operateur} Mobile Money`}
                />

                <SummaryRow
                  label="Numéro"
                  value={form.numeroPaiement}
                />

                <SummaryRow
                  label="Montant"
                  value={amount}
                />
              </div>

              <div className="security-banner">
                <Info size={18} />

                <span>
                  Validez uniquement la demande affichée
                  sur votre téléphone. Ne communiquez
                  jamais votre code secret.
                </span>
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="validation-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setPaymentStep(2)
                  }
                >
                  <ArrowLeft size={17} />
                  Modifier
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={confirmerPaiement}
                  disabled={creatingDemand}
                >
                  {creatingDemand
                    ? "Validation…"
                    : "Simuler le paiement confirmé"}

                  <ArrowRight size={18} />
                </button>
              </div>
            </section>
          </div>
        )}

        {error && paymentStep !== 3 && (
          <div className="form-error">
            {error}
          </div>
        )}
      </>
    );
  }

  // =====================================================
  // ÉTAPE 5
  // =====================================================

  function renderStep5() {
    return (
      <>
        <div className="page-back">
          <Link to="/mes-demandes">
            <ArrowLeft size={17} />
            Mes démarches
          </Link>
        </div>

        <div className="page-eyebrow">
          03 · DÉMARCHES / PRÉ-INSCRIPTION
        </div>

        <h1>Pré-inscription soumise</h1>

        <p className="page-intro">
          {form.prenom || "Candidat"}, votre candidature est
          enregistrée. Conservez votre référence pour le
          suivi.
        </p>

        <StepProgress currentStep={5} />

        <div className="confirmation-layout">
          <section className="card confirmation-card">
            <div className="confirmation-header">
              <div className="confirmation-icon">
                <Check size={30} />
              </div>

              <span className="status-badge">
                Soumis
              </span>
            </div>

            <h2>Pré-inscription</h2>

            <div className="confirmation-details">
              <SummaryRow
                label="Référence"
                value={
                  demande?.reference ||
                  "PRE-2026-XXXX"
                }
              />

              <SummaryRow
                label="Candidat"
                value={`${form.prenom} ${form.nom}`}
              />

              <SummaryRow
                label="Faculté"
                value={form.faculte}
              />

              <SummaryRow
                label="Formation"
                value={
                  formation?.filiere ||
                  formation?.nom
                }
              />

              <SummaryRow
                label="Année"
                value={form.annee}
              />

              <SummaryRow
                label="Dépôt"
                value="Enregistré"
              />

              <SummaryRow
                label="Paiement"
                value={
                  formation?.frais
                    ? `${Number(
                        formation.frais
                      ).toLocaleString(
                        "fr-FR"
                      )} FCFA · Réussi`
                    : "Réussi"
                }
              />

              <SummaryRow
                label="Transaction"
                value="Paiement confirmé"
              />
            </div>
          </section>

          <aside>
            <WarningCard>
              Cette confirmation atteste le dépôt du dossier,
              pas l’admission à la formation.
            </WarningCard>

            <div className="next-card">
              <h2>Et maintenant ?</h2>

              <p>
                Le service concerné examinera vos pièces.
                Consultez Mes demandes pour connaître la
                suite. Aucun délai officiel n’est annoncé ici.
              </p>
            </div>
          </aside>
        </div>

        <div className="confirmation-actions">
          <Link
            className="primary-button"
            to="/mes-demandes"
          >
            Suivre ma pré-inscription
            <ArrowRight size={18} />
          </Link>

          <button
            type="button"
            className="secondary-button"
          >
            Télécharger la confirmation
            <Download size={18} />
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // RENDU
  // =====================================================

  if (!formationId) {
    return (
      <div className="preinscription-page">
        <div className="preinscription-container">
          <div
            className="preinscription-state error"
            role="alert"
          >
            <p>
              Aucune formation n’a été sélectionnée.
            </p>

            <Link to="/formations">
              Choisir une formation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="preinscription-page">
        <div className="preinscription-container">
          <div className="preinscription-state">
            Chargement de la formation...
          </div>
        </div>
      </div>
    );
  }

  if (error && !formation) {
    return (
      <div className="preinscription-page">
        <div className="preinscription-container">
          <div className="preinscription-state error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preinscription-page">
      <div className="preinscription-container">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  );
}