export default function handler(req, res) {
  res.status(200).json({
    message: "API is running",
    apiKey: process.env.GOOGLE_API_KEY ? "key present" : "key missing",
    placeId: process.env.PLACE_ID ? "place id present" : "place id missing"
  });
}
