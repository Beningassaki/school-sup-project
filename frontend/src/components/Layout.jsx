// MISE EN PAGE COMMUNE : menu en haut + contenu de la page + pied de page
// Propriétaire : ALTY
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet /> {/* ici s'affiche la page de la route courante */}
      </main>
      <footer className="footer">School-Sup · Université Marien Ngouabi</footer>
    </>
  );
}