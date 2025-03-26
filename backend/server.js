// index.js (Entry Point)
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");

require("dotenv").config();
const app = express();

const allowedOrigins = [
    "http://localhost:3000", // Dev Frontend
    "https://farm-fi.vercel.app", // ✅ Production Frontend
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
app.use(express.json());
app.use(cookieParser);

connectDB()

app.use("/auth", require("./routes/authRoutes"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
