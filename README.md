# 🌱 Smart Moss Panel - Web Dashboard

Dashboard monitoring real-time untuk sistem Smart Moss Panel menggunakan ESP32.

## 🚀 Fitur

- ✅ Real-time monitoring suhu & kelembaban
- ✅ Status kelembaban tanah
- ✅ Status pompa & kipas
- ✅ Grafik historis data
- ✅ Auto-refresh setiap 5 detik
- ✅ Responsive design (mobile & desktop)
- ✅ API endpoint untuk ESP32

## 📦 Teknologi

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vercel** - Hosting & deployment

## 🛠️ Instalasi Lokal

1. **Clone atau extract folder ini**

2. **Install dependencies:**
```bash
npm install
```

3. **Jalankan development server:**
```bash
npm run dev
```

4. **Buka browser:**
```
http://localhost:3000
```

## 🌐 Deploy ke Vercel

### Cara 1: Deploy via GitHub (Recommended)

1. **Push project ke GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/smartmoss-panel.git
git push -u origin main
```

2. **Deploy di Vercel:**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Klik "Add New Project"
   - Import repository GitHub kamu
   - Klik "Deploy"

### Cara 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Deploy ke production:**
```bash
vercel --prod
```

### Cara 3: Drag & Drop

1. Buka [vercel.com/new](https://vercel.com/new)
2. Drag & drop folder `smartmoss-panel`
3. Klik "Deploy"

## 🔧 Konfigurasi ESP32

Setelah deploy, kamu akan dapat URL seperti:
```
https://smartmoss-panel.vercel.app
```

Update kode ESP32 dengan URL tersebut:

```cpp
const char* vercelURL = "https://smartmoss-panel.vercel.app/api/receive-data";
```

## 📡 API Endpoint

### POST /api/receive-data
Menerima data dari ESP32

**Request Body:**
```json
{
  "temperature": 27.5,
  "humidity": 65.2,
  "soilMoisture": "DRY",
  "pumpStatus": "OFF",
  "fanStatus": "ON",
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil diterima!",
  "data": { ... }
}
```

### GET /api/receive-data
Mengambil data terbaru untuk dashboard

**Response:**
```json
{
  "success": true,
  "latest": { ... },
  "history": [ ... ]
}
```

## 📱 Screenshot

Dashboard menampilkan:
- 🌡️ Suhu real-time
- 💧 Kelembaban udara
- 🌿 Status kelembaban tanah
- ⚙️ Status pompa & kipas
- 📈 Grafik historis

## 🔒 Keamanan (Optional)

Untuk menambahkan API key authentication, edit `pages/api/receive-data.js`:

```javascript
const API_KEY = process.env.API_KEY || "your-secret-key";

if (req.headers['x-api-key'] !== API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Lalu di Vercel dashboard:
- Settings → Environment Variables
- Tambahkan `API_KEY` = `your-secret-key`

Dan di ESP32:
```cpp
http.addHeader("X-API-Key", "your-secret-key");
```

## 🐛 Troubleshooting

### ESP32 tidak bisa kirim data

1. Cek koneksi WiFi ESP32
2. Pastikan URL Vercel sudah benar
3. Cek Serial Monitor untuk error
4. Pastikan API endpoint sudah deploy

### Data tidak muncul di dashboard

1. Refresh browser (Ctrl + F5)
2. Cek Console browser (F12)
3. Pastikan ESP32 sudah kirim data
4. Cek logs di Vercel dashboard

### CORS Error

API sudah include CORS headers, tapi jika masih error:
- Cek `Access-Control-Allow-Origin` di `receive-data.js`
- Pastikan URL ESP32 benar

## 📝 Catatan

- Data disimpan di memory (restart server = data hilang)
- Untuk production, gunakan database (MongoDB, PostgreSQL, dll)
- History maksimal 50 data terakhir
- Auto-refresh setiap 5 detik

## 📄 License

MIT License - Bebas digunakan dan dimodifikasi

## 👨‍💻 Developer

Created with ❤️ for Smart Moss Panel Project

---

**Happy Monitoring! 🌱🚀**
