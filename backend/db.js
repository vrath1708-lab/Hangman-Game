const mongoose = require("mongoose");
require("dotenv").config();

async function connectDb() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hangman_game";

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB.");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
}

module.exports = connectDb;