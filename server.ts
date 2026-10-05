import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    group_name TEXT,
    type TEXT,
    location TEXT,
    description TEXT,
    media_url TEXT,
    datetime TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sos_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dynamic_images (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Dynamic Image Persistence Routes
  app.get('/api/images', (req, res) => {
    try {
      const stmt = db.prepare('SELECT key, value FROM dynamic_images');
      const rows = stmt.all() as { key: string; value: string }[];
      const images: Record<string, string> = {};
      rows.forEach(row => {
        images[row.key] = row.value;
      });
      res.json(images);
    } catch (error) {
      console.error('Fetch images error:', error);
      res.status(500).json({ error: 'Failed to fetch dynamic images' });
    }
  });

  app.post('/api/images', (req, res) => {
    const { key, value } = req.body;
    try {
      const stmt = db.prepare('INSERT OR REPLACE INTO dynamic_images (key, value) VALUES (?, ?)');
      stmt.run(key, value);
      res.json({ success: true });
    } catch (error) {
      console.error('Save image error:', error);
      res.status(500).json({ error: 'Failed to save dynamic image' });
    }
  });

  app.delete('/api/images/:key', (req, res) => {
    const { key } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM dynamic_images WHERE key = ?');
      stmt.run(key);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Failed to delete dynamic image' });
    }
  });

  app.post('/api/incidents', (req, res) => {
    const { name, group_name, type, location, description, media_url, datetime } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO incidents (name, group_name, type, location, description, media_url, datetime) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, group_name, type, location, description, media_url, datetime);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to report incident' });
    }
  });

  app.get('/api/incidents', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM incidents ORDER BY created_at DESC');
      const incidents = stmt.all();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch incidents' });
    }
  });

  app.post('/api/sos', (req, res) => {
    const { location } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO sos_alerts (location) VALUES (?)');
      const info = stmt.run(location || 'Unknown');
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to trigger SOS' });
    }
  });

  app.get('/api/sos', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM sos_alerts ORDER BY created_at DESC');
      const alerts = stmt.all();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch SOS alerts' });
    }
  });

  app.get('/api/stats', (req, res) => {
    try {
      const incidentsCount = db.prepare('SELECT COUNT(*) as count FROM incidents').get() as { count: number };
      const sosCount = db.prepare('SELECT COUNT(*) as count FROM sos_alerts').get() as { count: number };
      
      const typesStmt = db.prepare('SELECT type, COUNT(*) as count FROM incidents GROUP BY type');
      const types = typesStmt.all();

      res.json({
        totalIncidents: incidentsCount.count,
        totalSos: sosCount.count,
        types
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
