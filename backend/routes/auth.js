const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// User Registration (Fixed)
router.post("/register", async (req, res) => {
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";

    // Ensure username and password exist
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required!" });
    }

    if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ error: "Username must be 3+ chars and password 6+ chars." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.json({ message: "✅ User registered successfully!" });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Username already exists." });
        }
        res.status(500).json({ error: "❌ Registration failed" });
    }
});

// User Login (Fixed)
router.post("/login", async (req, res) => {
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";

    // Ensure username and password exist
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required!" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "❌ Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: "1h" });
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: "❌ Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;