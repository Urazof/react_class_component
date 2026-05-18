import { Component } from 'react';
import { fetchCharacters } from '../../api/rickmorty';
import type { Character } from '../../api/rickmorty';
import Search from '../../components/Search/Search';
import CardList from '../../components/CardList/CardList';
import Spinner from '../../components/Spinner/Spinner';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ThrowErrorButton from '../../components/ErrorBoundary/ThrowErrorButton';
import './MainPage.css';

interface MainPageState {
  characters: Character[];
  isLoading: boolean;
  error: string | null;
}

class MainPage extends Component<object, MainPageState> {
  state: MainPageState = {
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
      <div className="main-page">
        <Search onSearch={this.handleSearch} />
        <div className="main-page__results">
          {isLoading && <Spinner />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && !error && <CardList characters={characters} />}
        </div>
        <div className="main-page__error-trigger">
          <ThrowErrorButton />
        </div>
      </div>
    );
  }
}

export default MainPage;
