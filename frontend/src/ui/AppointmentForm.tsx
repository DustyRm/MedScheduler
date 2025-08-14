import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

export function AppointmentForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated?: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [description, setDescription] = useState('');

  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingDoctors(true);
    setError(null);
    api
      .listDoctors(token)
      .then((list) => { if (alive) setDoctors(list); })
      .catch((e: any) => { if (alive) setError(e?.message || 'Erro ao listar médicos'); })
      .finally(() => { if (alive) setLoadingDoctors(false); });
    return () => { alive = false; };
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);

    if (!date || !time) return setError('Informe data e hora.');
    if (!symptoms.trim()) return setError('Informe os sintomas.');
    if (!doctorId.trim()) return setError('Selecione um médico.');

    setLoading(true);
    try {
      await api.createAppointment(token, { date, time, symptoms, doctorId, description });
      setOk('Agendamento criado com sucesso!');
      setDate(''); setTime(''); setSymptoms(''); setDoctorId(''); setDescription('');
      onCreated?.();
    } catch (e: any) {
      setError(String(e?.message || 'Erro ao criar agendamento'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="row" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="row">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <input
        className="input"
        placeholder="Sintomas (obrigatório)"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      {/* SELECT de médicos */}
      {loadingDoctors ? (
        <div style={{ opacity: 0.8 }}>Carregando médicos...</div>
      ) : doctors.length === 0 ? (
        <div style={{ opacity: 0.8 }}>Nenhum médico encontrado.</div>
      ) : (
        <select
          className="input"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        >
          <option value="">Selecione o médico</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name || '(sem nome)'} — {d.email}
            </option>
          ))}
        </select>
      )}

      <input
        className="input"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="button"
        disabled={loading || loadingDoctors || !date || !time || !symptoms.trim() || !doctorId.trim()}
      >
        {loading ? 'Criando...' : 'Criar agendamento'}
      </button>

      {ok && <p style={{ color: '#7bd389' }}>{ok}</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
    </form>
  );
}
