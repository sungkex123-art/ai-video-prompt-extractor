# AI Video Prompt Extractor — Free Hosting Pack

This package is prepared for a $0 hosting deployment on Render Free.

## Important: hosting free vs AI usage
- Render Free can host the Node.js web app at no monthly hosting charge, subject to Render's free-tier limits.
- OpenAI API usage is NOT free. Each analysis uses your OpenAI API account according to the selected model's current pricing.
- Never put the OpenAI API key in the browser code. Set it as the `OPENAI_API_KEY` environment variable on Render.

## Deploy from a phone
1. Create/sign in to a GitHub account.
2. Create a new repository, e.g. `ai-video-prompt-extractor`.
3. Upload every file and folder from this ZIP to the repository (keep `public/`, `server.js`, `package.json`, `render.yaml`, etc.).
4. Open Render and create a new **Web Service** from that GitHub repository.
5. Choose the **Free** plan.
6. Build command: `npm install`
7. Start command: `npm start`
8. Add environment variable:
   - `OPENAI_API_KEY` = your OpenAI API key
9. Optional:
   - `OPENAI_MODEL` = `gpt-6-luna`
10. Deploy.
11. Open the generated `onrender.com` URL on Android Chrome.
12. Use Chrome menu → Add to Home screen / Install app.

## Free-tier behavior
The Render Free web service may sleep after inactivity and can take around a minute to wake on the next request. The local filesystem is ephemeral, so this app should not be used as permanent file storage.

## Security recommendation
For a public website, add authentication/rate limiting before sharing the URL widely. Otherwise anyone who can reach the endpoint may be able to consume your configured API budget.
