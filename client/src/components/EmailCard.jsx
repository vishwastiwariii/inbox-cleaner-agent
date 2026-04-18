import { useState } from 'react';

function getCategoryClass(category) {
  switch (category) {
    case 'Important': return 'important';
    case 'Action Required': return 'action-required';
    case 'Ignore': return 'ignore';
    case 'Spam': return 'spam';
    default: return '';
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case 'Important': return '🔴';
    case 'Action Required': return '🟠';
    case 'Ignore': return '🔵';
    case 'Spam': return '⚫';
    default: return '⚪';
  }
}

function getUrgencyClass(urgency) {
  switch (urgency) {
    case 'Critical': return 'critical';
    case 'High': return 'high';
    default: return '';
  }
}

export default function EmailCard({ email, index }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showBody, setShowBody] = useState(false);

  const catClass = getCategoryClass(email.category);

  return (
    <div
      className={`email-card glass-card ${catClass}`}
      style={{ animationDelay: `${index * 80}ms` }}
      id={`email-card-${email.id}`}
    >
      {/* Header */}
      <div className="email-card-header">
        <div className="email-card-main">
          <div className="email-subject">{email.subject}</div>
          <div className="email-sender">From: {email.sender}</div>
        </div>
        <div className="email-card-badges">
          <span className={`category-badge ${catClass}`}>
            {getCategoryIcon(email.category)} {email.category}
          </span>
          {(email.urgency === 'Critical' || email.urgency === 'High') && (
            <span className={`urgency-badge ${getUrgencyClass(email.urgency)}`}>
              ⚡ {email.urgency}
            </span>
          )}
          {email.deadlineDetected && email.deadlineDetected !== 'None' && (
            <span className="deadline-tag">
              🕐 {email.deadlineDetected}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="email-summary">
        {email.summary}
      </div>

      {/* Action Items */}
      {email.actionItems && email.actionItems.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div className="reasoning-label">
            <span>📌</span> Action Items ({email.actionItems.length})
          </div>
          <ul className="action-items-list">
            {email.actionItems.map((item, i) => (
              <li key={i} className="action-item">
                <span className="action-item-icon">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Entities */}
      {email.keyEntities && email.keyEntities.length > 0 && (
        <div className="key-entities" style={{ marginBottom: '12px' }}>
          {email.keyEntities.map((entity, i) => (
            <span key={i} className="entity-tag">{entity}</span>
          ))}
        </div>
      )}

      <div className="section-divider" />

      {/* Expandable Sections */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Reasoning Toggle */}
        <button
          className={`expandable-toggle ${showReasoning ? 'open' : ''}`}
          onClick={() => setShowReasoning(!showReasoning)}
        >
          <span className="arrow">▶</span>
          🧠 AI Reasoning
        </button>

        {/* Reply Toggle */}
        {email.suggestedReply && (
          <button
            className={`expandable-toggle ${showReply ? 'open' : ''}`}
            onClick={() => setShowReply(!showReply)}
          >
            <span className="arrow">▶</span>
            💬 Suggested Reply
          </button>
        )}

        {/* Original Email Toggle */}
        <button
          className={`expandable-toggle ${showBody ? 'open' : ''}`}
          onClick={() => setShowBody(!showBody)}
        >
          <span className="arrow">▶</span>
          📄 Original Email
        </button>
      </div>

      {/* Reasoning Content */}
      <div className={`expandable-content ${showReasoning ? 'open' : ''}`}>
        <div className="reasoning-box">
          <div className="reasoning-label">
            <span>🧠</span> Classification Reasoning
          </div>
          {email.reasoning}
        </div>
      </div>

      {/* Reply Content */}
      {email.suggestedReply && (
        <div className={`expandable-content ${showReply ? 'open' : ''}`}>
          <div className="reply-box">
            <div className="reply-header">
              <div className="reply-label">
                <span>💬</span> Suggested Reply
              </div>
              {email.replyTone && (
                <span className="reply-tone">Tone: {email.replyTone}</span>
              )}
            </div>
            <div className="reply-text">{email.suggestedReply}</div>
          </div>
        </div>
      )}

      {/* Original Body Content */}
      <div className={`expandable-content ${showBody ? 'open' : ''}`}>
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {email.body}
        </div>
      </div>
    </div>
  );
}
