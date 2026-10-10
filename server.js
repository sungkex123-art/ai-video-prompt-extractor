
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

app.use(express.json({ limit: '35mb' }));
app.use(express.static(__dirname));

app.get('/app.js', (_req, res) =>
  res.sendFile(path.join(__dirname, 'app.js'))
);
app.get('/sw.js', (_req, res) =>
  res.sendFile(path.join(__dirname, 'sw.js'))
);
app.get('/manifest.webmanifest', (_req, res) =>
  res.sendFile(path.join(__dirname, 'manifest.webmanifest'))
);
app.get('/icon.svg', (_req, res) =>
  res.sendFile(path.join(__dirname, 'icon.svg'))
);

function promptFor(mode, extra, count) {
  return `You are an expert AI video prompt extractor. Analyze the ordered video frames as evidence of ONE continuous source video.

MODES: Generate ALL FOUR outputs in this exact order: CREATIVE EXTRACTION, 10s 9:16, MULTISHOT TIMELINE, STORYBOARD. Give each mode its own heading and complete ready-to-use prompt. Do not omit any mode.
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
- Do not invent dialogue when it cannot be established from the frames.
- The FINAL PROMPT must be directly usable in a modern text-to-video model and be detailed enough to recreate the source video.`;
}

function imagePart(dataUrl) {
  if (typeof dataUrl !== 'string') {
    throw new Error('Format frame gambar tidak valid.');
  }

  const match = dataUrl.match(
    /^data:([^;,]+)(?:;[^,]*)?;base64,([\s\S]+)$/
  );

  if (!match) {
    throw new Error('Frame harus berupa gambar Base64.');
  }

  return {
    inline_data: {
      mime_type: match[1],
      data: match[2]
    }
  };
}

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, model })
);

app.post('/api/analyze', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Server belum dikonfigurasi dengan GEMINI_API_KEY di Vercel.'
      });
    }

    const { frames, mode, extra } = req.body || {};

    if (!Array.isArray(frames) || frames.length < 1) {
      return res.status(400).json({
        error: 'Frame video tidak ditemukan.'
      });
    }

    if (frames.length > 24) {
      return res.status(400).json({
        error: 'Maksimal 24 frame.'
      });
    }

    const parts = [
      {
        text: promptFor(
          mode || 'Exact Recreation',
          extra || '',
          frames.length
        )
      },
      ...frames.map(imagePart)
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 7000
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini gagal menganalisis video.'
      });
    }

    const result = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('\n')
      .trim();

    if (!result) {
      return res.status(502).json({
        error: 'Gemini tidak menghasilkan teks. Silakan coba lagi.'
      });
    }

    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err?.message || 'Analisis gagal.'
    });
  }
});

app.get('*catchall', (_req, res) =>
  res.sendFile(path.join(__dirname, 'index.html'))
);

export default app;
