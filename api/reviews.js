// CommonJS export for better Vercel compatibility
module.exports = async (req, res) => {
  console.log('=== Function Started ===');
  console.log('Node version:', process.version);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  try {
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return res.status(200).end();
    }

    // Only allow GET requests for the main endpoint
    if (req.method !== 'GET') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ 
        error: 'Method not allowed', 
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    console.log('Checking environment variables...');
    
    // Check environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    console.log('API Key exists:', !!apiKey);
    console.log('Place ID exists:', !!placeId);

    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing API key',
        timestamp: new Date().toISOString(),
        debug: 'GOOGLE_PLACES_API_KEY environment variable is not set'
      });
    }

    if (!placeId) {
      console.error('Missing GOOGLE_PLACE_ID environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Place ID',
        timestamp: new Date().toISOString(),
        debug: 'GOOGLE_PLACE_ID environment variable is not set'
      });
    }

    console.log('Environment variables OK, making API request...');

    // Construct the Google Places API URL
    const fieldsParam = 'reviews,rating,user_ratings_total,name';
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fieldsParam)}&key=${encodeURIComponent(apiKey)}`;
    
    console.log('Making request to Google Places API...');
    console.log('Place ID (first 10 chars):', placeId.substring(0, 10) + '...');

    // Import fetch dynamically to avoid module issues
    const fetch = (await import('node-fetch')).default;

    // Make the request to Google Places API
    const response = await fetch(googleApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Accurova-Reviews-Widget/1.0'
      }
    });

    console.log('Google API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error response:', errorText);
      return res.status(502).json({ 
        error: 'Failed to fetch from Google Places API',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        timestamp: new Date().toISOString()
      });
    }

    const data = await response.json();
    console.log('Google API Response received');
    console.log('Response status:', data.status);

    // Check for Google API errors
    if (data.status && data.status !== 'OK') {
      console.error('Google Places API returned error status:', data.status);
      console.error('Error message:', data.error_message);
      
      return res.status(400).json({
        error: 'Google Places API error',
        status: data.status,
        message: data.error_message || 'Unknown error from Google Places API',
        timestamp: new Date().toISOString()
      });
    }

    // Check if result exists
    if (!data.result) {
      console.error('No result in Google Places API response:', data);
      return res.status(404).json({
        error: 'No place data found',
        timestamp: new Date().toISOString()
      });
    }

    const result = data.result;
    console.log('Place found:', result.name);
    console.log('Overall rating:', result.rating);
    console.log('Total ratings:', result.user_ratings_total);
    console.log('Reviews count:', result.reviews ? result.reviews.length : 0);

    // Format the response
    const formattedResponse = {
      success: true,
      data: {
        name: result.name,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
        reviews: result.reviews ? result.reviews.map(review => ({
          author_name: review.author_name,
          author_url: review.author_url,
          profile_photo_url: review.profile_photo_url,
          rating: review.rating,
          relative_time_description: review.relative_time_description,
          text: review.text,
          time: review.time
        })) : []
      },
      timestamp: new Date().toISOString()
    };

    console.log('=== Function Completed Successfully ===');

    // Return successful response
    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Internal server error',
      details: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};
