export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.PLACE_ID;

  if (!apiKey || !placeId) {
    res.status(500).json({ error: "Missing API key or Place ID" });
    return;
  }

  try {
    // Use global fetch, supported in Node 18+
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      res.status(500).json({ error: "Google API error", details: data });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed", details: error.message });
  }
}
