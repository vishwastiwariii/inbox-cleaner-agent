import { useState } from 'react';
import EmailCard from './EmailCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Important', label: 'Important' },
  { key: 'Action Required', label: 'Action Required' },
  { key: 'Ignore', label: 'Ignore' },
  { key: 'Spam', label: 'Spam' },
];

export default function ResultsDashboard({ data }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const { results, categoryCounts, totalEmails } = data;

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter((r) => r.category === activeFilter);

  const getCount = (key) => {
    if (key === 'all') return totalEmails;
    return categoryCounts[key] || 0;
  };

  return (
    <div className="results-container">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card glass-card">
          <div className="stat-number" style={{ color: 'var(--accent-bright)' }}>{totalEmails}</div>
          <div className="stat-label">Total Processed</div>
        </div>
        <div className="stat-card glass-card important">
          <div className="stat-number">{categoryCounts['Important'] || 0}</div>
          <div className="stat-label">Important</div>
        </div>
        <div className="stat-card glass-card action">
          <div className="stat-number">{categoryCounts['Action Required'] || 0}</div>
          <div className="stat-label">Action Required</div>
        </div>
        <div className="stat-card glass-card ignore">
          <div className="stat-number">{categoryCounts['Ignore'] || 0}</div>
          <div className="stat-label">Ignore</div>
        </div>
        <div className="stat-card glass-card spam">
          <div className="stat-number">{categoryCounts['Spam'] || 0}</div>
          <div className="stat-label">Spam</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
            id={`filter-${filter.key.toLowerCase().replace(' ', '-')}`}
          >
            {filter.label}
            <span className="tab-count">{getCount(filter.key)}</span>
          </button>
        ))}
      </div>

      {/* Email Cards */}
      <div className="email-cards">
        {filteredResults.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No emails in this category.
          </div>
        ) : (
          filteredResults.map((email, idx) => (
            <EmailCard key={email.id} email={email} index={idx} />
          ))
        )}
      </div>
    </div>
  );
}
