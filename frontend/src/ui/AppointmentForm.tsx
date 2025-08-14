'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export function AppointmentForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated?: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState(''); // obrigatório
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!symptoms.trim()) {
      setError('Informe os sintomas.');
      return;
    }
    if (!date || !time) {
      setError('Informe data e hora.');
      return;
    }

    setLoading(true);
    try {
      await api.createAppointment(token, { date, time, symptoms, description });
      setOk('Agendamento criado com sucesso!');
      setDate(''); setTime(''); setSymptoms(''); setDescription('');
      onCreated?.();
    } catch (e: any) {
      const msg = String(e?.message || '');
      setError(msg || 'Erro ao criar agendamento');
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
      <input
        className="input"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="button" disabled={loading || !date || !time || !symptoms.trim()}>
        {loading ? 'Criando...' : 'Criar agendamento'}
      </button>
      {ok && <p style={{ color: '#7bd389' }}>{ok}</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
    </form>
  );
}
