import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { KENYA_LOCATIONS_RAW } from "./src/data/kenya_locations_data.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("recruitment.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'applicant',
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    doc_type TEXT,
    doc_number TEXT,
    gender TEXT,
    dob TEXT,
    phone TEXT,
    country TEXT,
    county_id INTEGER,
    constituency_id INTEGER,
    ward_id INTEGER,
    pwd TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (county_id) REFERENCES counties(id),
    FOREIGN KEY (constituency_id) REFERENCES constituencies(id),
    FOREIGN KEY (ward_id) REFERENCES wards(id)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    location TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    ref_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    UNIQUE(user_id, job_id)
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    institution TEXT,
    qualification TEXT,
    start_date TEXT,
    end_date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company TEXT,
    position TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT,
    organization TEXT,
    phone TEXT,
    email TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    commission_name TEXT DEFAULT 'National Job Recruitment Portal',
    contact_email TEXT DEFAULT 'support@recruitment.go.ke',
    allow_registrations INTEGER DEFAULT 1,
    maintenance_mode INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS counties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS constituencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    county_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (county_id) REFERENCES counties(id)
  );

  CREATE TABLE IF NOT EXISTS wards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    constituency_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
  );
`);

// Seed location data if empty
const countiesCount = db.prepare("SELECT COUNT(*) as count FROM counties").get() as any;
if (countiesCount.count === 0) {
  const insertCounty = db.prepare("INSERT INTO counties (name) VALUES (?)");
  const insertConstituency = db.prepare("INSERT INTO constituencies (county_id, name) VALUES (?, ?)");
  const insertWard = db.prepare("INSERT INTO wards (constituency_id, name) VALUES (?, ?)");

  const countyChunks = KENYA_LOCATIONS_RAW.split('#');
  countyChunks.forEach(chunk => {
    const [countyName, rest] = chunk.split('|');
    if (!countyName || !rest) return;

    const countyResult = insertCounty.run(countyName);
    const countyId = countyResult.lastInsertRowid;

    const constituencyChunks = rest.split(';');
    constituencyChunks.forEach(cChunk => {
      const [constName, wRest] = cChunk.split(':');
      if (!constName || !wRest) return;

      const constResult = insertConstituency.run(countyId, constName);
      const constId = constResult.lastInsertRowid;

      const wardNames = wRest.split(',');
      wardNames.forEach(wardName => {
        if (wardName) insertWard.run(constId, wardName);
      });
    });
  });
}

// Insert default settings if not exists
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as any;
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (id) VALUES (1)").run();
}

// Seed initial admin and jobs if empty
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)")
    .run("admin@portal.go.ke", "admin123", "admin", "System", "Administrator");
}

const jobsCount = db.prepare("SELECT COUNT(*) as count FROM jobs").get() as { count: number };
if (jobsCount.count === 0) {
  const seedJobs = [
    { title: "Voter Registration Clerk", department: "Enhanced Continuous Voter Registration (ECVR)", location: "Ward", deadline: "2026-03-15" },
    { title: "ICT Clerk", department: "Information Technology", location: "Constituency", deadline: "2026-03-20" },
    { title: "Voter Registration Assistant (VRA)", department: "Field Operations", location: "County", deadline: "2026-03-10" }
  ];
  const insertJob = db.prepare("INSERT INTO jobs (title, department, location, deadline) VALUES (?, ?, ?, ?)");
  seedJobs.forEach(job => insertJob.run(job.title, job.department, job.location, job.deadline));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, password, first_name, last_name, doc_type, doc_number, gender, dob, phone, country, county_id, constituency_id, ward_id, pwd } = req.body;
      const result = db.prepare(`
        INSERT INTO users (email, password, first_name, last_name, doc_type, doc_number, gender, dob, phone, country, county_id, constituency_id, ward_id, pwd)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(email, password, first_name, last_name, doc_type, doc_number, gender, dob, phone, country, county_id, constituency_id, ward_id, pwd);
      res.json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Job Routes
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { title, department, description, location, deadline } = req.body;
    const result = db.prepare("INSERT INTO jobs (title, department, description, location, deadline) VALUES (?, ?, ?, ?, ?)")
      .run(title, department, description, location, deadline);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/jobs/:id", (req, res) => {
    const { title, department, description, location, deadline, status } = req.body;
    db.prepare("UPDATE jobs SET title = ?, department = ?, description = ?, location = ?, deadline = ?, status = ? WHERE id = ?")
      .run(title, department, description, location, deadline, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/jobs/:id", (req, res) => {
    db.prepare("DELETE FROM jobs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Application Routes
  app.get("/api/applications", (req, res) => {
    const { user_id, job_id } = req.query;
    let query = `
      SELECT a.*, j.title as job_title, j.department, u.first_name, u.last_name, u.doc_number, c.name as county
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      LEFT JOIN counties c ON u.county_id = c.id
    `;
    const params: any[] = [];
    if (user_id) {
      query += " WHERE a.user_id = ?";
      params.push(user_id);
    } else if (job_id) {
      query += " WHERE a.job_id = ?";
      params.push(job_id);
    }
    query += " ORDER BY a.applied_at DESC";
    const applications = db.prepare(query).all(...params);
    res.json(applications);
  });

  app.post("/api/applications", (req, res) => {
    const { user_id, job_id } = req.body;
    const ref_number = `IEBC-${job_id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const result = db.prepare("INSERT INTO applications (user_id, job_id, ref_number) VALUES (?, ?, ?)")
        .run(user_id, job_id, ref_number);
      res.json({ id: result.lastInsertRowid, ref_number });
    } catch (error: any) {
      res.status(400).json({ error: "You have already applied for this position." });
    }
  });

  app.patch("/api/applications/:id", (req, res) => {
    const { status, notes } = req.body;
    db.prepare("UPDATE applications SET status = ?, notes = ? WHERE id = ?")
      .run(status, notes, req.params.id);
    
    // Create notification for the user
    const application = db.prepare("SELECT user_id, ref_number FROM applications WHERE id = ?").get(req.params.id) as any;
    if (application) {
      db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
        .run(
          application.user_id, 
          "Application Status Updated", 
          `Your application ${application.ref_number} has been updated to: ${status}.`,
          status === 'Shortlisted' ? 'success' : (status === 'Rejected' ? 'error' : 'info')
        );
    }
    
    res.json({ success: true });
  });

  // User Profile & Details
  app.get("/api/users", (req, res) => {
    const users = db.prepare(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.doc_number, c.name as county, u.created_at 
      FROM users u 
      LEFT JOIN counties c ON u.county_id = c.id
      WHERE u.role = 'applicant' 
      ORDER BY u.created_at DESC
    `).all();
    res.json(users);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare(`
      SELECT u.*, c.name as county, co.name as constituency, w.name as ward
      FROM users u
      LEFT JOIN counties c ON u.county_id = c.id
      LEFT JOIN constituencies co ON u.constituency_id = co.id
      LEFT JOIN wards w ON u.ward_id = w.id
      WHERE u.id = ?
    `).get(req.params.id) as any;
    if (user) {
      const education = db.prepare("SELECT * FROM education WHERE user_id = ?").all(req.params.id);
      const experience = db.prepare("SELECT * FROM experience WHERE user_id = ?").all(req.params.id);
      const referees = db.prepare("SELECT * FROM referees WHERE user_id = ?").all(req.params.id);
      res.json({ ...user, education, experience, referees });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { first_name, middle_name, last_name, phone, county_id, constituency_id, ward_id } = req.body;
    db.prepare("UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, phone = ?, county_id = ?, constituency_id = ?, ward_id = ? WHERE id = ?")
      .run(first_name, middle_name, last_name, phone, county_id, constituency_id, ward_id, req.params.id);
    res.json({ success: true });
  });

  // Education Endpoints
  app.post("/api/education", (req, res) => {
    const { user_id, institution, qualification, start_date, end_date } = req.body;
    const result = db.prepare("INSERT INTO education (user_id, institution, qualification, start_date, end_date) VALUES (?, ?, ?, ?, ?)")
      .run(user_id, institution, qualification, start_date, end_date);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/education/:id", (req, res) => {
    db.prepare("DELETE FROM education WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Experience Endpoints
  app.post("/api/experience", (req, res) => {
    const { user_id, company, position, start_date, end_date, description } = req.body;
    const result = db.prepare("INSERT INTO experience (user_id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)")
      .run(user_id, company, position, start_date, end_date, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/experience/:id", (req, res) => {
    db.prepare("DELETE FROM experience WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Referee Endpoints
  app.post("/api/referees", (req, res) => {
    const { user_id, name, organization, phone, email } = req.body;
    const result = db.prepare("INSERT INTO referees (user_id, name, organization, phone, email) VALUES (?, ?, ?, ?, ?)")
      .run(user_id, name, organization, phone, email);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/referees/:id", (req, res) => {
    db.prepare("DELETE FROM referees WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin Stats
  app.get("/api/admin/stats", (req, res) => {
    const totalJobs = db.prepare("SELECT COUNT(*) as count FROM jobs").get() as any;
    const totalApplications = db.prepare("SELECT COUNT(*) as count FROM applications").get() as any;
    const pendingReviews = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'Pending'").get() as any;
    const shortlisted = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'Shortlisted'").get() as any;
    
    const appsPerJob = db.prepare(`
      SELECT j.title, COUNT(a.id) as count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
    `).all();

    const appsPerCounty = db.prepare(`
      SELECT c.name as county, COUNT(a.id) as count
      FROM users u
      JOIN applications a ON u.id = a.user_id
      JOIN counties c ON u.county_id = c.id
      GROUP BY u.county_id
    `).all();

    res.json({
      totalJobs: totalJobs.count,
      totalApplications: totalApplications.count,
      pendingReviews: pendingReviews.count,
      shortlisted: shortlisted.count,
      appsPerJob,
      appsPerCounty
    });
  });

  app.get("/api/admin/reports/stats", (req, res) => {
    const countyStats = db.prepare(`
      SELECT c.name as county, COUNT(*) as count 
      FROM users u
      JOIN counties c ON u.county_id = c.id
      WHERE u.role = 'applicant' AND u.county_id IS NOT NULL 
      GROUP BY u.county_id 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `).all();

    const genderStats = db.prepare(`
      SELECT gender, COUNT(*) as count 
      FROM users 
      WHERE role = 'applicant' AND gender IS NOT NULL 
      GROUP BY gender
    `).all();

    res.json({ countyStats, statusStats, genderStats });
  });

  // Settings Endpoints
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(settings);
  });

  app.put("/api/settings", (req, res) => {
    const { commission_name, contact_email, allow_registrations, maintenance_mode } = req.body;
    db.prepare("UPDATE settings SET commission_name = ?, contact_email = ?, allow_registrations = ?, maintenance_mode = ? WHERE id = 1")
      .run(commission_name, contact_email, allow_registrations, maintenance_mode);
    res.json({ success: true });
  });

  // Notifications Endpoints
  app.get("/api/notifications/:user_id", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.params.user_id);
    res.json(notifications);
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/notifications", (req, res) => {
    const { user_id, title, message, type } = req.body;
    const result = db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
      .run(user_id, title, message, type || 'info');
    res.json({ id: result.lastInsertRowid });
  });

  // Documents Endpoints
  app.get("/api/documents/:user_id", (req, res) => {
    const documents = db.prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC").all(req.params.user_id);
    res.json(documents);
  });

  app.post("/api/documents", (req, res) => {
    const { user_id, name, type, size, url } = req.body;
    const result = db.prepare("INSERT INTO documents (user_id, name, type, size, url) VALUES (?, ?, ?, ?, ?)")
      .run(user_id, name, type, size, url);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/documents/:id", (req, res) => {
    db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Location Endpoints
  app.get("/api/counties", (req, res) => {
    const counties = db.prepare("SELECT * FROM counties ORDER BY name ASC").all();
    res.json(counties);
  });

  app.get("/api/constituencies", (req, res) => {
    const { county_id } = req.query;
    if (!county_id) return res.status(400).json({ error: "county_id is required" });
    const constituencies = db.prepare("SELECT * FROM constituencies WHERE county_id = ? ORDER BY name ASC").all(county_id);
    res.json(constituencies);
  });

  app.get("/api/wards", (req, res) => {
    const { constituency_id } = req.query;
    if (!constituency_id) return res.status(400).json({ error: "constituency_id is required" });
    const wards = db.prepare("SELECT * FROM wards WHERE constituency_id = ? ORDER BY name ASC").all(constituency_id);
    res.json(wards);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
