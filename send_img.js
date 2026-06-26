export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).json({ status: true });

  try {
    const data = req.method === "POST" ? req.body : req.query;
    const api_token = data.api_token || data.token || process.env.WHATSBOT_API_TOKEN;
    const device_id = data.device_id || data.device || process.env.WHATSBOT_DEVICE_ID || "";
    const mobile = data.mobile;
    const media_url = data.img_url;
    const caption = data.img_caption || data.caption || "";

    if (!api_token || !mobile || !media_url) {
      return res.status(400).json({ status: false, error: "api_token, mobile, img_url required" });
    }

    const params = new URLSearchParams();
    params.set("api_token", api_token);
    params.set("mobile", mobile);
    params.set("img_url", media_url);
    if (caption) params.set("img_caption", caption);
    if (device_id) params.set("device_id", device_id);

    const response = await fetch("https://whatsbot.tech/api/send_img?" + params.toString());
    const text = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) {}

    return res.status(200).json({
      status: true,
      endpoint: "send_img",
      whatsbot_status: response.status,
      response: parsed || text
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
}
