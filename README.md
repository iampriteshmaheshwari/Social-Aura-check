# Deployment Guide

This application is ready to be deployed to **Vercel** with zero configuration.

### How it works
- The frontend is built using **Vite + React**.
- The API backend is powered by **Vercel Serverless Functions** (located in the `/api` directory).
- We've added client-side image compression to ensure uploaded images never hit Vercel's 4.5MB Serverless Function payload limit.

### Deploying to Vercel via GitHub

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. **Environment Variables**:
   You must add your Gemini API Key in the Vercel project settings before deploying.
   - Name: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
5. Click **Deploy**. Vercel will automatically detect Vite and configure the build settings.

Your app will be live and fully functional on Vercel's edge network!
