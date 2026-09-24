import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { fetchLeads } from '../api/client';
import LeadCard from '../components/LeadCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

export default function LeadListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leads', page, statusFilter, search],
    queryFn: () =>
      fetchLeads({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  // handleSearch removed (handled inline)

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Compute stats from current data
  const leads = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Lead Dashboard</h1>
        <p className="page-subtitle">
          Track and manage your Meta Ads leads in real time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Leads</div>
          <div className="stat-value">{total}</div>
          <div className="stat-icon">
            <Users size={40} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New</div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {leads.filter((l) => l.status === 'new').length}
          </div>
          <div className="stat-icon">
            <Clock size={40} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Qualified</div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>
            {leads.filter((l) => l.status === 'qualified').length}
          </div>
          <div className="stat-icon">
            <TrendingUp size={40} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Converted</div>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {leads.filter((l) => l.status === 'converted').length}
          </div>
          <div className="stat-icon">
            <CheckCircle size={40} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {/* Search */}
        <form onSubmit={(e) => e.preventDefault()} className="search-wrapper">
          <Search className="search-icon" />
          <input
            id="lead-search-input"
            type="text"
            className="input search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </form>

        {/* Status filters */}
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              id={`filter-${f.value || 'all'}`}
              className={`btn btn-sm btn-secondary ${statusFilter === f.value ? 'btn-primary' : ''}`}
              onClick={() => handleStatusFilter(f.value)}
              style={
                statusFilter === f.value
                  ? {}
                  : { background: 'var(--color-bg-elevated)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lead List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <p style={{ color: '#f87171' }}>
            ⚠️ {(error as Error).message ?? 'Failed to load leads'}
          </p>
          <p className="text-sm text-muted mt-2">
            Make sure the backend server is running at{' '}
            <code className="font-mono" style={{ color: 'var(--color-text-accent)' }}>
              {import.meta.env.VITE_API_URL}
            </code>
          </p>
        </div>
      ) : leads.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <Users size={28} />
          </div>
          <div className="empty-title">No leads yet</div>
          <p className="empty-desc">
            Use the Webhook Simulator to send a test lead, or wait for Meta Ads to send one.
          </p>
        </div>
      ) : (
        <>
          <div className="lead-list" id="lead-list">
            {leads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={!data.pagination.hasPrev}
                onClick={() => setPage((p) => p - 1)}
                id="pagination-prev"
              >
                ←
              </button>

              {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                  id={`pagination-page-${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={!data.pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                id="pagination-next"
              >
                →
              </button>
            </div>
          )}

          <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            Showing {leads.length} of {total} leads
          </p>
        </>
      )}
    </>
  );
}
