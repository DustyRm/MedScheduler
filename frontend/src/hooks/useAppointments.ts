// src/hooks/useAppointments.ts
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useMyAppointments(token: string | null) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetcher() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.listMyAppointments(token);
      setData(list);
    } catch (e: any) {
      setError(e?.message || 'Erro ao listar agendamentos');
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetcher(); }, [token]);
  return { data, loading, error, refetch: fetcher };
}

export function useDoctorAppointments(token: string | null, dateISO?: string) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    api.listDoctorAppointmentsByDate(token, dateISO)
      .then(setData)
      .catch((e) => { setError(e?.message || 'Erro ao listar agenda'); setData([]); })
      .finally(() => setLoading(false));
  }, [token, dateISO]);

  return { data, loading, error };
}
