// index.js (Entry Point)
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");

require("dotenv").config();
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser);

connectDB()

app.use("/auth", require("./routes/authRoutes"))

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
