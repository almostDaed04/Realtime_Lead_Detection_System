import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminUserTable from '../components/AdminUserTable';
import PaginationControl from '../components/PaginationControl';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });
  const [logPagination, setLogPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load stats.');
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      setUsers(response.data.users);
      setUserPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/logs?page=${page}&limit=15`);
      setLogs(response.data.logs);
      setLogPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  const handleUserDeleted = (userId) => {
    setUsers(users.filter((u) => u._id !== userId));
    fetchStats(); // Refresh stats after deletion
  };

  const tabs = [
    { id: 'stats', label: 'Overview', icon: '◫' },
    { id: 'users', label: 'Users', icon: '♙' },
    { id: 'logs', label: 'Activity logs', icon: '≡' },
  ];

  return (
    <div className="page-container admin-dashboard">
      <div className="admin-heading animate-slide-up">
        <div>
          <span className="admin-eyebrow"><span className="admin-live-dot" /> CONTROL CENTER</span>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-subtitle">A clear view of your users, detections, and system activity.</p>
        </div>
        <div className="admin-heading-mark" aria-hidden="true">LS <span>/</span> ADMIN</div>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-fade-in">
          âš ï¸ {error}
          <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-white">âœ•</button>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs" role="tablist" aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            <span className="admin-tab-icon" aria-hidden="true">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Cards */}
          <div className="admin-stat-grid">
            <div className="glass-card admin-stat-card stat-users">
             <p className="admin-stat-label">Total users</p>
              <p className="admin-stat-value">{stats.totalUsers}</p><span className="admin-stat-note">Registered accounts</span>
            </div>
            <div className="glass-card admin-stat-card stat-predictions">
              <p className="admin-stat-label">Total predictions</p>
              <p className="admin-stat-value">{stats.totalPredictions}</p><span className="admin-stat-note">Leaf scans processed</span>
            </div>
            <div className="glass-card admin-stat-card stat-species">
              <p className="admin-stat-label">Species detected</p>
              <p className="admin-stat-value">{stats.speciesBreakdown?.length || 0}</p><span className="admin-stat-note">Unique species identified</span>
            </div>
          </div>

          {/* Species Breakdown */}
          {stats.speciesBreakdown?.length > 0 && (
            <div className="glass-card admin-breakdown">
              <div className="admin-section-heading"><div><span className="admin-eyebrow">MODEL INSIGHTS</span><h3>Species breakdown</h3></div><span className="admin-section-count">{stats.speciesBreakdown.length} species</span></div>
              <div className="admin-species-list">
                {stats.speciesBreakdown.map((s) => (
                  <div key={s.species} className="admin-species-row">
                    <span className="text-sm font-medium text-slate-300 w-28">{s.species}</span>
                    <div className="admin-species-track">
                      <div
                        className="admin-species-fill"
                        style={{ width: `${stats.totalPredictions ? (s.count / stats.totalPredictions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-400 w-16 text-right">{s.count}</span>
                    <span className="text-xs text-slate-500 w-20 text-right">
                      avg {s.avgConfidence}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <p className="text-sm text-slate-400 mb-4">
            Average confidence summarizes model certainty; it is not measured prediction accuracy because user-verified labels are not stored.
          </p>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner spinner-lg"></div>
            </div>
          ) : (
            <>
              <AdminUserTable users={users} onUserDeleted={handleUserDeleted} />
              <PaginationControl
                page={userPagination.page}
                totalPages={userPagination.totalPages}
                onPageChange={(p) => fetchUsers(p)}
              />
            </>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner spinner-lg"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <span className="text-4xl">ðŸ“‹</span>
              <p className="text-slate-400 mt-4">No prediction logs found.</p>
            </div>
          ) : (
            <>
              <div className="glass-card admin-table-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Species</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Confidence</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-6 py-3 text-sm text-slate-300">
                            {log.userId?.username || 'Unknown'}
                          </td>
                          <td className="px-6 py-3 text-sm text-emerald-400 font-medium">
                            {log.species}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-300">
                            {log.confidenceScore}%
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-400">
                            {new Date(log.timestamp).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <PaginationControl
                page={logPagination.page}
                totalPages={logPagination.totalPages}
                onPageChange={(p) => fetchLogs(p)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
