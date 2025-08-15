'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { AppointmentForm } from '@/ui/AppointmentForm';
import { AppointmentList } from '@/ui/AppointmentList';
import { useRouter } from 'next/navigation';

export default function PacienteDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { data, loading, error, refetch } = useMyAppointments(token);
  const { list: doctors } = useDoctors(token); 

  useEffect(() => {
    if (!user) router.replace('/login');
    else if (user.role !== 1) router.replace('/medico'); 
  }, [user, router]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  if (!user || user.role !== 1) {
    return <div className="container"><div className="card">Redirecionando...</div></div>;
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Olá, {user.name}</h1>
        <button className="button" onClick={handleLogout}>Sair</button>
      </div>

      <div className="card">
        <h2>Novo agendamento</h2>
        <AppointmentForm token={token!} onCreated={refetch} />
      </div>

      <div className="card">
        <h2>Meus agendamentos</h2>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
        {!loading && !error && (!data || data.length === 0) && (
          <p style={{ opacity: 0.8 }}>Você ainda não tem agendamentos.</p>
        )}
        {data && data.length > 0 && (
          <AppointmentList items={data} doctors={doctors} />
        )}
      </div>
    </div>
  );
}
