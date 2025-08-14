import type { AuthResponse, Appointment, User, UserRole } from '@/types';

export class HttpError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

async function http<T>(path: string, options?: RequestInit): Promise<T | undefined> {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const rawText = await res.text().catch(() => '');

  const parsed = (() => {
    if (!rawText) return null;
    if (isJson) {
      try { return JSON.parse(rawText); } catch { return null; }
    }
    return { message: rawText };
  })();

  if (!res.ok) {
    let msg =
      (parsed && (parsed as any).message) ||
      (parsed && (parsed as any).title) ||
      (parsed && (parsed as any).error) ||
      rawText ||
      `HTTP ${res.status}`;

    if (parsed && typeof parsed === 'object' && (parsed as any).errors) {
      const entries = Object.entries((parsed as any).errors as Record<string, string[] | string>);
      if (entries.length) {
        const [field, val] = entries[0];
        const first = Array.isArray(val) ? val[0] : val;
        msg = first || `${field} inválido`;
      }
    }


    if (res.status === 401) msg = 'Credenciais inválidas.';
    if (res.status === 403) msg = 'Acesso negado.';

    if (rawText && /^System\./i.test(rawText)) {
      const firstLine = rawText.split('\n')[0];
      const afterColon = firstLine.split(':').slice(1).join(':').trim();
      if (afterColon) msg = afterColon; 
    }

    throw new HttpError(res.status, msg, parsed);
  }

  if (!rawText) return undefined as T; 
  if (isJson) return parsed as T;
  return undefined as T;
}

function normalizeAuth(payload: any): AuthResponse | undefined {
  if (!payload) return undefined;
  if (payload?.user && payload?.token) return payload as AuthResponse;
  if (payload?.token && (payload?.email || payload?.name || payload?.role !== undefined)) {
    const user: User = {
      id: payload.id ?? '',
      name: payload.name ?? '',
      email: payload.email ?? '',
      role: (payload.role as UserRole) ?? 1,
    };
    return { token: payload.token, user };
  }
  return undefined;
}

function toDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type CreateAppointmentInput = {
  date: string;
  time: string;
  symptoms: string;
  description?: string;
};

export const api = {
  login: async (email: string, password: string) => {
    const raw = await http<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const norm = normalizeAuth(raw);
    if (!norm) throw new Error('Formato de resposta de autenticação inválido.');
    return norm;
  },

  register: async (name: string, email: string, password: string, role: UserRole) => {
    const raw = await http<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    return normalizeAuth(raw);
  },

  // PACIENTE
  createAppointment: (token: string, payload: CreateAppointmentInput) =>
    http<Appointment>('/paciente/agendamentos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        date: payload.date,
        time: payload.time,
        description: payload.description,
        symptoms: payload.symptoms,
        data: payload.date,
        hora: payload.time,
        descricao: payload.description,
        Symptoms: payload.symptoms,
      }),
    }),

  listMyAppointments: async (token: string) => {
    try {
      return (
        (await http<any[]>('/paciente/agendamentos', {
          headers: { Authorization: `Bearer ${token}` },
        })) || []
      );
    } catch (e: any) {
      if (e?.status === 404) return [];
      throw e;
    }
  },

  // MÉDICO
  listDoctorAppointmentsByDate: async (token: string, date?: string) => {
    const day = date || toDateISO(new Date());
    try {
      return (
        (await http<any[]>(`/medico/agendamentos?data=${encodeURIComponent(day)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })) || []
      );
    } catch (e: any) {
      if (e?.status === 404) return [];
      throw e;
    }
  },
};
