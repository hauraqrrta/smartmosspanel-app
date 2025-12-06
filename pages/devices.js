import React, { useState } from 'react';
import Head from 'next/head';
// Sidebar/Nav components copied from index.js to keep consistent layout

const devicesSample = [
  { id: 'SMP-001', name: 'Main Lobby', ip: '192.168.1.42', status: 'ONLINE' },
  { id: 'SMP-002', name: 'Meeting Room', ip: '192.168.1.45', status: 'WARNING' },
  { id: 'SMP-003', name: 'Terrace', ip: '192.168.1.50', status: 'OFFLINE' },
];

function StatusBadge({ status }) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
  if (status === 'ONLINE') return <span className={base + ' bg-green-100 text-green-700'}>● {status}</span>;
  if (status === 'WARNING') return <span className={base + ' bg-yellow-100 text-yellow-700'}>● {status}</span>;
  return <span className={base + ' bg-gray-100 text-gray-700'}>● {status}</span>;
}

function NetworkScannerModal({ open, onClose, scanning, foundDevices, onAdd }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Network Scanner</h3>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">CLOSE</button>
        </div>

        <div className="p-8">
          {scanning ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full border-4 border-t-4 border-moss-500 border-t-transparent animate-spin mb-6" />
              <div className="text-lg font-medium text-gray-800">Scanning local network...</div>
              <div className="text-sm text-gray-500 mt-2">Looking for compatible devices</div>
            </div>
          ) : (
            <div>
              <div className="text-center text-moss-600 font-semibold mb-6">{foundDevices.length} Device{foundDevices.length !== 1 ? 's' : ''} Found!</div>
              <div className="space-y-4">
                {foundDevices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-moss-600">
                        <i className="fas fa-wifi" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{d.name}</div>
                        <div className="text-sm text-gray-500">{d.ip}</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => onAdd(d)} className="px-4 py-2 bg-moss-500 hover:bg-moss-600 rounded-md text-white font-semibold">+ ADD</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- NAV HELPERS (copied from pages/index.js) ---
import Sidebar from '../components/Sidebar'

export default function Devices() {
  const [devices, setDevices] = useState(devicesSample);
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);

  const scanNetwork = async () => {
    if (scanning) return;
    setShowScanner(true);
    setScanning(true);
    setFoundDevices([]);

    // simulate scan delay
    await new Promise((r) => setTimeout(r, 1200));

    const foundCount = Math.max(1, Math.floor(Math.random() * 3));
    const results = Array.from({ length: foundCount }).map((_, i) => {
      const idx = devices.length + i + 1;
      return {
        id: `SMP-NEW-${idx}`,
        name: `SMP-NEW-${idx}`,
        ip: `192.168.1.${50 + idx}`,
        status: ['ONLINE', 'WARNING', 'OFFLINE'][Math.floor(Math.random() * 3)],
      };
    });

    setFoundDevices(results);
    setScanning(false);
  };

  const addFoundDevice = (d) => {
    setDevices((prev) => (prev.some((x) => x.id === d.id) ? prev : [...prev, d]));
    setFoundDevices((prev) => prev.filter((x) => x.id !== d.id));
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanning(false);
    setFoundDevices([]);
  };

  return (
    <>
      <Head>
        <title>Devices - Smart Moss Panel</title>
        <meta name="description" content="Devices list" />
      </Head>

      <div className="flex w-full min-h-screen bg-white-100">
        {/* Sidebar (left) */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto md:ml-64">
          <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">Connected Fleet</h1>
                  <p className="text-sm text-gray-500">Manage and monitor your devices</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={scanNetwork}
                    disabled={scanning}
                    className={`px-4 py-2 rounded-lg text-white ${scanning ? 'bg-gray-300 cursor-wait' : 'bg-moss-500 hover:bg-moss-600'}`}
                  >
                    {scanning ? 'Scanning...' : 'Scan Network'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {devices.map((d) => (
                  <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          <i className="fas fa-server"></i>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800">{d.name}</div>
                          <div className="text-sm text-gray-500">{d.id} • {d.ip}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <StatusBadge status={d.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
      <NetworkScannerModal
        open={showScanner}
        onClose={closeScanner}
        scanning={scanning}
        foundDevices={foundDevices}
        onAdd={addFoundDevice}
      />
    </>
  );
}
