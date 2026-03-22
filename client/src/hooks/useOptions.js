import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useOptions = () => {
  const [aromaOptions, setAromaOptions] = useState([]);
  const [flavorOptions, setFlavorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/options?type=${type}`);
      if (type === 'aroma') setAromaOptions(data.options);
      if (type === 'flavor') setFlavorOptions(data.options);
      return data.options;
    } catch (err) {
      console.error('fetchOptions:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [aromas, flavors] = await Promise.all([
        api.get('/options?type=aroma'),
        api.get('/options?type=flavor')
      ]);
      setAromaOptions(aromas.options);
      setFlavorOptions(flavors.options);
    } catch (err) {
      console.error('fetchAllOptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addOption = useCallback(async (type, name) => {
    try {
      const data = await api.post('/options', { type, name });
      if (type === 'aroma') {
        setAromaOptions((prev) => [...prev, { name }].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setFlavorOptions((prev) => [...prev, { name }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      return data.option;
    } catch (err) {
      console.error('addOption:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    aromaOptions, flavorOptions, loading, error,
    fetchOptions, fetchAllOptions, addOption
  };
};
