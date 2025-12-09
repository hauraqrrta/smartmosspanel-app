import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/verify-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/');
            } else {
                setError(data.message || 'Token tidak valid.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - Smart Moss Panel</title>
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div >
                            <img src="/assets/logonya.png" alt="Smart Moss Panel" className="w-auto mx-auto" />
                        </div>
                        <p className="text-gray-600">Sistem Monitoring Lumut Cerdas</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Access Token
                                </label>
                                <input
                                    id="token"
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Masukkan token"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                                    <p className="font-medium">❌ {error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memverifikasi...
                                    </span>
                                ) : (
                                    '🔐 Masuk ke Dashboard'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">💡 Hubungi administrator untuk mendapatkan token</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>© 2025 Smart Moss Panel. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}