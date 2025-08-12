const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({ error: "Missing API key or Place ID" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(500).json({ error: "Google API error", details: data });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
