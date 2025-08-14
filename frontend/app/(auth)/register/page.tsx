'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      const v = res.user.role; // 1 | 2
      router.replace(v === 1 ? '/paciente' : '/medico');
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (/e-?mail.*(já|existe)/i.test(msg)) {
        setError('E-mail já registrado.');
      } else {
        setError(msg || 'Erro ao cadastrar');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 560, margin: '64px auto' }}>
        <h1>Criar conta</h1>
        <form onSubmit={onSubmit} className="row" style={{ flexDirection: 'column', gap: 12 }}>
          <input className="input" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="row" style={{ gap: 8 }}>
            <label><input type="radio" checked={role === 1} onChange={() => setRole(1)} /> Paciente</label>
            <label><input type="radio" checked={role === 2} onChange={() => setRole(2)} /> Médico</label>
          </div>
          <button className="button" disabled={loading}>{loading ? 'Enviando...' : 'Cadastrar'}</button>
          {error && <p style={{ color: 'salmon' }}>{error}</p>}
        </form>
        <p>Já tem conta? <Link className="link" href="/login">Entrar</Link></p>
      </div>
    </div>
  );
}
