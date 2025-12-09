import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONTROL_COLLECTION = 'settings';
const CONTROL_DOC_ID = 'main_control';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Ambil control settings dari main_control document
  if (req.method === 'GET') {
    try {
      const docRef = doc(db, CONTROL_COLLECTION, CONTROL_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return res.status(200).json({
          success: true,
          mode: data.mode || 'AUTO',
          pump: data.pump || 'OFF',
          fan: data.fan || 'OFF',
        });
      } else {
        // Default settings jika belum ada
        return res.status(200).json({
          success: true,
          mode: 'AUTO',
          pump: 'OFF',
          fan: 'OFF',
        });
      }
    } catch (error) {
      console.error('GET Control Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error: ' + error.message 
      });
    }
  }

  // POST - Update control settings ke main_control document
  if (req.method === 'POST') {
    try {
      const { mode, pump, fan } = req.body;

      console.log('🔧 Control Update Request:', { mode, pump, fan });

      // Validasi - minimal ada satu field yang di-update
      if (!mode && !pump && !fan) {
        return res.status(400).json({ 
          success: false, 
          message: 'Minimal satu field harus di-update (mode, pump, atau fan)' 
        });
      }

      // Ambil data sebelumnya agar bisa update partial
      const docRef = doc(db, CONTROL_COLLECTION, CONTROL_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      console.log('📋 Current Data:', currentData);

      // Prepare update data
      const updateData = {
        ...currentData,
        mode: mode || currentData.mode || 'AUTO',
        pump: pump || currentData.pump || 'OFF',
        fan: fan || currentData.fan || 'OFF',
        lastUpdated: new Date().toISOString(),
      };

      console.log('✏️ Update Data:', updateData);

      // Validasi values
      if (!['AUTO', 'MANUAL'].includes(updateData.mode)) {
        return res.status(400).json({ success: false, message: 'Invalid mode' });
      }

      if (!['ON', 'OFF'].includes(updateData.pump) || !['ON', 'OFF'].includes(updateData.fan)) {
        return res.status(400).json({ success: false, message: 'Invalid pump/fan status' });
      }

      // Simpan ke Firestore
      await setDoc(docRef, updateData);

      console.log(`✅ Control settings updated: Mode=${updateData.mode}, Pump=${updateData.pump}, Fan=${updateData.fan}`);

      return res.status(200).json({
        success: true,
        message: 'Control settings updated',
        data: { 
          mode: updateData.mode, 
          pump: updateData.pump, 
          fan: updateData.fan 
        },
      });
    } catch (error) {
      console.error('❌ POST Control Error:', error);
      console.error('Error message:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Error: ' + error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
