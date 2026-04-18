import { useEffect, useState } from 'react';

const STAGES = [
  {
    id: 1,
    name: 'Classification',
    desc: 'Urgency & category detection',
    icon: '🏷️',
  },
  {
    id: 2,
    name: 'Summarization',
    desc: 'Summary & action item extraction',
    icon: '📝',
  },
  {
    id: 3,
    name: 'Reply Generation',
    desc: 'Smart reply suggestions',
    icon: '💬',
  },
];

export default function AgentPipeline({ currentStage, isComplete }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [isComplete]);

  const getStageStatus = (stageId) => {
    if (isComplete) return 'complete';
    if (stageId < currentStage) return 'complete';
    if (stageId === currentStage) return 'processing';
    return 'waiting';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'complete': return '✓ Complete';
      case 'processing': return `Processing${dots}`;
      case 'waiting': return 'Waiting';
      default: return '';
    }
  };

  const getStatusIcon = (status, originalIcon) => {
    switch (status) {
      case 'complete': return '✅';
      case 'processing': return '⚡';
      default: return originalIcon;
    }
  };

  return (
    <div className="pipeline-container glass-card">
      <div className="pipeline-title">
        <span>🧠</span>
        <span>Agent Pipeline</span>
        {isComplete && <span style={{ color: '#22c55e', fontSize: '0.9rem' }}> — All stages complete!</span>}
      </div>

      <div className="pipeline-stages">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          return (
            <div key={stage.id} style={{ display: 'contents' }}>
              {idx > 0 && (
                <div className={`pipeline-connector ${status !== 'waiting' ? 'active' : ''}`}>
                  →
                </div>
              )}
              <div className={`pipeline-stage glass-card ${status}`}>
                <div className="stage-icon">
                  {getStatusIcon(status, stage.icon)}
                </div>
                <div className="stage-name">{stage.name}</div>
                <div className="stage-desc">{stage.desc}</div>
                <div className={`stage-status ${status}`}>
                  {getStatusText(status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
