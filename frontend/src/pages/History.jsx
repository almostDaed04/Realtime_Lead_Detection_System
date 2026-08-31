import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import HistoryCard from '../components/HistoryCard';
import PaginationControl from '../components/PaginationControl';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/history?page=${page}&limit=12`);
      setPredictions(response.data.predictions);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (page) => {
    fetchHistory(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <div className="animate-slide-up">
        <h1 className="page-title">Prediction History</h1>
        <p className="page-subtitle">
          {pagination.total > 0
            ? `${pagination.total} prediction${pagination.total === 1 ? '' : 's'} found`
            : 'Your past predictions will appear here'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass-card p-16 text-center animate-fade-in">
          <span className="text-5xl">🍂</span>
          <h2 className="text-xl font-bold text-slate-200 mt-4">No Predictions Yet</h2>
          <p className="text-slate-400 mt-2 mb-6">Upload your first leaf image to get started.</p>
          <Link to="/upload" className="btn btn-primary">📸 Upload Image</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {predictions.map((prediction) => (
              <HistoryCard key={prediction._id} prediction={prediction} />
            ))}
          </div>

          <PaginationControl
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default History;
