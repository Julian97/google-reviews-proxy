module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const response = {
      success: true,
      message: 'Test function working!',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY,
        hasPlaceId: !!process.env.GOOGLE_PLACE_ID,
        vercelRegion: process.env.VERCEL_REGION || 'unknown'
      },
      debug: {
        method: req.method,
        url: req.url,
        apiKeyLength: process.env.GOOGLE_PLACES_API_KEY ? process.env.GOOGLE_PLACES_API_KEY.length : 0,
        placeIdLength: process.env.GOOGLE_PLACE_ID ? process.env.GOOGLE_PLACE_ID.length : 0
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Test function error',
      message: error.message,
      stack: error.stack
    });
  }
};
