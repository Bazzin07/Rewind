import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength > 10 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Payload exceeds 10MB limit'
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Static files for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Server cleanup handler
const cleanup = () => {
  console.log("\nClosing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

// Handle process signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start server only if not already listening
if (!server.listening) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
  });
}