import { Link } from "react-router-dom";
import "./NouvelleDemandePage.css";

export default function NouvelleDemandePage() {
  return (
    <main className="nouvelle-demande">
      <div className="nouvelle-demande-content">
        <h1>Nouvelle demande</h1>

        <p>
          Choisissez le type de demande que vous souhaitez effectuer.
        </p>

        <div className="demande-grid">
          <Link
            to="/demandes/nouvelle/pre-inscription"
            className="demande-option"
          >
            <div className="demande-option-icon">P</div>

            <div>
              <h2>Pré-inscription</h2>
              <p>
                Déposer une demande de pré-inscription à une formation.
              </p>
            </div>

            <span>→</span>
          </Link>

          <Link
            to="/demandes/nouvelle/legalisation"
            className="demande-option"
          >
            <div className="demande-option-icon">L</div>

            <div>
              <h2>Légalisation</h2>
              <p>
                Faire une demande de légalisation de documents.
              </p>
            </div>

            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}