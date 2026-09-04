'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Optional: Add user details to Firestore here if needed
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Acest e-mail este deja înregistrat.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail invalid.');
      } else {
        setError('A apărut o eroare la înregistrare. Încearcă din nou.');
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
            <h2 className="text-3xl font-bold text-[#0a192f]">Creează cont</h2>
            <p className="mt-2 text-sm text-[#0a192f]/70">
              Alătură-te comunității Tevinde.ro
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
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
                placeholder="Minim 6 caractere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0a192f] mb-1">
                Confirmă parola
              </label>
              <input
                type="password"
                required
                className="w-full bg-white border border-[#0a192f]/20 text-[#0a192f] text-sm py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#fcd042] transition-all"
                placeholder="Repetă parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fcd042] hover:bg-[#fcd042]/90 text-[#0a192f] font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se încarcă...' : 'Înregistrare'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#0a192f]/70">
              Ai deja cont?{' '}
              <Link href="/autentificare" className="font-semibold text-[#0a192f] hover:underline">
                Intră în cont
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
