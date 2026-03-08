# Image Recognition System - Production-Ready Image Recognition System

A high-performance, AI-driven image analysis platform built with React, Express, and Gemini AI.

## Features

- **Image Classification**: High-accuracy classification with confidence scoring.
- **Object Detection**: Real-time bounding box generation and detailed object analysis.
- **Plant Disease Prediction**: Specialized analysis for agricultural health (PlantVillage style).
- **Image Information Generator**: Deep insights, nutritional data, and benefits.
- **Real-Time Webcam Recognition**: Live stream analysis with dynamic structured information.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, SQLite (better-sqlite3).
- **AI**: Google Gemini 3 Flash (via @google/genai).
- **Auth**: JWT (Access + Refresh tokens), Bcrypt password hashing.

## Deployment Instructions

### Backend (Render)
1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI API Key.
   - `JWT_SECRET`: A secure random string.
4. Build Command: `npm run build`
5. Start Command: `npm start`

### Frontend (Vercel)
1. Import your project to Vercel.
2. The `vite build` command will generate the `dist` folder.
3. Set Environment Variables:
   - `VITE_API_URL`: Your Render backend URL.

## Local Setup

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Run `npm run dev` to start the development server.

## Project Structure

- `server.ts`: Express server with Auth and SQLite integration.
- `src/App.tsx`: Main application routing.
- `src/pages/`: Page components (Dashboard, Auth).
- `src/services/gemini.ts`: AI service layer using Google GenAI SDK.
- `src/hooks/`: Custom React hooks for auth and state.
- `src/lib/`: Utility functions and auth helpers.
