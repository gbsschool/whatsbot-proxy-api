VERIFIED WhatsBot Proxy API Project

ही फाईल रचना बरोबर आहे:

api/
  health.js
  send_sms.js
package.json
vercel.json

महत्त्वाचे:
1. send_sms.js हा code app.js मध्ये टाकू नये.
2. api/send_sms.js या exact path मध्येच हवा.
3. api/health.js या exact path मध्येच हवा.
4. GitHub वर upload केल्यानंतर api folder दिसला पाहिजे.
5. Vercel वर Redeploy करा.

Test 1:
https://YOUR-VERCEL-URL.vercel.app/api/health

Expected:
{"status":true,"message":"WhatsBot Proxy API is working"}

Test 2:
https://YOUR-VERCEL-URL.vercel.app/api/send_sms?mobile=917507514475&message=test&api_token=30f4848f-ed51-42e0-989c-685204f085a2&device_id=46081

ERP Settings:
Proxy API URL:
https://YOUR-VERCEL-URL.vercel.app/api

API Token:
30f4848f-ed51-42e0-989c-685204f085a2

Device ID:
46081
