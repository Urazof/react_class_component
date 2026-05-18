import { NavLink } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1 className="header__title">Rick &amp; Morty Explorer</h1>
      <nav className="header__nav">
        <NavLink className="header__nav-link" to="/" end>
          Home
        </NavLink>
        <NavLink className="header__nav-link" to="/about">
          About
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
