import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const db = new Database("database.sqlite");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.SMTP_USER) {
    console.log("SMTP not configured, skipping email.");
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Image Recognition System" <noreply@visionai.pro>',
      to: email,
      subject: "Welcome to Image Recognition System!",
      text: `Hello ${name},\n\nWelcome to Image Recognition System! Your account has been successfully created. You can now start using our advanced image recognition features.\n\nBest regards,\nThe Image Recognition Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Welcome to Image Recognition System!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We're excited to have you on board. Your account has been successfully created.</p>
          <p>You can now explore our features:</p>
          <ul>
            <li>Image Classification</li>
            <li>Object Detection</li>
            <li>Plant Disease Prediction</li>
            <li>Real-Time Webcam Recognition</li>
          </ul>
          <p>Get started by visiting your dashboard.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Best regards,<br />The Image Recognition Team</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, username, hashedPassword);
      
      const userId = result.lastInsertRowid;
      
      // Send welcome email asynchronously
      sendWelcomeEmail(email, name);

      // Generate tokens for auto-login
      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "7d" });
      
      res.status(201).json({ 
        message: "User created",
        token,
        refreshToken,
        username
      });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: "Username or Email already exists" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, refreshToken, username: user.username });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });
    
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const newToken = jwt.sign({ id: decoded.id, username: decoded.username }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token: newToken });
    } catch (err) {
      res.status(403).json({ error: "Invalid refresh token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
