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
    <div className="page-container">
      <div className="animate-slide-up">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage users, view logs, and monitor system stats</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-fade-in">
          ⚠️ {error}
          <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/50 mb-8 max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-200 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400 font-medium">Total Predictions</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.totalPredictions}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm text-slate-400 font-medium">Species Detected</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.speciesBreakdown?.length || 0}</p>
            </div>
          </div>

          {/* Species Breakdown */}
          {stats.speciesBreakdown?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-200 mb-4">Species Breakdown</h3>
              <div className="space-y-3">
                {stats.speciesBreakdown.map((s) => (
                  <div key={s.species} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-300 w-28">{s.species}</span>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{ width: `${(s.count / stats.totalPredictions) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-end w-24">
                      <span className="text-lg font-bold text-emerald-400">{s.count}</span>
                      <span className="text-xs text-slate-500">
                        avg {s.avgConfidence}%
                      </span>
                    </div>
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
