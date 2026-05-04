import { Component } from 'react';
import { fetchCharacters } from './api/rickmorty';
import type { Character } from './api/rickmorty';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
import CardList from './components/CardList/CardList';
import Spinner from './components/Spinner/Spinner';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ThrowErrorButton from './components/ErrorBoundary/ThrowErrorButton';
import './App.css';

interface AppState {
  characters: Character[];
  isLoading: boolean;
  error: string | null;
}

class App extends Component<object, AppState> {
  state: AppState = {
    characters: [],
    isLoading: false,
    error: null,
  };

  handleSearch = async (term: string) => {
    this.setState({ isLoading: true, error: null });

    try {
      const characters = await fetchCharacters(term);
      this.setState({ characters, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      this.setState({ error: message, isLoading: false, characters: [] });
    }
  };

  render() {
    const { characters, isLoading, error } = this.state;

    return (
      <div className="app">
        <header className="app__header">
          <Header />
          <Search onSearch={this.handleSearch} />
        </header>
        <main className="app__main">
          <ErrorBoundary>
            <div className="app__results">
              {isLoading && <Spinner />}
              {!isLoading && error && <ErrorMessage message={error} />}
              {!isLoading && !error && <CardList characters={characters} />}
            </div>
            <div className="app__error-trigger">
              <ThrowErrorButton />
            </div>
          </ErrorBoundary>
        </main>
      </div>
    );
  }
}

export default App;
