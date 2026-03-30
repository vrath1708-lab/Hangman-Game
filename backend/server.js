const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
	res.json({ ok: true });
});

app.use("/auth", require("./routes/auth"));
app.use("/leaderboard", require("./routes/leaderboard"));

const PORT = process.env.PORT || 3000;

async function startServer() {
	await connectDb();
	app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

startServer();