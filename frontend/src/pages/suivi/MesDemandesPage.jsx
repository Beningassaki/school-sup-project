// =====================================================
// US6 : Suivre le statut de mes demandes
// RESPONSABLE : Beni NGASSAKI
// ROUTE : /mes-demandes
// API : GET /api/suivi/mes-demandes
// =====================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from 'lucide-react';

import { api } from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import './MesDemandesPage.css';

function normaliserDemandes(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.demandes)) {
    return result.data.demandes;
  }

  if (Array.isArray(result?.demandes)) {
    return result.demandes;
  }

  return [];
}

function obtenirStatut(demande) {
  return String(
    demande?.statut ||
      demande?.status ||
      demande?.etat ||
      'brouillon'
  ).toLowerCase();
}

function obtenirId(demande) {
  return demande?.id || demande?.demande_id || demande?.demandeId;
}

function obtenirDate(demande) {
  const valeur =
    demande?.created_at ||
    demande?.date_creation ||
    demande?.dateDepot ||
    demande?.date_depot ||
    demande?.submitted_at ||
    demande?.createdAt;

  if (!valeur) {
    return 'Date non disponible';
  }

  const date = new Date(valeur);

  if (Number.isNaN(date.getTime())) {
    return valeur;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function obtenirType(demande) {
  const type = demande?.type || demande?.type_demande || 'autre';

  const types = {
    legalisation: 'Légalisation',
    attestation: 'Attestation',
    certificat: 'Certificat',
    releve: 'Relevé de notes',
    diplome: 'Diplôme',
    pre_inscription: 'Pré-inscription',
    autre: 'Autre demande',
  };

  return types[type] || type;
}

function obtenirReference(demande) {
  if (demande?.reference) {
    return demande.reference;
  }

  const id = obtenirId(demande);

  if (!id) {
    return '—';
  }

  const type = String(demande?.type || '').toLowerCase();

  if (type === 'legalisation') {
    return `LEG-${String(id).padStart(4, '0')}`;
  }

  if (type === 'pre_inscription') {
    return `PRE-${String(id).padStart(4, '0')}`;
  }

  return `DEM-${String(id).padStart(4, '0')}`;
}

function obtenirMotif(demande) {
  return (
    demande?.motif ||
    demande?.motif_refus ||
    demande?.motif_refus ||
    demande?.commentaire_agent ||
    demande?.commentaire ||
    demande?.raison ||
    null
  );
}

function formatMontant(demande) {
  const montant =
    demande?.montant_total ??
    demande?.montantTotal ??
    demande?.montant ??
    demande?.informations?.montantTotal;

  if (montant === undefined || montant === null || montant === '') {
    return null;
  }

  const valeur = Number(montant);

  if (Number.isNaN(valeur)) {
    return `${montant} FCFA`;
  }

  return `${new Intl.NumberFormat('fr-FR').format(valeur)} FCFA`;
}

function peutPayer(statut) {
  return ['soumise', 'acceptee', 'en_attente_paiement'].includes(statut);
}

function peutVoirRecu(statut) {
  return ['payee', 'paye', 'valide', 'acceptee'].includes(statut);
}

function estRefusee(statut) {
  return ['refuse', 'refusee', 'refusée'].includes(statut);
}

function demandeComplement(statut) {
  return [
    'complement',
    'complement_demande',
    'en_attente_complement',
    'a_completer',
  ].includes(statut);
}

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualisation, setActualisation] = useState(false);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');

  const chargerDemandes = useCallback(async (silencieux = false) => {
    if (silencieux) {
      setActualisation(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const result = await api.get('/suivi/mes-demandes');
      setDemandes(normaliserDemandes(result));
    } catch (err) {
      setError(
        err.message ||
          'Une erreur est survenue lors du chargement de vos demandes.'
      );
    } finally {
      setLoading(false);
      setActualisation(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => chargerDemandes(), 0);
    return () => window.clearTimeout(timer);
  }, [chargerDemandes]);

  const compteurs = useMemo(() => {
    return {
      tous: demandes.length,
      brouillon: demandes.filter(
        (demande) => obtenirStatut(demande) === 'brouillon'
      ).length,
      soumise: demandes.filter(
        (demande) => obtenirStatut(demande) === 'en_attente_paiement'
      ).length,
      traitement: demandes.filter(
        (demande) => ['paye', 'en_attente_complement'].includes(obtenirStatut(demande))
      ).length,
      acceptee: demandes.filter(
        (demande) => ['valide', 'acceptee'].includes(obtenirStatut(demande))
      ).length,
      refusee: demandes.filter((demande) =>
        estRefusee(obtenirStatut(demande))
      ).length,
    };
  }, [demandes]);

  const demandesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return demandes.filter((demande) => {
      const statut = obtenirStatut(demande);

      let correspondStatut = true;

      if (filtreStatut === 'brouillon') {
        correspondStatut = statut === 'brouillon';
      } else if (filtreStatut === 'soumise') {
        correspondStatut = statut === 'en_attente_paiement';
      } else if (filtreStatut === 'traitement') {
        correspondStatut = ['paye', 'en_attente_complement'].includes(statut);
      } else if (filtreStatut === 'acceptee') {
        correspondStatut = ['valide', 'acceptee'].includes(statut);
      } else if (filtreStatut === 'refusee') {
        correspondStatut = estRefusee(statut);
      }

      if (!correspondStatut) {
        return false;
      }

      if (!terme) {
        return true;
      }

      const texteRecherche = [
        obtenirReference(demande),
        obtenirType(demande),
        demande?.objet,
        demande?.formation,
        demande?.formation_nom,
        demande?.faculte,
        statut,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return texteRecherche.includes(terme);
    });
  }, [demandes, recherche, filtreStatut]);

  if (loading) {
    return (
      <section className="mes-demandes">
        <div className="mes-demandes__loading">
          <Loader2 className="mes-demandes__spinner" size={34} />
          <h2>Chargement de vos demandes...</h2>
          <p>Nous récupérons vos démarches en cours.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mes-demandes">
      {/* EN-TÊTE */}
      <div className="mes-demandes__header">
        <div>
          <span className="mes-demandes__eyebrow">
            ESPACE ÉTUDIANT
          </span>

          <h1>Mes demandes</h1>

          <p>
            Suivez l'état de toutes vos démarches et accédez aux
            actions disponibles.
          </p>
        </div>

        <button
          type="button"
          className="mes-demandes__refresh"
          onClick={() => chargerDemandes(true)}
          disabled={actualisation}
        >
          <RefreshCw
            size={17}
            className={actualisation ? 'spin' : ''}
          />
          {actualisation ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="mes-demandes__alert mes-demandes__alert--error">
          <AlertCircle size={20} />

          <div>
            <strong>Impossible de charger vos demandes</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* COMPTEURS */}
      <div className="mes-demandes__stats">
        <button
          type="button"
          className={`stat-card ${
            filtreStatut === 'tous' ? 'stat-card--active' : ''
          }`}
          onClick={() => setFiltreStatut('tous')}
        >
          <span className="stat-card__icon">
            <FileText size={21} />
          </span>
          <span>
            <strong>{compteurs.tous}</strong>
            <small>Toutes les demandes</small>
          </span>
        </button>

        <button
          type="button"
          className={`stat-card ${
            filtreStatut === 'brouillon' ? 'stat-card--active' : ''
          }`}
          onClick={() => setFiltreStatut('brouillon')}
        >
          <span className="stat-card__icon">
            <Clock3 size={21} />
          </span>
          <span>
            <strong>{compteurs.brouillon}</strong>
            <small>Brouillons</small>
          </span>
        </button>

        <button
          type="button"
          className={`stat-card ${
            filtreStatut === 'traitement' ? 'stat-card--active' : ''
          }`}
          onClick={() => setFiltreStatut('traitement')}
        >
          <span className="stat-card__icon">
            <Clock3 size={21} />
          </span>
          <span>
            <strong>{compteurs.traitement}</strong>
            <small>En traitement</small>
          </span>
        </button>

        <button
          type="button"
          className={`stat-card ${
            filtreStatut === 'acceptee' ? 'stat-card--active' : ''
          }`}
          onClick={() => setFiltreStatut('acceptee')}
        >
          <span className="stat-card__icon">
            <CheckCircle2 size={21} />
          </span>
          <span>
            <strong>{compteurs.acceptee}</strong>
            <small>Acceptées</small>
          </span>
        </button>

        <button
          type="button"
          className={`stat-card ${
            filtreStatut === 'refusee' ? 'stat-card--active' : ''
          }`}
          onClick={() => setFiltreStatut('refusee')}
        >
          <span className="stat-card__icon">
            <XCircle size={21} />
          </span>
          <span>
            <strong>{compteurs.refusee}</strong>
            <small>Refusées</small>
          </span>
        </button>
      </div>

      {/* OUTILS */}
      <div className="mes-demandes__toolbar">
        <div className="mes-demandes__search">
          <Search size={19} />

          <input
            type="search"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher une demande..."
          />
        </div>

        <Link
          to="/formations"
          className="mes-demandes__new"
        >
          + Nouvelle demande
        </Link>
      </div>

      {/* LISTE */}
      {demandesFiltrees.length === 0 ? (
        <div className="mes-demandes__empty">
          <div className="mes-demandes__empty-icon">
            <FileText size={32} />
          </div>

          <h2>
            {demandes.length === 0
              ? 'Aucune demande'
              : 'Aucun résultat'}
          </h2>

          <p>
            {demandes.length === 0
              ? 'Vous n’avez encore enregistré aucune demande.'
              : 'Aucune demande ne correspond à vos critères de recherche.'}
          </p>

          {demandes.length === 0 && (
            <Link
              to="/formations"
              className="mes-demandes__empty-button"
            >
              Faire une demande
            </Link>
          )}
        </div>
      ) : (
        <div className="mes-demandes__list">
          {demandesFiltrees.map((demande) => {
            const id = obtenirId(demande);
            const statut = obtenirStatut(demande);
            const motif = obtenirMotif(demande);
            const montant = formatMontant(demande);

            return (
              <article
                className="demande-card"
                key={id || obtenirReference(demande)}
              >
                <div className="demande-card__top">
                  <div className="demande-card__reference">
                    <span>Référence</span>
                    <strong>{obtenirReference(demande)}</strong>
                  </div>

                  <StatusBadge statut={statut} />
                </div>

                <div className="demande-card__content">
                  <div className="demande-card__main">
                    <span className="demande-card__type">
                      {obtenirType(demande)}
                    </span>

                    <h2>
                      {demande?.objet ||
                        demande?.formation_nom ||
                        demande?.formation ||
                        'Demande administrative'}
                    </h2>

                    <div className="demande-card__details">
                      <span>
                        <FileText size={16} />
                        Déposée le {obtenirDate(demande)}
                      </span>

                      {montant && (
                        <span>
                          <WalletCards size={16} />
                          {montant}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="demande-card__actions">
                    {statut === 'brouillon' && id && (
                      <Link
                        to={`/mes-demandes/${id}/paiement`}
                        className="demande-card__button demande-card__button--primary"
                      >
                        Continuer
                      </Link>
                    )}

                    {peutPayer(statut) && id && (
                      <Link
                        to={`/mes-demandes/${id}/paiement`}
                        className="demande-card__button demande-card__button--primary"
                      >
                        <WalletCards size={16} />
                        Payer
                      </Link>
                    )}

                    {peutVoirRecu(statut) && id && (
                      <Link
                        to={`/mes-demandes/${id}/recu`}
                        className="demande-card__button"
                      >
                        <FileText size={16} />
                        Voir le reçu
                      </Link>
                    )}

                    {id && (
                      <Link
                        to={`/mes-demandes/${id}/historique`}
                        className="demande-card__button"
                      >
                        <History size={16} />
                        Historique
                      </Link>
                    )}
                  </div>
                </div>

                {estRefusee(statut) && motif && (
                  <div className="demande-card__message demande-card__message--danger">
                    <XCircle size={18} />

                    <div>
                      <strong>Motif du refus</strong>
                      <p>{motif}</p>
                    </div>
                  </div>
                )}

                {demandeComplement(statut) && motif && (
                  <div className="demande-card__message demande-card__message--warning">
                    <AlertCircle size={18} />

                    <div>
                      <strong>Complément demandé</strong>
                      <p>{motif}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
