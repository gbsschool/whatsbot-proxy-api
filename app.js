const SCHOOL = "स्व. गुरबक्षसिंग साबरवाल माध्यमिक व उच्च माध्यमिक विद्यालय, नायगाव (भिकापूर)";
const LS = {
  students: "erp_students_v61",
  settings: "erp_settings_v61",
  reports: "erp_reports_v61"
};

function todayISO(){ return new Date().toISOString().slice(0,10); }
function formatDateMarathi(dateStr){
  if(!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = ["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function get(id){ return document.getElementById(id); }
function val(id){ return (get(id)?.value || "").trim(); }

document.addEventListener("DOMContentLoaded", () => {
  ["attDate","hwDate","leaveDate","eduDate","sportDate"].forEach(id => { if(get(id)) get(id).value = todayISO(); });
  loadSettings();
});

function openTab(id, btn){
  document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
  get(id).classList.remove("hidden");
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function saveSettings(){
  const s = {
    proxyUrl: val("proxyUrl").replace(/\/$/,""),
    apiToken: val("apiToken"),
    deviceId: val("deviceId"),
    classTeacher: val("classTeacher"),
    specialTeacher: val("specialTeacher")
  };
  localStorage.setItem(LS.settings, JSON.stringify(s));
  get("settingsMsg").textContent = "Settings save झाले.";
}
function loadSettings(){
  const s = JSON.parse(localStorage.getItem(LS.settings) || "{}");
  if(s.proxyUrl) get("proxyUrl").value = s.proxyUrl;
  if(s.apiToken) get("apiToken").value = s.apiToken;
  if(s.deviceId) get("deviceId").value = s.deviceId;
  if(s.classTeacher) get("classTeacher").value = s.classTeacher;
  if(s.specialTeacher) get("specialTeacher").value = s.specialTeacher;
}
function settings(){
  return JSON.parse(localStorage.getItem(LS.settings) || "{}");
}

async function sendWhatsApp(mobile, message){
  const s = settings();
  if(!s.proxyUrl) throw new Error("Proxy API URL blank आहे. Settings मध्ये Proxy API URL टाका.");
  if(!s.apiToken) throw new Error("API Token blank आहे.");
  if(!mobile) throw new Error("Mobile number blank आहे.");
  if(!message) throw new Error("Message blank आहे.");

  const url = `${s.proxyUrl}/send_sms?mobile=${encodeURIComponent(mobile)}&message=${encodeURIComponent(message)}&api_token=${encodeURIComponent(s.apiToken)}&device_id=${encodeURIComponent(s.deviceId || "")}`;
  const r = await fetch(url);
  const text = await r.text();
  try { return JSON.parse(text); } catch(e) { return {status:false, raw:text}; }
}

function addReport(type, mobile, message){
  const arr = JSON.parse(localStorage.getItem(LS.reports) || "[]");
  arr.unshift({date:new Date().toLocaleString(), type, mobile, message});
  localStorage.setItem(LS.reports, JSON.stringify(arr.slice(0,200)));
}

async function testWhatsApp(){
  try{
    const out = await sendWhatsApp("917507514475","School ERP WhatsBot Test Message");
    get("settingsMsg").textContent = "Test WhatsApp response: " + JSON.stringify(out);
  }catch(e){ alert("WhatsApp Error: " + e.message); }
}

function saveStudent(){
  const st = {
    class: val("studentClass"),
    roll: val("roll"),
    name: val("studentName"),
    mobile: val("parentMobile"),
    dob: val("dob"),
    aadhaar: val("aadhaar")
  };
  const arr = JSON.parse(localStorage.getItem(LS.students) || "[]");
  arr.push(st);
  localStorage.setItem(LS.students, JSON.stringify(arr));
  get("studentMsg").textContent = "विद्यार्थी माहिती Save झाली.";
}

function previewAttendance(){
  get("attPreview").textContent = attendanceMessage();
}
function attendanceMessage(){
  const s = settings();
  const status = val("attStatus");
  let statusMr = status;
  if(status==="Present") statusMr = "उपस्थित";
  if(status==="Absent") statusMr = "अनुपस्थित";
  if(status==="Half Day") statusMr = "अर्धवेळ उपस्थित";
  if(status==="Leave") statusMr = "सुट्टीवर";
  return `आदरणीय पालक,\nदिनांक ${formatDateMarathi(val("attDate"))} रोजी आपल्या पाल्याची उपस्थिती नोंद: ${statusMr}.\nवर्ग: ${val("attClass")}.\n${val("attReason") ? "तपशील: " + val("attReason") + "\\n" : ""}वर्ग शिक्षक: ${s.classTeacher || "श्री पवार डी.एम."}\n${SCHOOL}`;
}
async function sendAttendance(){
  const msg = attendanceMessage();
  get("attPreview").textContent = msg;
  try{
    const out = await sendWhatsApp(val("attMobile"), msg);
    addReport("Attendance", val("attMobile"), msg);
    alert("WhatsApp response: " + JSON.stringify(out));
  }catch(e){ alert("WhatsApp Error: " + e.message); }
}

function previewHomework(){ get("hwPreview").textContent = homeworkMessage(); }
function homeworkMessage(){
  const s = settings();
  return `आदरणीय पालक,\nदिनांक ${formatDateMarathi(val("hwDate"))} रोजी ${val("hwClass")} वर्गात ${val("hwTopic")} हा विषय शिकवण्यात आला.\nवर्गात झालेला अभ्यास: ${val("hwDone")}\nदिलेला गृहपाठ: ${val("hwWork")}\nवर्ग शिक्षक: ${s.classTeacher || "श्री पवार डी.एम."}\n${SCHOOL}`;
}
async function sendHomework(){
  const msg = homeworkMessage();
  get("hwPreview").textContent = msg;
  try{
    const out = await sendWhatsApp(val("hwMobile"), msg);
    addReport("Homework", val("hwMobile"), msg);
    alert("WhatsApp response: " + JSON.stringify(out));
  }catch(e){ alert("WhatsApp Error: " + e.message); }
}

function noticeData(type){
  if(type==="leave") return {title:"सुट्टीची सूचना", cls:val("leaveClass"), date:val("leaveDate"), text:val("leaveText"), mob:val("leaveMobile")};
  if(type==="edu") return {title:"शैक्षणिक कार्यक्रम", cls:val("eduClass"), date:val("eduDate"), text:val("eduText"), mob:val("eduMobile")};
  return {title:"क्रीडा कार्यक्रम / सूचना", cls:val("sportClass"), date:val("sportDate"), text:val("sportText"), mob:val("sportMobile")};
}
async function sendNotice(type){
  const d = noticeData(type);
  const msg = `आदरणीय पालक,\n${d.title}\nदिनांक: ${formatDateMarathi(d.date)}\nवर्ग: ${d.cls}\nतपशील: ${d.text}\n${SCHOOL}`;
  get("noticePreview").textContent = msg;
  try{
    const out = await sendWhatsApp(d.mob, msg);
    addReport(d.title, d.mob, msg);
    alert("WhatsApp response: " + JSON.stringify(out));
  }catch(e){ alert("WhatsApp Error: " + e.message); }
}

function copyTemplate(t){
  const m = {
    present:`आदरणीय पालक,\nदिनांक ${formatDateMarathi(todayISO())} रोजी आपला पाल्य शाळेत उपस्थित आहे.\nवर्ग शिक्षक: श्री पवार डी.एम.\n${SCHOOL}`,
    absent:`आदरणीय पालक,\nदिनांक ${formatDateMarathi(todayISO())} रोजी आपला पाल्य शाळेत अनुपस्थित आहे. कृपया कारण कळवावे.\nवर्ग शिक्षक: श्री पवार डी.एम.\n${SCHOOL}`,
    homework:`आदरणीय पालक,\nआज वर्गात ______ शिकवण्यात आले असून गृहपाठ ______ देण्यात आला आहे.\nवर्ग शिक्षक: श्री पवार डी.एम.\n${SCHOOL}`,
    notice:`आदरणीय पालक,\nमहत्त्वाची सूचना: ______\nदिनांक: ${formatDateMarathi(todayISO())}\n${SCHOOL}`
  };
  get("templateBox").value = m[t];
  navigator.clipboard?.writeText(m[t]);
}

function downloadStudentCSV(){
  const header = "class,roll,name,parent_mobile,dob,aadhaar\\n";
  const rows = JSON.parse(localStorage.getItem(LS.students) || "[]").map(s => [s.class,s.roll,s.name,s.mobile,s.dob,s.aadhaar].map(x=>`"${(x||"").replaceAll('"','""')}"`).join(",")).join("\\n");
  download("student_template.csv", header + rows);
}
function uploadCSV(){
  const f = get("csvFile").files[0];
  if(!f){ get("csvMsg").textContent = "CSV निवडा."; return; }
  get("csvMsg").textContent = "CSV निवडली: " + f.name + " (Demo upload)";
}
function showReports(){
  const arr = JSON.parse(localStorage.getItem(LS.reports) || "[]");
  get("reportBox").textContent = arr.map(r => `${r.date} | ${r.type} | ${r.mobile}\\n${r.message}`).join("\\n\\n---\\n\\n") || "Report उपलब्ध नाही.";
}
function downloadReportCSV(){
  const arr = JSON.parse(localStorage.getItem(LS.reports) || "[]");
  const header = "date,type,mobile,message\\n";
  const rows = arr.map(r => [r.date,r.type,r.mobile,r.message].map(x=>`"${(x||"").replaceAll('"','""')}"`).join(",")).join("\\n");
  download("attendance_report.csv", header + rows);
}
function download(name, text){
  const blob = new Blob([text], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
