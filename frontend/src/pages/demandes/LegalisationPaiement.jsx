import { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api.js';
import './LegalisationPaiement.css';

export default function LegalisationPaiement({
  demandeId,
  reference,
  montant,
  onSuccess,
  onBack,
}) {
  const [operateur, setOperateur] = useState('MTN');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function payer(e) {
    e.preventDefault();

    setError('');

    if (!telephone.trim()) {
      setError(
        'Veuillez saisir votre numéro Mobile Money.'
      );
      return;
    }

    if (!demandeId) {
      setError(
        "L'identifiant de la demande est introuvable."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        'Paiement légalisation :',
        {
          demandeId,
          operateur,
          telephone,
          montant,
        }
      );

      /*
       * Paiement uniquement pour la légalisation
       */
      const response = await api.post(
        '/paiements',
        {
          demandeId: Number(demandeId),
          operateur: operateur === 'AIRTEL' ? 'Airtel' : operateur,
          telephone: telephone.trim(),
          montant: Number(montant),
          simulation: 'confirme',
        }
      );

      console.log(
        'Réponse paiement légalisation :',
        response
      );

      const paiement =
        response?.paiement ||
        response?.data?.paiement ||
        response?.data ||
        response;

      if (
        paiement?.statut &&
        paiement.statut !== 'confirme'
      ) {
        throw new Error(
          `Le paiement n'est pas confirmé. Statut : ${paiement.statut}`
        );
      }

      /*
       * Paiement réussi
       */
      onSuccess?.({
        transaction:
          paiement?.transaction_ref ||
          paiement?.reference ||
          paiement?.transaction ||
          `LEG-TX-${Date.now()}`,

        date:
          paiement?.created_at ||
          new Date().toISOString(),

        paiement,
      });

    } catch (err) {
      console.error(
        'Erreur paiement légalisation :',
        err
      );

      setError(
        err?.message ||
          'Le paiement de la légalisation a échoué.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="legalisation-paiement">
      <div className="paiement-card">

        <div className="paiement-header">
          <div className="paiement-icon">
            <CreditCard size={30} />
          </div>

          <div>
            <h2>Paiement de la légalisation</h2>
            <p>
              Effectuez le paiement pour finaliser
              votre demande.
            </p>
          </div>
        </div>

        <div className="paiement-reference">
          <div>
            <span>Référence</span>
            <strong>
              {reference || '---'}
            </strong>
          </div>

          <div>
            <span>Montant</span>
            <strong>
              {Number(montant || 0).toLocaleString(
                'fr-FR'
              )}{' '}
              FCFA
            </strong>
          </div>
        </div>

        <form onSubmit={payer}>

          <div className="paiement-section">
            <h3>
              Choisissez votre opérateur
            </h3>

            <div className="operateurs">

              <button
                type="button"
                className={
                  operateur === 'MTN'
                    ? 'operateur active'
                    : 'operateur'
                }
                onClick={() =>
                  setOperateur('MTN')
                }
              >
                <span className="operateur-title">
                  MTN
                </span>

                <span>
                  Mobile Money
                </span>
              </button>

              <button
                type="button"
                className={
                  operateur === 'AIRTEL'
                    ? 'operateur active'
                    : 'operateur'
                }
                onClick={() =>
                  setOperateur('AIRTEL')
                }
              >
                <span className="operateur-title">
                  Airtel
                </span>

                <span>
                  Money
                </span>
              </button>

            </div>
          </div>

          <div className="form-group">
            <label>
              Numéro Mobile Money
            </label>

            <input
              type="tel"
              value={telephone}
              onChange={(e) =>
                setTelephone(e.target.value)
              }
              placeholder="Ex : 06 123 45 67"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="paiement-error">
              <span>!</span>
              {error}
            </div>
          )}

          <div className="paiement-info">
            <CheckCircle2 size={20} />

            <span>
              Le paiement est actuellement simulé
              pour les besoins du développement.
            </span>
          </div>

          <div className="paiement-actions">

            <button
              type="button"
              className="btn-retour"
              onClick={onBack}
              disabled={loading}
            >
              <ArrowLeft size={18} />
              Retour
            </button>

            <button
              type="submit"
              className="btn-payer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />
                  Paiement en cours...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Payer{' '}
                  {Number(montant || 0).toLocaleString(
                    'fr-FR'
                  )}{' '}
                  FCFA
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
