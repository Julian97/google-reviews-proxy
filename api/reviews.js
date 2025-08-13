export default async function handler(req, res) {
  // Add CORS headers immediately
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log('=== Reviews API Function Started ===');
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('- API Key exists:', !!process.env.GOOGLE_PLACES_API_KEY);
    console.log('- Place ID exists:', !!process.env.GOOGLE_PLACE_ID);

    // Validate environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing API key',
        timestamp: new Date().toISOString()
      });
    }

    if (!placeId) {
      console.error('Missing GOOGLE_PLACE_ID environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Place ID',
        timestamp: new Date().toISOString()
      });
    }

    // Construct the Google Places API URL
    const fieldsParam = 'reviews,rating,user_ratings_total,name';
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fieldsParam)}&key=${encodeURIComponent(apiKey)}`;
    
    console.log('Making request to Google Places API...');
    console.log('Place ID (first 10 chars):', placeId.substring(0, 10) + '...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

    // Make the request to Google Places API
    const response = await fetch(googleApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Accurova-Reviews-Widget/1.0'
      }
    });

    console.log('Google API Response Status:', response.status);
    console.log('Google API Response Headers:', Object.fromEntries(response.headers.entries()));

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

    console.log('=== Reviews API Function Completed Successfully ===');

    // Return successful response
    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('=== CRITICAL ERROR in Reviews API ===');
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
}
