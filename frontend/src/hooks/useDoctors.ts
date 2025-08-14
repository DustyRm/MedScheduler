import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

type AnyDoctor = Record<string, any>;

function normalizeDoctor(d: AnyDoctor): User {
  const id = d.id ?? d.Id ?? d.userId ?? d.UserId ?? '';
  const name = d.name ?? d.Name ?? '(sem nome)';
  const email = d.email ?? d.Email ?? '';
  const role = d.role ?? d.Role ?? 2;
  return { id, name, email, role };
}

export function useDoctors(token: string | null) {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    api.listDoctors(token)
      .then(raw => alive && setList((raw || []).map(normalizeDoctor)))
      .catch(e => alive && setError(e?.message || 'Erro ao listar médicos'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [token]);

  const map = useMemo(
    () => Object.fromEntries(list.map(d => [d.id, d] as const)),
    [list]
  );

  return { list, map, loading, error };
}
