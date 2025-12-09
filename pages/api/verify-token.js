import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
    }

    try {
        console.log('🔍 Verifying token:', token);
        
        // Cari token di semua area (Area-001, Area-002, dst)
        const areasRef = collection(db, 'access_tokens');
        const areasSnapshot = await getDocs(areasRef);
        
        console.log('📁 Total areas found:', areasSnapshot.size);
        
        let panelId = null;
        let areaName = null;

        // Loop through setiap area
        for (const areaDoc of areasSnapshot.docs) {
            const areaData = areaDoc.data();
            console.log('📋 Checking area:', areaDoc.id, 'Data:', areaData);
            
            // Cek apakah token ada di salah satu panel (panel01, panel02, panel03)
            for (const [key, value] of Object.entries(areaData)) {
                console.log(`  🔑 ${key} = ${value}`);
                if (value === token) {
                    panelId = key; // Simpan key panel (panel01, panel02, panel03)
                    areaName = areaDoc.id; // Simpan nama area (Area-001)
                    console.log('✅ Token match found! Panel:', panelId, 'Area:', areaName);
                    break;
                }
            }
            
            if (panelId) break;
        }

        if (panelId) {
            console.log('🎉 Authentication successful for', panelId, 'in', areaName);
            // Token valid, set cookies
            res.setHeader('Set-Cookie', [
                `smoss_auth=true; Path=/; Max-Age=86400; HttpOnly=true; SameSite=Strict`, // 24 jam
                `panelId=${panelId}; Path=/; Max-Age=86400; SameSite=Strict`,
                `areaName=${areaName}; Path=/; Max-Age=86400; SameSite=Strict`
            ]);

            return res.status(200).json({ 
                success: true, 
                panelId: panelId,
                areaName: areaName
            });
        } else {
            console.log('❌ Token not found:', token);
            return res.status(401).json({ success: false, message: 'Token tidak valid atau tidak ditemukan' });
        }
    } catch (error) {
        console.error('❌ VERIFY TOKEN ERROR:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error: ' + error.message 
        });
    }
}