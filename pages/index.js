import { useState, useEffect } from 'react';
import Head from 'next/head';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: "DRY",
    pumpStatus: "OFF",
    fanStatus: "OFF",
    timestamp: Date.now()
  });
  
  const [history, setHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Fetch data setiap 5 detik
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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsOnline(false);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Update setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  // Format timestamp untuk chart
  const chartData = history.map((item, index) => ({
    name: index.toString(),
    temp: item.temperature,
    humi: item.humidity,
  }));

  return (
    <>
      <Head>
        <title>Smart Moss Panel - Dashboard</title>
        <meta name="description" content="Smart Moss Panel Monitoring System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              🌱 Smart Moss Panel
            </h1>
            <p className="text-white/80 text-lg">Real-time Monitoring System</p>
            
            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {lastUpdate && (
                <span className="text-white/60 text-xs">
                  • Updated {lastUpdate.toLocaleTimeString('id-ID')}
                </span>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Temperature Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🌡️</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.temperature > 30 ? 'bg-red-100 text-red-700' : 
                  data.temperature > 24 ? 'bg-orange-100 text-orange-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {data.temperature > 30 ? 'High' : data.temperature > 24 ? 'Warm' : 'Normal'}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Temperature</h3>
              <p className="text-3xl font-bold text-gray-800">{data.temperature.toFixed(1)}°C</p>
            </div>

            {/* Humidity Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💧</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.humidity > 70 ? 'bg-blue-100 text-blue-700' : 
                  data.humidity > 50 ? 'bg-cyan-100 text-cyan-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {data.humidity > 70 ? 'High' : data.humidity > 50 ? 'Good' : 'Low'}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Humidity</h3>
              <p className="text-3xl font-bold text-gray-800">{data.humidity.toFixed(1)}%</p>
            </div>

            {/* Soil Moisture Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🌿</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.soilMoisture === 'WET' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {data.soilMoisture}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Soil Moisture</h3>
              <p className="text-3xl font-bold text-gray-800">{data.soilMoisture}</p>
            </div>

            {/* System Status Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">⚙️</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.pumpStatus === 'ON' || data.fanStatus === 'ON' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {data.pumpStatus === 'ON' || data.fanStatus === 'ON' ? 'Active' : 'Idle'}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">System Status</h3>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pump:</span>
                  <span className={`text-sm font-bold ${data.pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-400'}`}>
                    {data.pumpStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fan:</span>
                  <span className={`text-sm font-bold ${data.fanStatus === 'ON' ? 'text-green-600' : 'text-gray-400'}`}>
                    {data.fanStatus}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Chart Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Historical Data</h2>
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Temperature (°C)"
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humi" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Humidity (%)"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">Waiting for data from ESP32...</p>
                <p className="text-sm mt-2">Data akan muncul setelah ESP32 mengirim data pertama</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <p className="text-sm mb-2">
                💡 <strong>Tip:</strong> Data diperbarui secara otomatis setiap 5 detik
              </p>
              <p className="text-xs text-white/60">
                ESP32 mengirim data setiap 15 detik • Powered by Vercel
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
