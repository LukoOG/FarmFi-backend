import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import "dotenv/config"

import productRoutes from "./routes/productRoutes"
import orderRoutes from "./routes/orderRoutes"
import authRoutes from "./routes/authRoutes"

const app = express();

const allowedOrigins = [
    "http://localhost:3000", // Dev Frontend
    "https://farm-fi.vercel.app", // ✅ Production Frontend
  ];
  
  app.use(
    cors({
        origin: function (origin, callback: Function) {
            // bypass the requests with no origin (like curl requests, mobile apps, etc )
            if (!origin) return callback(null, true);
        
            if (allowedOrigins.indexOf(origin) === -1) {
              var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
              return callback(new Error(msg), false);
            }
            return callback(null, true);
          },
      // origin: "http://localhost:3000",
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
  }, 6000);

//app routes
app.use("/auth", authRoutes)
app.use("/product", productRoutes)
app.use("/order", orderRoutes)

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("⚠️ MongoDB connection closed due to app termination");
  process.exit(0);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server running on port ${PORT}`));