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
    Timestamp,
    where 
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
            
            // Tentukan panelId yang diterima dari ESP32 (harus dikirim di body POST)
            // Jika tidak ada, gunakan 'default'
            const receivedPanelId = data.panelId ?? 'default'; 
            
            // 1. Buat Objek Data Baru
            const newData = {
                temperature: data.temperature ?? 0,
                humidity: data.humidity ?? 0,
                soilMoisture: data.soilMoisture ?? "DRY",
                pumpStatus: data.pumpStatus ?? "OFF",
                fanStatus: data.fanStatus ?? "OFF",
                pollution: data.pollution ?? data.gasLevel ?? 0,
                panelId: receivedPanelId, // <-- TAMBAHAN: Menyimpan ID Panel
                timestamp: Timestamp.now()
            };

            // 2. Update Dokumen Data Terbaru (latest_data)
            // NOTE: Dokumen ini akan menyimpan data latest dari panel terakhir yang mengirim.
            await setDoc(doc(db, HISTORY_COLLECTION, LATEST_DOC_ID), newData);

            // 3. Tambahkan Data ke Koleksi Riwayat
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
        let dataHistory = []; 
        
        // 1. Ambil Panel ID dari URL Query Dashboard
        const requestedPanelId = req.query.panelId;

        // Jika panelId tidak disertakan dalam query URL (misalnya ?panelId=smp001)
        if (!requestedPanelId) {
            // Berikan error atau default ke 'default' tergantung kebutuhan keamanan Anda
            return res.status(401).json({ success: false, error: 'Panel ID is required in URL query.' });
        }
        
        try {
            const historyRef = collection(db, HISTORY_COLLECTION);

            // 2. Tentukan Query dengan Filter (Menggantikan pengambilan LATEST_DOC_ID)
            const q = query(
                historyRef,
                where('panelId', '==', requestedPanelId), // <-- FILTER UTAMA BERDASARKAN ID PANEL
                orderBy('timestamp', 'desc'), 
                limit(MAX_HISTORY)
            ); 
            
            const historySnapshot = await getDocs(q);
            
            // 3. Proses Hasil Snapshot
            
            // Ambil data terbaru dari hasil query history yang sudah difilter
            if (historySnapshot.docs.length > 0) {
                const latestDoc = historySnapshot.docs[0].data();
                latestData = {
                    ...latestDoc,
                    timestamp: latestDoc.timestamp.toDate().getTime()
                };
            }
            
            // Isi array dataHistory dengan riwayat yang difilter
            historySnapshot.forEach((doc) => {
                const data = doc.data();
                // Data ini sudah terfilter berdasarkan panelId
                dataHistory.unshift({ 
                    ...data,
                    timestamp: data.timestamp.toDate().getTime()
                });
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