import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/analytics');
      setData(result);
    } catch (err) {
      console.error('fetchAnalytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchAnalytics };
};
