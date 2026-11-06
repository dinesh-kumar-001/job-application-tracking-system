require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!name || !email || !plainPassword) {
      throw new Error("Admin environment variables are missing");
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    console.log("Admin account created/updated successfully!");
    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
