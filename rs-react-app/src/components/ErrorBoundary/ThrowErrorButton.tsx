import { Component } from 'react';
import './ThrowErrorButton.css';

interface ThrowErrorButtonState {
  shouldThrow: boolean;
}

class ThrowErrorButton extends Component<object, ThrowErrorButtonState> {
  state: ThrowErrorButtonState = {
    shouldThrow: false,
  };

  handleClick = () => {
    // Обновляем state, а не бросаем ошибку напрямую в handler.
    // Ошибки в event handlers НЕ перехватываются ErrorBoundary.
    // Ошибка в render() — перехватывается. Именно поэтому throw здесь ↓
    this.setState({ shouldThrow: true });
  };

  render() {
    if (this.state.shouldThrow) {
      throw new Error('Test error triggered manually');
    }

    return (
      <button
        className="throw-error-button"
        type="button"
        onClick={this.handleClick}
      >
        Throw Error
      </button>
    );
  }
}

export default ThrowErrorButton;
