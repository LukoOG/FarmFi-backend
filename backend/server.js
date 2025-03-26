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
        // origin: function (origin, callback) {
        //     // bypass the requests with no origin (like curl requests, mobile apps, etc )
        //     if (!origin) return callback(null, true);
        
        //     if (allowedOrigins.indexOf(origin) === -1) {
        //       var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        //       return callback(new Error(msg), false);
        //     }
        //     return callback(null, true);
        //   },
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
app.use(express.json());
app.use(cookieParser());

connectDB()
setInterval(() => {
    if (global.gc) {
      global.gc();
      console.log("✅ Garbage collection forced");
    }
  }, 60000);

app.use("/auth", require("./routes/authRoutes"))
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("⚠️ MongoDB connection closed due to app termination");
  process.exit(0);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server running on port ${PORT}`));
