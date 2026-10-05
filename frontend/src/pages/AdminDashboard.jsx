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
    { id: 'stats', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'logs', label: '📋 Logs', icon: '📋' },
  ];

  return (
    <div className="page-container">
      <div className="animate-slide-up mb-12 text-center sm:text-left">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage users, view logs, and monitor system stats</p>
      </div>

      {error && (
        <div className="alert alert-error mb-10 animate-fade-in">
          ⚠️ {error}
          <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-2 rounded-2xl glass-card mb-12 max-w-fit mx-auto sm:mx-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
                <span className="text-xl">👥</span>
              </div>
              <p className="text-5xl font-bold text-slate-200 mt-6">{stats.totalUsers}</p>
            </div>
            
            <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Predictions</p>
                <span className="text-xl">🍃</span>
              </div>
              <p className="text-5xl font-bold text-emerald-400 mt-6">{stats.totalPredictions}</p>
            </div>
            
            <div className="glass-card p-8 hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Species Detected</p>
                <span className="text-xl">🔍</span>
              </div>
              <p className="text-5xl font-bold text-amber-400 mt-6">{stats.speciesBreakdown?.length || 0}</p>
            </div>
          </div>

          {/* Species Breakdown */}
          {stats.speciesBreakdown?.length > 0 && (
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <span>📊</span> Species Breakdown
              </h3>
              <div className="space-y-4">
                {stats.speciesBreakdown.map((s, idx) => (
                  <div key={s.species} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </div>
                    <span className="text-base font-semibold text-slate-200 w-32 truncate">{s.species}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
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
              <span className="text-4xl">📋</span>
              <p className="text-slate-400 mt-4">No prediction logs found.</p>
            </div>
          ) : (
            <>
              <div className="glass-card overflow-hidden">
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
