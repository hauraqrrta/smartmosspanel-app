import React from 'react'; 
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Sidebar from '../components/Sidebar'


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
  const [data, setData] = useState({
    temperature: 0, humidity: 0, soilMoisture: "DRY", pumpStatus: "OFF", fanStatus: "OFF", timestamp: Date.now()
  });
  
  const [history, setHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/receive-data');
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

  const chartData = history.map((item, index) => ({
    name: index.toString(), temp: item.temperature, humi: item.humidity,
  }));

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
  <div className="flex w-full min-h-screen bg-white-100"> 
        
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4 h-full">
                    <div className="bg-white rounded-2xl p-6 shadow-xl h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">🌡️</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.temperature > 30 ? 'bg-red-100 text-red-700' : data.temperature > 24 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {data.temperature > 30 ? 'High' : data.temperature > 24 ? 'Warm' : 'Normal'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm">Temperature</h4>
                      <div className="text-3xl md:text-4xl font-bold text-gray-800">{data.temperature.toFixed(1)}°C</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">💧</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.humidity > 70 ? 'bg-blue-100 text-blue-700' : data.humidity > 50 ? 'bg-cyan-100 text-cyan-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {data.humidity > 70 ? 'High' : data.humidity > 50 ? 'Good' : 'Low'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm">Humidity</h4>
                      <div className="text-3xl md:text-4xl font-bold text-gray-800">{data.humidity.toFixed(1)}%</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">🌿</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.soilMoisture === 'WET' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {data.soilMoisture}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm">Soil Moisture</h4>
                      <div className="text-3xl md:text-4xl font-bold text-gray-800">{data.soilMoisture}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">🟣</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${data.polutionLevel && data.polutionLevel > 100 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {data.polutionLevel ? (data.polutionLevel > 100 ? 'High' : 'Normal') : 'N/A'}
                        </div>
                      </div>
                      <h4 className="text-gray-600 text-sm">Pollution</h4>
                      <div className="text-3xl md:text-4xl font-bold text-gray-800">{data.polutionLevel ?? '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Right: System Health chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">System Health</h2>
                  <div className="flex-1 min-h-0">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                          <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' }} />
                          <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="System Health" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Waiting for data from ESP32...</p>
                        <p className="text-sm mt-2">System health akan muncul setelah data tersedia</p>
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