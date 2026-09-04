'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail sau parolă incorectă.');
      } else {
        setError('A apărut o eroare la autentificare. Încearcă din nou.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">
      <Navbar favoriteCount={0} />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-[#0a192f]/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0a192f]">Autentificare</h2>
            <p className="mt-2 text-sm text-[#0a192f]/70">
              Bine ai revenit pe Tevinde.ro
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#0a192f] mb-1">
                Adresă de e-mail
              </label>
              <input
                type="email"
                required
                className="w-full bg-white border border-[#0a192f]/20 text-[#0a192f] text-sm py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#fcd042] transition-all"
                placeholder="exemplu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0a192f] mb-1">
                Parolă
              </label>
              <input
                type="password"
                required
                className="w-full bg-white border border-[#0a192f]/20 text-[#0a192f] text-sm py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#fcd042] transition-all"
                placeholder="Introdu parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fcd042] hover:bg-[#fcd042]/90 text-[#0a192f] font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se încarcă...' : 'Intră în cont'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#0a192f]/70">
              Nu ai cont?{' '}
              <Link href="/inregistrare" className="font-semibold text-[#0a192f] hover:underline">
                Creează unul
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
