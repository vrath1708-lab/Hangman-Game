# Hangman Game

A full-stack Hangman game with:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Features: register/login, gameplay, hints, lives/stickman drawing, leaderboard

## Project Structure

- backend/: API server, routes, models, DB connection
- frontend/: game UI
- config/: reserved
- multiplayer/: reserved

## Prerequisites

- Node.js 18+ (or newer)
- MongoDB running locally on port 27017

## Environment Setup

Create or update backend/.env with:

MONGO_URI=mongodb://127.0.0.1:27017/hangman_game
SECRET_KEY=my_secret_key

## Install Dependencies

From the backend folder:

npm install

## Run Backend

From the backend folder:

npm start

Expected logs:
- Connected to MongoDB
- Server running on port 3000

## Run Frontend

Open frontend/index.html in your browser.

The frontend calls the backend at:
- http://localhost:3000/auth/register
- http://localhost:3000/auth/login
- http://localhost:3000/leaderboard
- http://localhost:3000/leaderboard/update

## API Health Check

After backend starts, test:

GET http://localhost:3000/health

Expected response:

{"ok": true}

## Notes

- Scores are saved per username and only updated if the new score is higher.
- If MongoDB is not running, backend startup will fail with connection refused.
- Local development excludes node_modules, env files, and local MongoDB data via .gitignore.
