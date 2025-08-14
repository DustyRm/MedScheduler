import type { User } from '@/types';

type Row = Record<string, any>;

function isBadDate(v: any) {
  if (!v) return true;
  const s = String(v).toLowerCase();
  if (s.includes('infinity')) return true;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return true;
  const y = d.getFullYear();
  return y < 1900 || y > 9999;
}

function pickDate(r: Row) {
  const one = r.date ?? r.data ?? r.Date ?? r.Data ?? null;
  if (!isBadDate(one)) return new Date(one);
  const combo = r.dataHora ?? r.dateTime ?? r.scheduledAt ?? null;
  if (!isBadDate(combo)) return new Date(combo);
  return null;
}

function pickTime(r: Row) {
  const t = r.time ?? r.hora ?? r.Time ?? r.Hora ?? null;
  if (typeof t === 'string' && t.includes(':')) return t.slice(0,5);
  const combo = r.dataHora ?? r.dateTime ?? r.scheduledAt ?? null;
  if (!isBadDate(combo)) return new Date(combo).toTimeString().slice(0,5);
  return null;
}

function pickDesc(r: Row) {
  return r.description ?? r.descricao ?? r.Symptoms ?? r.symptoms ?? '-';
}

function pickDoctorName(r: Row, map?: Record<string, User>) {
  const direct =
    r.doctorName ?? r.medicoNome ?? r.medico?.name ?? r.doctor?.name ??
    r.MedicoNome ?? r.Medico?.Name ?? r.Doctor?.Name;
  if (direct) return direct;

  const id = r.doctorId ?? r.DoctorId ?? r.medicoId ?? r.MedicoId ?? r.Doctor?.Id ?? r.Medico?.Id;
  if (id && map && map[id]?.name) return map[id].name;

  return id || '-';
}

function pickPatientName(r: Row) {
  return r.patientName ?? r.pacienteNome ?? r.paciente?.name ?? r.patient?.name ?? '-';
}

export function AppointmentList({
  items,
  doctors,
  showPatient = false,
}: {
  items: Row[];
  doctors?: User[];
  showPatient?: boolean;
}) {
  const map = doctors ? Object.fromEntries(doctors.map(d => [d.id, d] as const)) : undefined;

  if (!items || items.length === 0) {
    return <p style={{ opacity: 0.8 }}>Nenhum agendamento encontrado.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Hora</th>
          <th>Descrição</th>
          {showPatient && <th>Paciente</th>}
          <th>Médico</th>
        </tr>
      </thead>
      <tbody>
        {items.map((a, idx) => {
          const d = pickDate(a);
          const dateStr = d ? d.toLocaleDateString() : '-';
          const timeStr = pickTime(a) || '-';
          const descStr = pickDesc(a);
          const docStr = pickDoctorName(a, map);
          const patStr = pickPatientName(a);
          return (
            <tr key={a.id ?? idx}>
              <td>{dateStr}</td>
              <td>{timeStr}</td>
              <td>{descStr}</td>
              {showPatient && <td>{patStr}</td>}
              <td>{docStr}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
