export default function handler(req, res) {
  res.status(200).json({
    message: "API is running",
    apiKey: process.env.GOOGLE_API_KEY ? "present" : "missing",
    placeId: process.env.PLACE_ID ? "present" : "missing"
  });
}
