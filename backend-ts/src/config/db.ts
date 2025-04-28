// const mongoose = require("mongoose");
import mongoose from "mongoose";

import "dotenv/config"
const mongo_uri: string | undefined = process.env.MONGODB_URI

export const connectDB = async () => {
  try {
    await mongoose.connect(mongo_uri as string, {});
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err?.message);
    process.exit(1);
  }
};
