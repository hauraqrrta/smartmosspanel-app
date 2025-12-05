// Global variable untuk menyimpan data (dalam production gunakan database)
let latestData = {
  temperature: 0,
  humidity: 0,
  soilMoisture: "DRY",
  pumpStatus: "OFF",
  fanStatus: "OFF",
  timestamp: Date.now()
};

let dataHistory = [];
const MAX_HISTORY = 50; // Simpan 50 data terakhir

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST - Terima data dari ESP32
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Update latest data
      latestData = {
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        soilMoisture: data.soilMoisture || "DRY",
        pumpStatus: data.pumpStatus || "OFF",
        fanStatus: data.fanStatus || "OFF",
        timestamp: Date.now()
      };

      // Tambahkan ke history
      dataHistory.push({...latestData});
      
      // Batasi history
      if (dataHistory.length > MAX_HISTORY) {
        dataHistory.shift();
      }

      console.log('📊 Data diterima dari ESP32:', latestData);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Data berhasil diterima!',
        data: latestData
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // GET - Ambil data terbaru untuk dashboard
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      latest: latestData,
      history: dataHistory
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
