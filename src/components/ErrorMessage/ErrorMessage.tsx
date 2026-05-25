import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <p className="error-message__title">Something went wrong</p>
      <p className="error-message__text">{message}</p>
    </div>
  );
}

export default ErrorMessage;
