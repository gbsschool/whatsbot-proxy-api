export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    status: true,
    message: "School ERP WhatsBot Proxy API is working"
  });
}
