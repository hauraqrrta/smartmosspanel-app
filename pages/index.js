import React from 'react'; 
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';

async function fetchDashboardData() {
    // 1. Ambil panelId dari cookie yang sudah diset saat login
    const panelId = Cookies.get('panelId'); 
    
    if (!panelId) {
        console.error("Panel ID tidak ditemukan di cookie.");
        return { latest: null, history: [] };
    }

    // 2. Tambahkan panelId sebagai query parameter saat fetch data
    const res = await fetch(`/api/receive-data?panelId=${panelId}`); 
    
    if (res.status === 200) {
        const data = await res.json();
        return data;
    } else {
        console.error("Gagal fetch data dari API.");
        return { latest: null, history: [] };
    }
}

function HeaderStatusBar({ isOnline, lastUpdate }) {
  return (
    <div className="w-full">
      <div className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-sm py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="text-sm font-medium text-gray-700">{isOnline ? 'Device Online' : 'Device Offline'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT: Home ---
export default function Home() {
  // ... (State dan useEffect tetap sama)
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const panelId = Cookies.get('panelId');

      if (!panelId) {
        console.warn('Panel ID cookie tidak ada. Pastikan sudah login.');
        setIsOnline(false);
        return;
      }

      try {
        const response = await fetch(`/api/receive-data?panelId=${panelId}`);
        const result = await response.json();

        if (result.success) {
          setData(result.latest);
          setHistory(result.history);
          setLastUpdate(new Date());
          setIsOnline(true);
        } else if (!result.success && result.latest === null) {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsOnline(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Enforce no-scroll at document level while this page is mounted.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      document.body.style.overflow = prevBodyOverflow || '';
    };
  }, []);

  const chartData = history.map((item) => {
    const timestamp = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    return {
      time: timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      temperature: item.temperature || 0,
      humidity: item.humidity || 0,
      soilMoisture: item.soilMoisture === 'WET' ? 100 : 0,
      pollution: item.pollution || 0,
    };
  });

  return (
    <>
      <Head>
        <title>Smart Moss Panel </title>
        <meta name="description" content="Smart Moss Panel Monitoring System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

  {/* CONTAINER UTAMA: FLEX ROW (Menghapus padding/margin global) */}
  {/* Menggunakan h-screen agar layout sidebar-main mengisi layar */}
  <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50"> 

  {/* SIDEBAR (W-64) - KIRI */}
  {/* Responsive: hidden on small screens, fixed on md+ so main scrolls independently */}
  <Sidebar />

  {/* MAIN CONTENT AREA (flex-1) - KANAN */}
  {/* Add left margin on md+ to accommodate fixed sidebar */}
  <main className="flex-1 overflow-hidden md:ml-64"> 
          {/* Wrapper untuk mengatur padding horizontal di konten utama (no vertical padding) */}
          <div className="px-8">
            <div className="max-w-7xl mx-auto pb-4">
              {/* Two-column layout: left - four stat boxes; right - system health line chart */}
              {/* Height set to remaining viewport: 100vh minus header (4rem) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-0 h-[calc(100vh-4rem)] overflow-visible">
                {/* Left: 4 stat boxes in 2x2 grid (occupies two columns) */}
                <div className="lg:col-span-2 h-full">
                  {data ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4 h-full">
                    <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-red-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">🌡️</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${data.temperature > 30 ? 'bg-red-500 text-white' : data.temperature > 24 ? 'bg-orange-400 text-white' : 'bg-green-500 text-white'}`}>
                          {data.temperature > 30 ? 'High' : data.temperature > 24 ? 'Warm' : 'Normal'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm font-semibold mb-2">Temperature</h4>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">{data.temperature.toFixed(1)}°C</div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">💧</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${data.humidity > 70 ? 'bg-blue-500 text-white' : data.humidity > 50 ? 'bg-cyan-400 text-white' : 'bg-yellow-400 text-white'}`}>
                          {data.humidity > 70 ? 'High' : data.humidity > 50 ? 'Good' : 'Low'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm font-semibold mb-2">Humidity</h4>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{data.humidity.toFixed(1)}%</div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-green-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">🌿</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${data.soilMoisture === 'WET' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {data.soilMoisture}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm font-semibold mb-2">Soil Moisture</h4>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{data.soilMoisture}</div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-purple-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">🌫️</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${data.pollution && data.pollution > 100 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                          {data.pollution ? (data.pollution > 100 ? 'High' : 'Safe') : 'N/A'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm font-semibold mb-2">Air Quality</h4>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{data.pollution ?? '—'}</div>
                    </div>
                  </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-xl border-2 border-dashed border-green-200">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">⏳</div>
                        <p className="text-xl text-gray-700 font-bold mb-2">Menunggu Data ESP32...</p>
                        <p className="text-sm text-gray-500">Koneksi ke sensor sedang diproses</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Historical Data chart */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-green-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Historical Data</h2>
                  <div className="flex-1 min-h-0">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#6b7280"
                            style={{ fontSize: '11px', fontWeight: '500' }}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            style={{ fontSize: '11px', fontWeight: '500' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                              border: '1px solid #10b981',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              fontSize: '12px', 
                              fontWeight: '600' 
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="🌡️ Temp (°C)"
                            dot={{ fill: '#ef4444', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="humidity" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="💧 Humidity (%)"
                            dot={{ fill: '#3b82f6', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="pollution" 
                            stroke="#9333ea" 
                            strokeWidth={2}
                            name="🌫️ Pollution"
                            dot={{ fill: '#9333ea', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-lg font-semibold">📊 Menunggu Data Historis...</p>
                        <p className="text-sm mt-2">Historical data akan muncul setelah ESP32 mengirim data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div> 
            </div> {/* Penutup wrapper padding */}
          </main>
     </div>
    </>
  );
}