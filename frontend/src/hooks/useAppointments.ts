import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Appointment } from '@/types';

export function useMyAppointments(token: string | null) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    if (!token) { setData([]); return; }
    setLoading(true);
    setError(null);
    try {
      const list = await api.listMyAppointments(token);
      setData(Array.isArray(list) ? list as Appointment[] : []);
    } catch (e: any) {
      setError(e?.message || 'Erro ao listar agendamentos');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) { setData([]); return; }
      setLoading(true);
      setError(null);
      try {
        const list = await api.listMyAppointments(token);
        if (alive) setData(Array.isArray(list) ? list as Appointment[] : []);
      } catch (e: any) {
        if (alive) { setError(e?.message || 'Erro ao listar agendamentos'); setData([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  return { data, loading, error, refetch: fetcher };
}

export function useDoctorAppointments(token: string | null, dateISO?: string) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    if (!token) { setData([]); return; }
    setLoading(true);
    setError(null);
    try {
      const list = await api.listDoctorAppointmentsByDate(token, dateISO);
      setData(Array.isArray(list) ? list as Appointment[] : []);
    } catch (e: any) {
      setError(e?.message || 'Erro ao listar agenda');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [token, dateISO]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) { setData([]); return; }
      setLoading(true);
      setError(null);
      try {
        const list = await api.listDoctorAppointmentsByDate(token, dateISO);
        if (alive) setData(Array.isArray(list) ? list as Appointment[] : []);
      } catch (e: any) {
        if (alive) { setError(e?.message || 'Erro ao listar agenda'); setData([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, dateISO]);

  return { data, loading, error, refetch: fetcher };
}
