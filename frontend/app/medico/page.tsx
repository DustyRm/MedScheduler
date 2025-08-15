'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDoctorAppointments } from '@/hooks/useAppointments';
import { AppointmentList } from '@/ui/AppointmentList';
import { useRouter } from 'next/navigation';

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MedicoDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [dateISO, setDateISO] = useState<string>(todayISO());

  const { data, loading, error } = useDoctorAppointments(token, dateISO);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 2) {
      router.replace('/paciente');
    }
  }, [user, router]);

  if (!user || user.role !== 2) return null;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Agenda do médico</h1>
        <button className="button" onClick={handleLogout}>Sair</button>
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16 }}
        >
          <label className="row" style={{ gap: 8 }}>
            <span>Data:</span>
            <input
              className="input"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              aria-label="Selecionar data da agenda"
            />
          </label>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        {!loading && !error && (!data || data.length === 0) && (
          <p style={{ opacity: 0.8, marginTop: 12 }}>Nenhum agendamento para esta data.</p>
        )}

        {data && data.length > 0 && (
          <AppointmentList
            items={data}
            showPatient
            hideDoctorColumn
            doctorNameOverride={user.name}
          />
        )}
      </div>
    </div>
  );
}
