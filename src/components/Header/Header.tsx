import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

function Header() {
  const { theme, toggleTheme } = useTheme();

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
      <button
        className="header__theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
    </header>
  );
}

export default Header;
