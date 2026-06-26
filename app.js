export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ status: true });
  }

  try {
    const data = req.method === "POST" ? req.body : req.query;

    const api_token = data.api_token || data.token || "";
    const device_id = data.device_id || "";
    const mobile = data.mobile || "";
    const message = data.message || "";

    if (!api_token || !mobile || !message) {
      return res.status(400).json({
        status: false,
        error: "api_token, mobile, message required"
      });
    }

    const params = new URLSearchParams();
    params.set("api_token", api_token);
    params.set("mobile", mobile);
    params.set("message", message);
    if (device_id) params.set("device_id", device_id);

    const response = await fetch(
      "https://whatsbot.tech/api/send_sms?" + params.toString()
    );

    const text = await response.text();

    return res.status(200).json({
      status: true,
      proxy: "working",
      whatsbot_status: response.status,
      response: text
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message
    });
  }
}
