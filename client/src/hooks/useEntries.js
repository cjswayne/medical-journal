import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useEntries = () => {
  // null = not loaded yet, [] = loaded but empty
  const [entries, setEntries] = useState(null);
  const [entry, setEntry] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async (pageNum = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/entries?page=${pageNum}&limit=${limit}`);
      setEntries(data.entries);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error('fetchEntries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEntries = useCallback(async (query) => {
    if (!query.trim()) {
      return fetchEntries();
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/entries/search?q=${encodeURIComponent(query)}`);
      setEntries(data.entries);
      setTotal(data.entries.length);
      setPages(1);
      setPage(1);
    } catch (err) {
      console.error('searchEntries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchEntries]);

  const fetchEntry = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/entries/${id}`);
      setEntry(data.entry);
    } catch (err) {
      console.error('fetchEntry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (body) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/entries', body);
      return data.entry;
    } catch (err) {
      console.error('createEntry:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id, body) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put(`/entries/${id}`, body);
      setEntry(data.entry);
      return data.entry;
    } catch (err) {
      console.error('updateEntry:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/entries/${id}`);
      return true;
    } catch (err) {
      console.error('deleteEntry:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries, entry, total, page, pages, loading, error,
    fetchEntries, searchEntries, fetchEntry,
    createEntry, updateEntry, deleteEntry
  };
};
