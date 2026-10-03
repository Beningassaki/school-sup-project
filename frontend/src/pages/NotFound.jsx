// PAGE 404 : propriétaire ALTY
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>Page introuvable</h1>
      <Link className="btn" to="/">Retour à l'accueil</Link>
    </section>
  );
}