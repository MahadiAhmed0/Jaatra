require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";

const seedAdmin = async () => {
  try {
    await connectDB();

    const exists = await User.findOne({ email: ADMIN_EMAIL });
    if (exists) {
      console.log(`Admin already exists: ${ADMIN_EMAIL} (role: ${exists.role})`);
      if (exists.role !== "admin") {
        exists.role = "admin";
        await exists.save();
        console.log("Role promoted to admin");
      }
    } else {
      await User.create({
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
