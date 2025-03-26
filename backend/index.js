// index.js (Entry Point)
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db");

require("dotenv").config();
const app = express();
connectDB()

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/auth', require("./routes/authRoutes.js"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
