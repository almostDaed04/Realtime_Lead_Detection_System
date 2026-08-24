import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ImageUploader from '../components/ImageUploader';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30s for AI inference
      });

      // Navigate to result page with prediction data
      navigate('/result', { state: { prediction: response.data.prediction } });
    } catch (err) {
      const message = err.response?.data?.error
        || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="page-title">Upload Leaf Image</h1>
          <p className="page-subtitle">
            Take a clear photo of a single leaf and let our AI identify the species
          </p>
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <ImageUploader onFileSelect={setFile} disabled={loading} />

          {error && (
            <div className="alert alert-error animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <span className="spinner"></span>
                  <span>Analyzing leaf...</span>
                </div>
              ) : (
                <>🔬 Identify Species</>
              )}
            </button>
          )}

          {/* Tips */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📌 Tips for best results</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Use a clear, well-lit photo of a single leaf
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Place the leaf against a plain background
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Supported formats: JPEG, PNG (max 5MB)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">!</span>
                Only one leaf per image — multiple leaves will be rejected
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
