'use client';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import type { User } from '@/types';

type Row = Record<string, any>;

function isBadDate(v: any) {
  if (!v) return true;
  const s = String(v).toLowerCase();
  if (s.includes('infinity')) return true;
  const d = new Date(v);
  return Number.isNaN(d.getTime());
}

function pickDate(r: Row) {
  const v = r.date ?? r.data ?? r.Date ?? r.Data ?? r.dataHora ?? r.dateTime ?? r.scheduledAt ?? null;
  if (!v || isBadDate(v)) return '-';
  return new Date(v).toLocaleDateString('pt-BR');
}

function pickTime(r: Row) {
  const t = r.time ?? r.hora ?? r.Time ?? r.Hora ?? null;
  if (typeof t === 'string' && t.includes(':')) return t.slice(0, 5);
  const combo = r.dataHora ?? r.dateTime ?? r.scheduledAt ?? null;
  if (combo && !isBadDate(combo)) return new Date(combo).toTimeString().slice(0, 5);
  return '-';
}

function pickDesc(r: Row) {
  return r.description ?? r.descricao ?? r.Symptoms ?? r.symptoms ?? '-';
}

function doctorName(r: Row, map?: Record<string, User>) {
  const direct =
    r.doctorName ?? r.medicoNome ?? r.doctor?.name ?? r.medico?.name ??
    r.Doctor?.Name ?? r.Medico?.Name;
  if (direct) return direct;

  const id =
    r.doctorId ?? r.DoctorId ?? r.medicoId ?? r.MedicoId ?? r.Doctor?.Id ?? r.Medico?.Id;

  if (id && map && map[id]?.name) return map[id].name;

  return '-';
}

export function PatientScheduleList({ token }: { token: string }) {
  const { data, loading, error } = useMyAppointments(token);

  const { list: doctors, map: doctorsMap } = useDoctors(token);

  const map: Record<string, User> | undefined =
    doctorsMap ?? (doctors?.length ? Object.fromEntries(doctors.map(d => [d.id, d] as const)) : undefined);

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !error && (!data || data.length === 0) && (
        <p style={{ opacity: .8 }}>Nenhum agendamento encontrado.</p>
      )}

      {data && data.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Descrição</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a, i) => (
              <tr key={a.id ?? i}>
                <td>{pickDate(a)}</td>
                <td>{pickTime(a)}</td>
                <td>{pickDesc(a)}</td>
                <td>{doctorName(a, map)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
