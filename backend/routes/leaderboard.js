const express = require("express");
const Leaderboard = require("../models/Leaderboard");
const router = express.Router();

// Retrieve top players from the leaderboard
router.get("/", async (req, res) => {
    try {
        const results = await Leaderboard.find({}, { _id: 0, username: 1, score: 1 })
            .sort({ score: -1, updatedAt: 1 })
            .limit(10)
            .lean();
        res.json(results);
    } catch (err) {
        console.error("❌ Error fetching leaderboard:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// Update or insert player scores in leaderboard
router.post("/update", async (req, res) => {
    const username = (req.body.username || "").trim();
    const score = Number(req.body.score);

    if (!username || Number.isNaN(score)) {
        return res.status(400).json({ error: "Missing username or score" });
    }

    if (score < 0) {
        return res.status(400).json({ error: "Score cannot be negative" });
    }

    try {
        await Leaderboard.findOneAndUpdate(
            { username },
            { $max: { score } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ message: "✅ Score updated!" });
    } catch (err) {
        console.error("❌ Error updating leaderboard:", err);
        return res.status(500).json({ error: "Failed to update leaderboard" });
    }
});

module.exports = router;