import React from 'react';
import './ErrorPage.scss';

interface ErrorPageProps {
  errorCode: number;
  errorDescription: string;
  url: string;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  errorCode, 
  errorDescription, 
  url, 
  onRetry 
}) => {
  const getErrorDetails = (code: number) => {
    switch (code) {
      case -105: // ERR_NAME_NOT_RESOLVED
        return {
          icon: '🌐',
          title: "This site can't be reached",
          description: "The server at " + url + " can't be found because the DNS lookup failed.",
          suggestions: [
            "Check the address for typing errors",
            "Check your internet connection",
            "Try visiting a different website"
          ]
        };
      case -106: // ERR_INTERNET_DISCONNECTED
        return {
          icon: '📡',
          title: "No internet",
          description: "You are not connected to the internet. Check your network connection and try again.",
          suggestions: [
            "Check your network cables, modem, and router",
            "Reconnect to Wi-Fi",
            "Try using a different network"
          ]
        };
      case -107: // ERR_SSL_PROTOCOL_ERROR
        return {
          icon: '🔒',
          title: "Your connection is not private",
          description: "Attackers might be trying to steal your information from " + url,
          suggestions: [
            "Go back to the previous page",
            "Try reloading the page",
            "Check your connection is secure"
          ]
        };
      case -108: // ERR_CONNECTION_TIMED_OUT
        return {
          icon: '⏰',
          title: "Request Timeout",
          description: "The server at " + url + " took too long to respond.",
          suggestions: [
            "Check your internet connection",
            "Try reloading the page",
            "The server might be temporarily unavailable"
          ]
        };
      case -109: // ERR_CONNECTION_REFUSED
        return {
          icon: '🚫',
          title: "This site can't be reached",
          description: "The connection to " + url + " was refused.",
          suggestions: [
            "The server might be down",
            "Check if the URL is correct",
            "Try again later"
          ]
        };
      case -310: // ERR_TOO_MANY_REDIRECTS
        return {
          icon: '🔄',
          title: "This page isn't working",
          description: url + " redirected you too many times.",
          suggestions: [
            "Clear your cookies",
            "Try opening the page in a new tab",
            "The website might have a configuration issue"
          ]
        };
      case -6: // ERR_FILE_NOT_FOUND
        return {
          icon: '📁',
          title: "File not found",
          description: "The file at " + url + " could not be found.",
          suggestions: [
            "Check if the file path is correct",
            "Verify the file exists",
            "Check file permissions"
          ]
        };
      case -10: // ERR_ACCESS_DENIED
        return {
          icon: '🔐',
          title: "Access denied",
          description: "You don't have permission to access " + url,
          suggestions: [
            "Check your permissions",
            "Try logging in if required",
            "Contact the administrator"
          ]
        };
      default:
        return {
          icon: '⚠️',
          title: "Something went wrong",
          description: errorDescription || "An unexpected error occurred while loading " + url,
          suggestions: [
            "Try reloading the page",
            "Check your internet connection",
            "Try again later"
          ]
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">{errorDetails.icon}</div>
        <h1 className="error-title">{errorDetails.title}</h1>
        <p className="error-description">{errorDetails.description}</p>
        
        <div className="error-code">
          Error code: <span className="code-value">{errorCode}</span>
        </div>

        <div className="error-suggestions">
          <h3>What you can try:</h3>
          <ul>
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              Try again
            </button>
          )}
          <button onClick={() => window.history.back()} className="back-button">
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
