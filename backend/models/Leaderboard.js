const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
