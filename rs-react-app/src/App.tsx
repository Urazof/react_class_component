import { Component } from 'react';
import Header from './components/Header/Header';
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
          <Header />
        </header>
        <main className="app__main">
          <p>Results section — coming soon</p>
        </main>
      </div>
    );
  }
}

export default App;
