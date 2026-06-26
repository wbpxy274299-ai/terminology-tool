// Vercel Serverless Function - API Proxy
// Supports both Gemini API and AI Studio API

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(request, response) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(200).end();
  }

  // Only accept POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, question, code, version, apiKey } = request.body;

    if (type === 'gemini') {
      // Call Gemini API
      const geminiApiKey = process.env.GEMINI_API_KEY || '';
      const model = 'gemini-2.0-flash-exp';
      
      if (!geminiApiKey) {
        return response.status(500).json({ 
          success: false, 
          errorMsg: 'Gemini API Key not configured. Set GEMINI_API_KEY in Vercel environment variables.' 
        });
      }

      const apiUrl = `${GEMINI_ENDPOINT}/${model}:generateContent?key=${geminiApiKey}`;
      
      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: question }]
          }]
        })
      });

      const data = await geminiResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return response.status(200).json({
        success: true,
        data: { content: text }
      });

    } else {
      // Call AI Studio API (for backward compatibility)
      if (!code || !question || !apiKey) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      const url = `https://aistudio.alibaba-inc.com/api/aiapp/run/${code}/${version || '1.0.0'}`;

      const aiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'X-AK': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empId: '000000',
          question: question,
          sessionId: 'vf-' + Date.now(),
          stream: false
        })
      });

      const data = await aiResponse.json();

      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return response.status(200).json(data);
    }

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({
      success: false,
      errorMsg: error.message || 'Proxy error'
    });
  }
}
