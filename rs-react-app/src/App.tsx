import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import MainPage from './pages/MainPage/MainPage';
import AboutPage from './pages/AboutPage/AboutPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Header />
      </header>
      <main className="app__main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
