export default async function handler(req, res) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const placeId = process.env.PLACE_ID;

    if (!apiKey || !placeId) {
      return res.status(500).json({ error: "Missing GOOGLE_API_KEY or PLACE_ID" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== "OK") {
      console.error("Google API error:", data);
      return res.status(500).json({ error: "Google API error", details: data });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Function crash:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}

