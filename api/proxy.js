// Vercel Serverless Function - API Proxy
// Bypasses CORS by forwarding requests to AI Studio

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
    const { code, version, question, apiKey } = request.body;

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

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({
      success: false,
      errorMsg: error.message || 'Proxy error'
    });
  }
}
