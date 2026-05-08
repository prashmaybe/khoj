import React, { useState } from 'react';
import ErrorPage from './ErrorPage';
import './ErrorTest.scss';

interface ErrorTestProps {
  onClose: () => void;
}

const ErrorTest: React.FC<ErrorTestProps> = ({ onClose }) => {
  const [selectedError, setSelectedError] = useState<{ code: number; description: string; url: string } | null>(null);

  const errorScenarios = [
    { code: -105, description: 'DNS lookup failed', url: 'http://nonexistent-domain-12345.com' },
    { code: -106, description: 'No internet connection', url: 'https://google.com' },
    { code: -107, description: 'SSL protocol error', url: 'https://expired.badssl.com' },
    { code: -108, description: 'Connection timed out', url: 'https://timeout-test.com' },
    { code: -109, description: 'Connection refused', url: 'http://localhost:9999' },
    { code: -310, description: 'Too many redirects', url: 'https://redirect-loop.com' },
    { code: -6, description: 'File not found', url: 'file:///nonexistent/file.html' },
    { code: -10, description: 'Access denied', url: 'https://httpbin.org/status/403' },
    { code: -1, description: 'Unknown error', url: 'https://example.com' }
  ];

  if (selectedError) {
    return (
      <div className="error-test-container">
        <div className="error-test-header">
          <button onClick={() => setSelectedError(null)} className="back-to-tests">
            ← Back to Error Tests
          </button>
          <button onClick={onClose} className="close-test">
            × Close
          </button>
        </div>
        <ErrorPage
          errorCode={selectedError.code}
          errorDescription={selectedError.description}
          url={selectedError.url}
          onRetry={() => console.log('Retry clicked')}
        />
      </div>
    );
  }

  return (
    <div className="error-test">
      <div className="error-test-header">
        <h2>Browser Error Page Tests</h2>
        <button onClick={onClose} className="close-test">×</button>
      </div>
      <div className="error-scenarios">
        <h3>Select an error scenario to test:</h3>
        <div className="scenario-grid">
          {errorScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => setSelectedError(scenario)}
              className="scenario-button"
            >
              <div className="scenario-code">ERR_{scenario.code}</div>
              <div className="scenario-desc">{scenario.description}</div>
              <div className="scenario-url">{scenario.url}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorTest;
