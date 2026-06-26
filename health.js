export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: true,
    message: "WhatsBot Proxy API is working"
  });
}
