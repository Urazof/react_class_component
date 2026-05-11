import { ChangeEvent, Component, KeyboardEvent } from 'react';
import './Search.css';

interface SearchProps {
  onSearch: (term: string) => void;
}

interface SearchState {
  inputValue: string;
  lastSearched: string;
}

const STORAGE_KEY = 'rm_search_term';

class Search extends Component<SearchProps, SearchState> {
  state: SearchState = {
    inputValue: localStorage.getItem(STORAGE_KEY) ?? '',
    lastSearched: '',
  };

  componentDidMount() {
    const savedTerm = localStorage.getItem(STORAGE_KEY) ?? '';
    this.props.onSearch(savedTerm);
    this.setState({ lastSearched: savedTerm });
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.handleSearch();
    }
  };

  handleSearch = () => {
    const trimmed = this.state.inputValue.trim();

    if (trimmed === this.state.lastSearched) return;

    localStorage.setItem(STORAGE_KEY, trimmed);
    this.setState({ lastSearched: trimmed });
    this.props.onSearch(trimmed);
  };

  render() {
    return (
      <div className="search">
        <input
          className="search__input"
          type="text"
          value={this.state.inputValue}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          placeholder="Search character..."
          aria-label="Search character"
        />
        <button
          className="search__button"
          type="button"
          onClick={this.handleSearch}
        >
          Search
        </button>
      </div>
    );
  }
}

export default Search;
