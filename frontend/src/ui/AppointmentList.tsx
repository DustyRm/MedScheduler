// src/ui/AppointmentList.tsx
'use client';

type Row = Record<string, any>;

function resolveDate(r: Row) {
  const iso = r.date || r.data || r.dataHora || r.datetime;
  return iso ? new Date(iso) : null;
}
function resolveTime(r: Row) {
  return r.time || r.hora || (r.dataHora && new Date(r.dataHora).toLocaleTimeString());
}
function resolveDesc(r: Row) {
  return r.description || r.descricao || r.note || '-';
}
function resolvePatient(r: Row) {
  return r.patientName || r.pacienteNome || r.paciente || r.patientId || '-';
}
function resolveDoctor(r: Row) {
  return r.doctorName || r.medicoNome || r.medico || r.doctorId || '-';
}

export function AppointmentList({ items, showPatient = false }: { items: Row[]; showPatient?: boolean }) {
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
          const d = resolveDate(a);
          const dateStr = d ? d.toLocaleDateString() : '-';
          const timeStr = resolveTime(a) || '-';
          return (
            <tr key={a.id ?? idx}>
              <td>{dateStr}</td>
              <td>{timeStr}</td>
              <td>{resolveDesc(a)}</td>
              {showPatient && <td>{resolvePatient(a)}</td>}
              <td>{resolveDoctor(a)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
