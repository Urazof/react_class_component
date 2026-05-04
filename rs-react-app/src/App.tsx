import { Component } from 'react';
import './App.css';

interface AppState {
  searchTerm: string;
}

class App extends Component<object, AppState> {
  state: AppState = {
    searchTerm: '',
  };

  render() {
    return (
      <div className="app">
        <header className="app__header">
          <p>Search section — coming soon</p>
        </header>
        <main className="app__main">
          <p>Results section — coming soon</p>
        </main>
      </div>
    );
  }
}

export default App;
