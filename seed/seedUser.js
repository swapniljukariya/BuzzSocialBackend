const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../database/db");
const User = require("../models/User");
const users = require("../data/dummyData"); // Adjust path as needed

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany(); // Delete existing users (optional)
    await User.insertMany(users);
    console.log("✅ Dummy Data Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting data:", error);
    process.exit(1);
  }
};

importData();
