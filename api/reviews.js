const fetch = require('node-fetch');

module.exports = async (req, res) => {
  console.log('=== Google Reviews API Function Started ===');
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ 
        error: 'Method not allowed', 
        method: req.method 
      });
    }

    console.log('Checking environment variables...');
    
    // Validate environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    console.log('API Key exists:', !!apiKey);
    console.log('Place ID exists:', !!placeId);

    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Google Places API key',
        debug: 'GOOGLE_PLACES_API_KEY environment variable not set'
      });
    }

    if (!placeId) {
      console.error('Missing GOOGLE_PLACE_ID');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Google Place ID',
        debug: 'GOOGLE_PLACE_ID environment variable not set'
      });
    }

    // Construct Google Places API URL
    const fields = 'reviews,rating,user_ratings_total,name';
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(apiKey)}`;
    
    console.log('Making request to Google Places API...');
    console.log('Place ID preview:', placeId.substring(0, 10) + '...');

    // Make request to Google Places API
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
      console.error('Google Places API error:', errorText);
      return res.status(502).json({ 
        error: 'Failed to fetch from Google Places API',
        status: response.status,
        details: errorText.substring(0, 200) + '...'
      });
    }

    const data = await response.json();
    console.log('Google API response received, status:', data.status);

    // Check Google API response status
    if (data.status && data.status !== 'OK') {
      console.error('Google API error status:', data.status);
      return res.status(400).json({
        error: 'Google Places API error',
        status: data.status,
        message: data.error_message || 'Unknown Google API error'
      });
    }

    // Validate response data
    if (!data.result) {
      console.error('No result in Google API response');
      return res.status(404).json({
        error: 'No place data found for the provided Place ID'
      });
    }

    const result = data.result;
    console.log('Success! Place:', result.name);
    console.log('Rating:', result.rating);
    console.log('Reviews count:', result.reviews ? result.reviews.length : 0);

    // Format response
    const formattedResponse = {
      success: true,
      data: {
        name: result.name || 'Unknown Business',
        rating: result.rating || 0,
        user_ratings_total: result.user_ratings_total || 0,
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

    console.log('=== Function completed successfully ===');
    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Internal server error',
      details: {
        name: error.name,
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};
