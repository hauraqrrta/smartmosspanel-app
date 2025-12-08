// pages/api/receive-data.js

// Import Firebase Functions
// PASTIKAN Anda memiliki file lib/firebase.js dengan konfigurasi dan export 'db'
import { db } from '../../lib/firebase'; 
import { 
    doc, 
    setDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    getDoc,
    Timestamp 
} from 'firebase/firestore'; 

// --- KONSTANTA FIREBASE ---
const LATEST_DOC_ID = 'latest_data'; // Dokumen tunggal untuk data terbaru
const HISTORY_COLLECTION = 'sensor_history'; // Nama Koleksi untuk riwayat data
const MAX_HISTORY = 50; // Batas riwayat yang diambil (hanya untuk GET)


export default async function handler(req, res) {
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ------------------------------------------------------------------
    // A. POST - Terima data dari ESP32 dan tulis ke Firestore
    // ------------------------------------------------------------------
    if (req.method === 'POST') {
        try {
            const data = req.body;
            
            // 1. Buat Objek Data Baru
            const newData = {
                temperature: data.temperature ?? 0,
                humidity: data.humidity ?? 0,
                soilMoisture: data.soilMoisture ?? "DRY",
                pumpStatus: data.pumpStatus ?? "OFF",
                fanStatus: data.fanStatus ?? "OFF",
                timestamp: Timestamp.now(),
                pollution: data.pollution ?? 0
            };

            // 2. Update Dokumen Data Terbaru (Menggantikan logic latestData = ...)
            await setDoc(doc(db, HISTORY_COLLECTION, LATEST_DOC_ID), newData);

            // 3. Tambahkan Data ke Koleksi Riwayat (Menggantikan logic dataHistory.push)
            const historyDocId = Date.now().toString(); 
            await setDoc(doc(db, HISTORY_COLLECTION, historyDocId), newData);

            console.log('📊 Data berhasil disimpan ke Firestore:', newData.timestamp.toDate());
            
            return res.status(200).json({ 
                success: true, 
                message: 'Data berhasil diterima dan disimpan ke Firebase!',
                data: newData
            });
        } catch (error) {
            console.error('FIREBASE WRITE ERROR:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Gagal menyimpan data ke Firebase: ' + error.message
            });
        }
    }

    // ------------------------------------------------------------------
    // B. GET - Ambil data terbaru dan riwayat dari Firestore
    // ------------------------------------------------------------------
    if (req.method === 'GET') {
        let latestData = null;
        let dataHistory = []; // Variabel lokal untuk menampung hasil query

        try {
            // 1. Ambil Data Terbaru
            const latestDocRef = doc(db, HISTORY_COLLECTION, LATEST_DOC_ID);
            const latestDocSnap = await getDoc(latestDocRef);

            if (latestDocSnap.exists()) {
                latestData = {
                    ...latestDocSnap.data(),
                    timestamp: latestDocSnap.data().timestamp.toDate().getTime()
                };
            }

            // 2. Ambil Riwayat (50 data terakhir, diurutkan descending)
            // Ini menggantikan pembacaan dari array dataHistory lokal
            const historyRef = collection(db, HISTORY_COLLECTION);
            const q = query(historyRef, orderBy('timestamp', 'desc'), limit(MAX_HISTORY)); 
            const historySnapshot = await getDocs(q);

            historySnapshot.forEach((doc) => {
                const data = doc.data();
                if (doc.id !== LATEST_DOC_ID) { 
                    dataHistory.unshift({ // unshift untuk memastikan urutan waktu yang benar (terlama di depan)
                        ...data,
                        timestamp: data.timestamp.toDate().getTime()
                    });
                }
            });

            const hasData = !!latestData;
            
            return res.status(200).json({
                success: hasData,
                latest: latestData,
                history: dataHistory
            });
            
        } catch (error) {
            console.error('FIREBASE READ ERROR:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Gagal membaca data dari Firebase: ' + error.message
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}