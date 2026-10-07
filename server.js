import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-6-luna';

app.use(express.json({ limit: '35mb' }));
app.use(express.static(__dirname));
function promptFor(mode, extra, count) {
  return `You are an expert AI video prompt extractor. Analyze the ordered video frames as evidence of ONE continuous source video. Do not invent details that are not visually supported. Infer motion, continuity, camera movement, framing, lens feel, lighting, environment, character/object appearance, physics, and audio/dialogue only when supported.

MODE: ${mode}
FRAME COUNT: ${count}

USER INSTRUCTIONS:
${extra || 'None'}

Return a production-ready result with these sections:
TITLE
SOURCE VIDEO ANALYSIS
TECHNICAL SPECS
CHARACTER / OBJECT CONSISTENCY
ENVIRONMENT
CAMERA & LENS
LIGHTING & COLOR
ACTION & PHYSICS
AUDIO / DIALOGUE
TIMELINE
NEGATIVE PROMPT
FINAL PROMPT

Rules:
- For 10s 9:16, force duration to 10 seconds and vertical 9:16.
- For Multishot Timeline, give explicit shot ranges and transitions.
- For Storyboard, give numbered frames with visual descriptions.
- Prefer English prompt text, but preserve Indonesian dialogue exactly when dialogue is present or requested.
- Exact Recreation prioritizes fidelity to the source.
- Creative Extraction preserves motion/camera language while allowing creative substitutions.
- Keep character identity, clothing, object geometry and scene continuity consistent when visible.
- The FINAL PROMPT must be directly usable in a modern text-to-video model and be detailed enough to recreate the source visual result.`;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, model }));

app.post('/api/analyze', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'Server belum dikonfigurasi dengan OPENAI_API_KEY.' });
    const { frames, mode, extra } = req.body || {};
    if (!Array.isArray(frames) || frames.length < 1) return res.status(400).json({ error: 'Frame video tidak ditemukan.' });
    if (frames.length > 24) return res.status(400).json({ error: 'Maksimal 24 frame.' });
    const input = [{ role: 'user', content: [
      { type: 'input_text', text: promptFor(mode || 'Exact Recreation', extra || '', frames.length) },
      ...frames.map((image_url) => ({ type: 'input_image', image_url, detail: 'high' }))
    ] }];
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model, input, max_output_tokens: 7000 });
    res.json({ result: response.output_text || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Analisis gagal.' });
  }
});

app.get('*catchall', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*catchall', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
