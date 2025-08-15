'use client';
import { useDoctorAppointments } from '@/hooks/useAppointments';

type Row = Record<string, any>;

function isBadDate(v: any) {
  if (!v) return true;
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

function patientLabel(r: Row) {
  const direct =
    r.patientName ?? r.pacienteNome ?? r.patient?.name ?? r.paciente?.name ??
    r.Patient?.Name ?? r.Paciente?.Name;
  if (direct) return direct;

  const id =
    r.patientId ?? r.PacienteId ?? r.PatientId ??
    r.pacienteId ?? r.Patient?.Id ?? r.Paciente?.Id;
  return id ? `Paciente ${String(id)}` : '-';
}

export function DoctorScheduleList({
  token,
  dateISO,
}: {
  token: string;
  dateISO: string;
}) {
  const { data, loading, error } = useDoctorAppointments(token, dateISO);

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      {!loading && !error && (!data || data.length === 0) && (
        <p style={{ opacity: .8 }}>Nenhum agendamento para esta data.</p>
      )}

      {data && data.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Descrição</th>
              <th>Paciente</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a, i) => (
              <tr key={a.id ?? i}>
                <td>{pickDate(a)}</td>
                <td>{pickTime(a)}</td>
                <td>{pickDesc(a)}</td>
                <td>{patientLabel(a)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
