'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { HttpError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const role = res.user.role; // 1 | 2
      router.replace(role === 1 ? '/paciente' : '/medico');
    } catch (err: unknown) {
      console.error('[LOGIN ERROR]', err);
      let msg =
        (err as any)?.message && String((err as any).message).trim()
          ? String((err as any).message)
          : '';
          
      if (err instanceof HttpError && err.status === 401) {
        msg = 'Credenciais inválidas.';
      }
      // fallback
      if (!msg) msg = 'Erro ao fazer login.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: '64px auto' }}>
        <h1>Entrar</h1>

        <form onSubmit={onSubmit} className="row" style={{ flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div style={{ minHeight: 22 }}>
            {error ? <p style={{ color: 'salmon', margin: 0 }} aria-live="polite">{error}</p> : null}
          </div>
        </form>

        <p>Não tem conta? <Link className="link" href="/register">Cadastre-se</Link></p>
      </div>
    </div>
  );
}
