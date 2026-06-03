<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/24ff362a-5433-4ddc-8caf-23cf2e873a54

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `VITE_GEMINI_API_KEY` if you use Gemini features.
   Local API calls use `VITE_API_BASE_URL=/api/v1` and Vite proxies them to `VITE_API_PROXY_TARGET`.
   For a deployed frontend, set `VITE_API_BASE_URL` to the deployed backend API URL and allow the frontend domain in backend CORS.
3. Run the app:
   `npm run dev`
