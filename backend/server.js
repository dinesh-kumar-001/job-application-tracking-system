require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:5173"
// }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://jobapplicationtracker-pink.vercel.app",
  "https://jobapplicationtracker-git-main-dineshkumar2.vercel.app",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map(url => url.trim().replace(/\/$/, ""))
    .filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
}));




app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." }
});
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Job Application Tracker API is running" });
});
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid application ID" });
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;


connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0",() => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
