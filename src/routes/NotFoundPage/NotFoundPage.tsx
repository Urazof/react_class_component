import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h2 className="not-found-page__code">404</h2>
      <p className="not-found-page__message">
        Oops! The page you are looking for does not exist.
      </p>
      <Link className="not-found-page__link" to="/">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
