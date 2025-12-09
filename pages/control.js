import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';

export default function Control() {
  const [mode, setMode] = useState('AUTO');
  const [pumpStatus, setPumpStatus] = useState('OFF');
  const [fanStatus, setFanStatus] = useState('OFF');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch control status dari API
  useEffect(() => {
    const fetchControlStatus = async () => {
      try {
        const res = await fetch('/api/control');
        const data = await res.json();
        if (data.success) {
          setMode(data.mode);
          setPumpStatus(data.pump);
          setFanStatus(data.fan);
        }
      } catch (error) {
        console.error('Error fetching control status:', error);
      }
    };

    fetchControlStatus();
    const interval = setInterval(fetchControlStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle mode change
  const handleModeChange = async (newMode) => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: newMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMode(newMode);
        setMessage(`✅ Mode berhasil diubah ke ${newMode}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Gagal mengubah mode');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle pump toggle
  const handlePumpToggle = async () => {
    if (mode !== 'MANUAL') {
      setMessage('⚠️ Hanya bisa kontrol manual di mode MANUAL');
      return;
    }

    const newStatus = pumpStatus === 'OFF' ? 'ON' : 'OFF';
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pump: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPumpStatus(newStatus);
        setMessage(`✅ Pompa diubah ke ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Gagal mengubah status pompa');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle fan toggle
  const handleFanToggle = async () => {
    if (mode !== 'MANUAL') {
      setMessage('⚠️ Hanya bisa kontrol manual di mode MANUAL');
      return;
    }

    const newStatus = fanStatus === 'OFF' ? 'ON' : 'OFF';
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fan: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFanStatus(newStatus);
        setMessage(`✅ Kipas diubah ke ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Gagal mengubah status kipas');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Control Panel - Smart Moss Panel</title>
        <meta name="description" content="Smart Moss Panel Control" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden md:ml-64">
          <div className="px-8 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Control Panel</h1>
                <p className="text-gray-600">Kelola mode operasional dan kontrol perangkat secara manual</p>
              </div>

              {/* Message Alert */}
              {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : message.includes('⚠️') ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
                  <p className="font-semibold">{message}</p>
                </div>
              )}

              {/* Mode Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mode Operasional</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AUTO Mode */}
                  <button
                    onClick={() => handleModeChange('AUTO')}
                    disabled={loading}
                    className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      mode === 'AUTO'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-5xl mb-3">🤖</div>
                    <h3 className="text-2xl font-bold mb-2">Otomatis</h3>
                    <p className="text-sm opacity-90">Sistem bekerja otomatis berdasarkan sensor</p>
                  </button>

                  {/* MANUAL Mode */}
                  <button
                    onClick={() => handleModeChange('MANUAL')}
                    disabled={loading}
                    className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      mode === 'MANUAL'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-5xl mb-3">👆</div>
                    <h3 className="text-2xl font-bold mb-2">Manual</h3>
                    <p className="text-sm opacity-90">Anda bisa kontrol pompa & kipas</p>
                  </button>
                </div>
              </div>

              {/* Manual Control (hanya muncul di mode MANUAL) */}
              {mode === 'MANUAL' && (
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">Kontrol Manual</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pompa */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">💧 Pompa Air</h3>
                          <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-semibold ${pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-600'}`}>{pumpStatus}</span></p>
                        </div>
                        <div className="text-5xl">💦</div>
                      </div>
                      
                      <button
                        onClick={handlePumpToggle}
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                          pumpStatus === 'ON'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg hover:shadow-xl'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pumpStatus === 'ON' ? 'Matikan Pompa' : 'Nyalakan Pompa'}
                      </button>
                    </div>

                    {/* Kipas */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">🌀 Kipas</h3>
                          <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-semibold ${fanStatus === 'ON' ? 'text-green-600' : 'text-gray-600'}`}>{fanStatus}</span></p>
                        </div>
                        <div className="text-5xl">🌬️</div>
                      </div>
                      
                      <button
                        onClick={handleFanToggle}
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                          fanStatus === 'ON'
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg hover:shadow-xl'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {fanStatus === 'ON' ? 'Matikan Kipas' : 'Nyalakan Kipas'}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tips:</strong> Di mode manual, Anda bisa mengontrol pompa dan kipas secara independen. Perubahan akan langsung dikirim ke ESP32.
                    </p>
                  </div>
                </div>
              )}

              {/* Auto Mode Info */}
              {mode === 'AUTO' && (
                <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Status Mode Otomatis</h2>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                    <p className="text-gray-700 mb-4">
                      <strong>Mode Otomatis Aktif</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 ml-4">
                      <li>✅ Pompa menyala otomatis jika tanah kering</li>
                      <li>✅ Kipas menyala otomatis jika suhu &gt; 27°C</li>
                      <li>✅ Kipas mati jika suhu &lt; 25°C</li>
                      <li>✅ Sistem akan terus memantau sensor secara real-time</li>
                    </ul>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg border border-blue-300">
                      <p className="text-sm font-semibold text-blue-900">Status Pompa</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{pumpStatus}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-300">
                      <p className="text-sm font-semibold text-yellow-900">Status Kipas</p>
                      <p className="text-2xl font-bold text-orange-600 mt-2">{fanStatus}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
