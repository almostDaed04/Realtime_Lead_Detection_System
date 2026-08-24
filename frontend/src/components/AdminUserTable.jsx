import { useState } from 'react';
import api from '../api/axios';

/**
 * AdminUserTable — Displays users with delete functionality.
 */
const AdminUserTable = ({ users, onUserDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}" and all their predictions?`)) {
      return;
    }

    setDeletingId(userId);
    setError('');

    try {
      await api.delete(`/admin/users/${userId}`);
      onUserDeleted(userId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="glass-card overflow-hidden">
      {error && (
        <div className="alert alert-error m-4 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-200">{user.username}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30'
                      : 'bg-slate-600/30 text-slate-300 ring-1 ring-slate-500/30'
                    }
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                    ${user.accountStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                    }
                  `}>
                    {user.accountStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {formatDate(user.registrationDate)}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(user._id, user.username)}
                      disabled={deletingId === user._id}
                      className="btn btn-danger text-xs py-1 px-3"
                    >
                      {deletingId === user._id ? (
                        <span className="spinner w-3 h-3"></span>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No users found.
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;
