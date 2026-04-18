import { useState, useCallback } from 'react';
import EmailInput from './components/EmailInput';
import AgentPipeline from './components/AgentPipeline';
import ResultsDashboard from './components/ResultsDashboard';
import './index.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [view, setView] = useState('input'); // 'input' | 'processing' | 'results'
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleProcess = useCallback(async (emails) => {
    setIsProcessing(true);
    setError('');
    setView('processing');
    setCurrentStage(1);
    setPipelineComplete(false);

    // Simulate stage transitions with timing
    // Stage 1 starts immediately
    const stageTimers = [];

    try {
      // Start the actual API call
      const fetchPromise = fetch(`${API_URL}/api/process-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      // Simulate stage progression while waiting
      // Stage 2 after ~3 seconds
      stageTimers.push(setTimeout(() => setCurrentStage(2), 3000));
      // Stage 3 after ~6 seconds  
      stageTimers.push(setTimeout(() => setCurrentStage(3), 6000));

      const res = await fetchPromise;

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || 'Failed to process emails');
      }

      const data = await res.json();

      // Clear timers and set final state
      stageTimers.forEach(clearTimeout);
      setCurrentStage(3);

      // Brief delay to show completion animation
      setTimeout(() => {
        setPipelineComplete(true);
        setTimeout(() => {
          setResults(data);
          setView('results');
          setIsProcessing(false);
        }, 800);
      }, 500);

    } catch (err) {
      stageTimers.forEach(clearTimeout);
      setError(err.message || 'Failed to connect to the AI agent. Is the backend running?');
      setView('input');
      setIsProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setView('input');
    setResults(null);
    setCurrentStage(0);
    setPipelineComplete(false);
    setError('');
    setIsProcessing(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">📮</div>
        <h1 className="app-title">Inbox Cleaner AI</h1>
        <p className="app-subtitle">
          Your intelligent email assistant — powered by a multi-stage AI agent
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Input View */}
      {view === 'input' && (
        <EmailInput onProcess={handleProcess} isProcessing={isProcessing} />
      )}

      {/* Processing View */}
      {view === 'processing' && (
        <AgentPipeline
          currentStage={currentStage}
          isComplete={pipelineComplete}
        />
      )}

      {/* Results View */}
      {view === 'results' && results && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <button className="btn btn-secondary" onClick={handleReset} id="process-new-btn">
              ← Process New Emails
            </button>
          </div>
          <ResultsDashboard data={results} />
        </>
      )}
    </div>
  );
}

export default App;
