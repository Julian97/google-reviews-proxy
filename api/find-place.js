const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API key' });
    }
    
    // Search for Accurova business
    const searchQueries = [
      'Accurova Singapore',
      'Accurova 309C Anchorvale Road Singapore',
      '309C Anchorvale Road Singapore',
      'Accurova Sengkang Singapore'
    ];
    
    const results = [];
    
    for (const query of searchQueries) {
      console.log('Searching for:', query);
      
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        results.push({
          query,
          status: data.status,
          results: data.results.map(place => ({
            name: place.name,
            place_id: place.place_id,
            formatted_address: place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types
          }))
        });
      } else {
        results.push({
          query,
          status: data.status,
          error_message: data.error_message,
          results: []
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      searches: results,
      timestamp: new Date().toISOString(),
      note: 'Look for your business in the results and use the place_id'
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Search error',
      message: error.message
    });
  }
};
