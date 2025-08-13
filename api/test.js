// Simple test function - CommonJS format
module.exports = async (req, res) => {
  console.log('=== Test Function Started ===');
  console.log('Node version:', process.version);
  
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const response = {
      success: true,
      message: 'Test function is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        vercelRegion: process.env.VERCEL_REGION || 'unknown',
        hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY,
        hasPlaceId: !!process.env.GOOGLE_PLACE_ID
      }
    };

    console.log('Returning response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in test function:', error);
    return res.status(500).json({
      error: 'Test function error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};
