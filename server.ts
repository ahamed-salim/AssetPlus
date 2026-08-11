import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { initDatabase } from './server/config/db';
import apiRoutes from './server/routes';
import { errorHandler } from './server/middleware/errorHandler';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AssetPulse Enterprise API', 
    timestamp: new Date().toISOString() 
  });
});

// Mount All Backend REST API Routes
app.use('/api', apiRoutes);

// Gemini AI Assistant Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are AssetPulse AI Assistant, an expert digital asset lifecycle advisor and enterprise IT asset management (ITAM/EAM) copilot.
You help IT directors, asset managers, technicians, and employees manage equipment, compliance, warranties, repair vs replace decisions, maintenance scheduling, and audits.

System Context:
${context ? JSON.stringify(context) : 'General AssetPulse System context loaded.'}

Guidelines:
- Provide structured, professional, concise and actionable guidance.
- When asked for recommendations (e.g. Repair vs Replace, Audit reconciliation, Warranty claim, Maintenance tips), use clear bullet points, risk metrics, and financial reasoning.
- Keep responses friendly, objective, and authoritative.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }
      ]
    });

    const replyText = response.text || 'I analyzed your request. Let me know if you need specific details on any asset or lifecycle record.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process AI assistant request.', 
      details: error.message || 'Make sure GEMINI_API_KEY is configured in Secrets.' 
    });
  }
});

// Catch-all 404 handler for unmatched /api routes to prevent Vite HTML fallback for API calls
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Express Server with Vite middleware in development
async function start() {
  // Initialize Database connection / schema
  await initDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AssetPulse Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
