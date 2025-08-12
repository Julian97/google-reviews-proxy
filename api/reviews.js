import fetch from 'node-fetch';

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;  // From Vercel environment variables
  const placeId = process.env.PLACE_ID;       // From Vercel environment variables

  if (!apiKey || !placeId) {
    res.status(500).json({ error: 'API key or Place ID not set in environment variables' });
    return;
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,url&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from Google Places API' });
  }
}
