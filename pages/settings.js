import React, { useState } from 'react';
import Head from 'next/head';

// Small toggle switch
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors ${checked ? 'bg-moss-500' : 'bg-gray-300'}`}
      aria-pressed={checked}
    >
      <span className={`transform transition-transform w-5 h-5 bg-white rounded-full shadow ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function NumberControl({ value, setValue, min = 0, max = 999, suffix = '' }) {
  return (
    <div className="inline-flex items-center space-x-3">
      <button onClick={() => setValue(Math.max(min, value - 1))} className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200">-</button>
      <div className="text-green-600 font-semibold">{value}{suffix}</div>
      <button onClick={() => setValue(Math.min(max, value + 1))} className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200">+</button>
    </div>
  );
}

import Sidebar from '../components/Sidebar'

export default function Settings() {
  const [autoWatering, setAutoWatering] = useState(true);
  const [emergencyStop, setEmergencyStop] = useState(false);

  const [minHumidity, setMinHumidity] = useState(40);
  const [pumpDuration, setPumpDuration] = useState(45);

  return (
    <>
      <Head>
        <title>Settings - Smart Moss Panel</title>
      </Head>

      <div className="flex w-full min-h-screen bg-white-100">
        <Sidebar />

        <main className="flex-1 md:ml-64 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Automation Rules</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-800">Auto-Watering</div>
                    <div className="text-sm text-gray-500">AI-driven based on moisture.</div>
                  </div>
                  <Toggle checked={autoWatering} onChange={setAutoWatering} />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold text-gray-800">Emergency Stop</div>
                    <div className="text-sm text-gray-500">Halt if leakage detected.</div>
                  </div>
                  <Toggle checked={emergencyStop} onChange={setEmergencyStop} />
                </div>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Thresholds</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-800">Min Humidity</div>
                    <div className="text-sm text-gray-500">Trigger below this %</div>
                  </div>
                  <NumberControl value={minHumidity} setValue={setMinHumidity} min={0} max={100} suffix="%" />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold text-gray-800">Pump Duration</div>
                    <div className="text-sm text-gray-500">Max runtime (secs)</div>
                  </div>
                  <NumberControl value={pumpDuration} setValue={setPumpDuration} min={1} max={600} suffix="s" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
