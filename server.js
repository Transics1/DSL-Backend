require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");

const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const allowedOrigins = [
  // 'https://dsl-frontend-git-main-satviks-projects-a1d39169.vercel.app/',
  'https://dsl-frontend-satviks-projects-a1d39169.vercel.app'
  // 'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: "OK"
    });
  }
  
  next();
});

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {

  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => 
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.log(err));
