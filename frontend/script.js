const API_BASE = "http://localhost:3000";
const MAX_LIVES = 6;

const words = {
    apple: "A common fruit with seeds inside.",
    banana: "A yellow fruit that monkeys love!",
    cherry: "A small red fruit often found on cakes.",
    spaceship: "A vehicle that travels beyond Earth.",
    oxygen: "The gas we need to breathe.",
    library: "A place full of books.",
    computer: "A machine used for calculations and programming.",
    mountain: "A large natural elevation of Earth's surface.",
    volcano: "A mountain that erupts lava.",
    butterfly: "An insect with colorful wings.",
    dinosaur: "A prehistoric reptile that lived millions of years ago."
};

const wordKeys = Object.keys(words);

let currentWord = "";
let guessedWord = [];
let guessedLetters = new Set();
let lives = MAX_LIVES;
let mistakes = 0;
let gameEnded = false;

const canvas = document.getElementById("stickmanCanvas");
const ctx = canvas.getContext("2d");

function pickWord() {
    currentWord = wordKeys[Math.floor(Math.random() * wordKeys.length)];
}

function resetGameState() {
    pickWord();
    guessedWord = "_".repeat(currentWord.length).split("");
    guessedLetters = new Set();
    lives = MAX_LIVES;
    mistakes = 0;
    gameEnded = false;

    document.getElementById("message").innerText = "";
    document.getElementById("hint-message").innerText = "";
    document.getElementById("guess-input").value = "";
    document.getElementById("guess-input").disabled = false;
    clearCanvas();
    updateDisplay();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawStickman() {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    clearCanvas();

    if (mistakes >= 1) {
        ctx.beginPath();
        ctx.moveTo(50, 220);
        ctx.lineTo(170, 220);
        ctx.stroke();
    }
    if (mistakes >= 2) {
        ctx.beginPath();
        ctx.moveTo(80, 220);
        ctx.lineTo(80, 40);
        ctx.stroke();
    }
    if (mistakes >= 3) {
        ctx.beginPath();
        ctx.moveTo(80, 40);
        ctx.lineTo(150, 40);
        ctx.stroke();
    }
    if (mistakes >= 4) {
        ctx.beginPath();
        ctx.moveTo(150, 40);
        ctx.lineTo(150, 65);
        ctx.stroke();
    }
    if (mistakes >= 5) {
        ctx.beginPath();
        ctx.arc(150, 80, 15, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (mistakes >= 6) {
        ctx.beginPath();
        ctx.moveTo(150, 95);
        ctx.lineTo(150, 145);
        ctx.moveTo(150, 110);
        ctx.lineTo(130, 130);
        ctx.moveTo(150, 110);
        ctx.lineTo(170, 130);
        ctx.moveTo(150, 145);
        ctx.lineTo(132, 175);
        ctx.moveTo(150, 145);
        ctx.lineTo(168, 175);
        ctx.stroke();
    }
}

function updateDisplay() {
    document.getElementById("word-display").innerText = guessedWord.join(" ");
    document.getElementById("lives").innerText = String(lives);
    document.getElementById("guessed-letters").innerText = guessedLetters.size
        ? [...guessedLetters].join(", ")
        : "None";
}

function finishGame(message, score) {
    gameEnded = true;
    document.getElementById("message").innerText = message;
    document.getElementById("guess-input").disabled = true;

    const username = localStorage.getItem("username");
    if (!username) {
        return;
    }

    saveScore(username, score)
        .then(fetchLeaderboard)
        .catch((error) => {
            console.error("Score save failed:", error);
        });
}

function submitGuess() {
    if (gameEnded) {
        return;
    }

    const input = document.getElementById("guess-input").value.trim().toLowerCase();
    document.getElementById("guess-input").value = "";

    if (!/^[a-z]$/.test(input)) {
        document.getElementById("message").innerText = "❌ Enter a single letter (a-z).";
        return;
    }

    if (guessedLetters.has(input)) {
        document.getElementById("message").innerText = "⚠️ You already guessed that letter.";
        return;
    }

    guessedLetters.add(input);
    document.getElementById("message").innerText = "";

    if (currentWord.includes(input)) {
        currentWord.split("").forEach((letter, index) => {
            if (letter === input) {
                guessedWord[index] = input;
            }
        });
    } else {
        lives -= 1;
        mistakes += 1;
        drawStickman();
    }

    updateDisplay();

    if (!guessedWord.includes("_")) {
        const score = lives * 10 + Math.max(currentWord.length - guessedLetters.size, 0);
        finishGame("🎉 You won!", score);
    } else if (lives <= 0) {
        finishGame(`💀 Game over! The word was: ${currentWord}`, 0);
    }
}

function showHint() {
    document.getElementById("hint-message").innerText = words[currentWord] || "No hint available!";
}

function restartGame() {
    resetGameState();
}

async function fetchLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard");
    leaderboardList.innerHTML = "";

    try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load leaderboard");
        }

        if (!Array.isArray(data) || data.length === 0) {
            const emptyRow = document.createElement("li");
            emptyRow.innerText = "No scores available yet.";
            leaderboardList.appendChild(emptyRow);
            return;
        }

        data.forEach((player, index) => {
            const li = document.createElement("li");
            li.innerText = `${index + 1}. ${player.username}: ${player.score}`;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        const errRow = document.createElement("li");
        errRow.innerText = "Could not load leaderboard.";
        leaderboardList.appendChild(errRow);
    }
}

async function saveScore(username, score) {
    const token = localStorage.getItem("authToken");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/leaderboard/update`, {
        method: "POST",
        headers,
        body: JSON.stringify({ username, score })
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to save score");
    }
}

async function register() {
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        document.getElementById("register-message").innerText = data.message;
    } catch (error) {
        document.getElementById("register-message").innerText = `❌ ${error.message}`;
    }
}

async function login() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok || !data.token) {
            throw new Error(data.error || "Login failed");
        }

        localStorage.setItem("username", data.username || username);
        localStorage.setItem("authToken", data.token);
        document.getElementById("login-message").innerText = `✅ Logged in as ${data.username || username}`;
    } catch (error) {
        document.getElementById("login-message").innerText = `❌ ${error.message}`;
    }
}

function checkLoginStatus() {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    if (token && username) {
        document.getElementById("login-message").innerText = `✅ Logged in as ${username}`;
    }
}

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    document.getElementById("login-message").innerText = "You are logged out.";
}

document.getElementById("guess-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
    }
});

window.onload = () => {
    checkLoginStatus();
    resetGameState();
    fetchLeaderboard();
};