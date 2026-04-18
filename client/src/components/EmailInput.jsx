import { useState, useCallback, useEffect } from 'react';

const PLACEHOLDER = `[
  {
    "subject": "Your email subject",
    "sender": "sender@example.com",
    "body": "The full email body text..."
  }
]`;

const API_URL = 'http://localhost:3001';

export default function EmailInput({ onProcess, isProcessing }) {
  const [inputText, setInputText] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [error, setError] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [fetchCount, setFetchCount] = useState(10);

  // Check Gmail connection status on mount & URL params
  useEffect(() => {
    checkGmailStatus();

    // Check URL params for OAuth callback result
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      setGmailConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('gmail') === 'error') {
      setError(`Gmail connection failed: ${params.get('message') || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkGmailStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gmail/status`);
      const data = await res.json();
      setGmailConnected(data.connected);
    } catch {
      // Backend not running, ignore
    }
  };

  const parseEmails = useCallback((text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        return { error: 'Input must be a JSON array of emails' };
      }
      for (let i = 0; i < parsed.length; i++) {
        const email = parsed[i];
        if (!email.subject || !email.sender || !email.body) {
          return { error: `Email ${i + 1} is missing required fields (subject, sender, body)` };
        }
      }
      return { emails: parsed };
    } catch {
      return { error: 'Invalid JSON format. Please check your input.' };
    }
  }, []);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setError('');

    if (text.trim()) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setEmailCount(parsed.length);
        } else {
          setEmailCount(0);
        }
      } catch {
        setEmailCount(0);
      }
    } else {
      setEmailCount(0);
    }
  };

  const handleLoadSample = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/sample-emails`);
      const data = await res.json();
      const text = JSON.stringify(data.emails, null, 2);
      setInputText(text);
      setEmailCount(data.emails.length);
    } catch {
      setError('Could not load sample emails. Is the backend running on port 3001?');
    }
  };

  const handleConnectGmail = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/gmail/auth`);
      const data = await res.json();
      if (data.authUrl) {
        // Redirect to Google consent screen
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to get auth URL.');
      }
    } catch {
      setError('Could not connect to backend. Is the server running?');
    }
  };

  const handleFetchGmail = async () => {
    setError('');
    setGmailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/gmail/fetch?count=${fetchCount}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (data.emails && data.emails.length > 0) {
        const text = JSON.stringify(data.emails, null, 2);
        setInputText(text);
        setEmailCount(data.emails.length);
      } else {
        setError('No emails found matching the query.');
      }
    } catch (err) {
      setError(`Gmail fetch failed: ${err.message}`);
    } finally {
      setGmailLoading(false);
    }
  };

  const handleAutoProcess = async () => {
    setError('');
    setGmailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/gmail/fetch?count=${fetchCount}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (data.emails && data.emails.length > 0) {
        const text = JSON.stringify(data.emails, null, 2);
        setInputText(text);
        setEmailCount(data.emails.length);
        onProcess(data.emails); // Auto pass to the pipeline
      } else {
        setError('No emails found matching the query.');
      }
    } catch (err) {
      setError(`Gmail fetch failed: ${err.message}`);
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await fetch(`${API_URL}/api/gmail/disconnect`, { method: 'POST' });
      setGmailConnected(false);
    } catch {
      // ignore
    }
  };

  const handleProcess = () => {
    const result = parseEmails(inputText);
    if (result.error) {
      setError(result.error);
      return;
    }
    onProcess(result.emails);
  };

  const handleClear = () => {
    setInputText('');
    setEmailCount(0);
    setError('');
  };

  return (
    <div className="input-panel glass-card">
      <div className="input-panel-header">
        <div className="input-panel-title">
          <span>📥</span>
          <span>Email Input</span>
          {emailCount > 0 && (
            <span className="email-count">
              {emailCount} email{emailCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="input-panel-actions">
          <button
            className="btn btn-secondary"
            onClick={handleLoadSample}
            disabled={isProcessing}
            id="load-sample-btn"
          >
            📋 Sample Emails
          </button>
          {inputText && (
            <button
              className="btn btn-ghost"
              onClick={handleClear}
              disabled={isProcessing}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Gmail Integration Section */}
      <div className="gmail-section">
        {!gmailConnected ? (
          <button
            className="btn btn-gmail"
            onClick={handleConnectGmail}
            disabled={isProcessing}
            id="connect-gmail-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor"/>
            </svg>
            Connect Gmail Account
          </button>
        ) : (
          <div className="gmail-connected">
            <div className="gmail-status">
              <span className="gmail-status-dot"></span>
              <span>Gmail Connected</span>
              <button
                className="btn btn-ghost"
                onClick={handleDisconnectGmail}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Disconnect
              </button>
            </div>
            <div className="gmail-fetch-row">
              <label className="gmail-fetch-label">
                Fetch
                <select
                  className="gmail-select"
                  value={fetchCount}
                  onChange={(e) => setFetchCount(parseInt(e.target.value))}
                  disabled={isProcessing || gmailLoading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                recent emails
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleFetchGmail}
                  disabled={isProcessing || gmailLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {gmailLoading ? (
                    <>
                      <span className="spinner" /> Fetching
                    </>
                  ) : (
                    <>📬 Fetch</>
                  )}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAutoProcess}
                  disabled={isProcessing || gmailLoading}
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  ✨ Auto Process
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="input-divider">
        <span>or paste emails as JSON below</span>
      </div>

      <textarea
        className="email-textarea"
        value={inputText}
        onChange={handleTextChange}
        placeholder={PLACEHOLDER}
        disabled={isProcessing}
        spellCheck={false}
        id="email-input-textarea"
      />

      {error && (
        <div className="error-banner" style={{ marginTop: '12px', padding: '12px', textAlign: 'left' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleProcess}
          disabled={!inputText.trim() || isProcessing}
          id="process-emails-btn"
        >
          {isProcessing ? (
            <>
              <span className="spinner" />
              Agent Processing...
            </>
          ) : (
            <>🤖 Process Emails with AI Agent</>
          )}
        </button>
      </div>
    </div>
  );
}
