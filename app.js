
const SCHOOL = "स्व. गुरबक्षसिंग साबरवाल माध्यमिक व उच्च माध्यमिक विद्यालय, नायगाव (भिकापूर)";
const DEFAULT_LOGO = "https://dummyimage.com/180x180/ffffff/0f766e.png&text=GBS";
const $ = id => document.getElementById(id);
const get = (k,d=[]) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const today = () => new Date().toISOString().slice(0,10);
const cleanMobile = m => { m=String(m||"").replace(/[^0-9]/g,""); return m.length===10 ? "91"+m : m; };

const templates = {
"विद्यार्थी उपस्थित": "आदरणीय पालक,\nआपले पाल्य {student} इयत्ता {class} आज दिनांक {date} रोजी वेळ {time} वाजता शाळेत उपस्थित झाले आहेत.\nवर्ग शिक्षक : {teacher}\n{school}",
"विद्यार्थी अनुपस्थित": "आदरणीय पालक,\nआज दिनांक {date} रोजी आपले पाल्य {student} इयत्ता {class} शाळेत अनुपस्थित आहेत. कृपया अनुपस्थितीचे कारण वर्ग शिक्षकांना कळवावे.\nवर्ग शिक्षक : {teacher}\n{school}",
"Half Day सूचना": "आदरणीय पालक,\nआपले पाल्य {student} इयत्ता {class} आज दिनांक {date} रोजी अर्धवेळ उपस्थित राहिले / सुट्टी घेऊन गेले आहेत. कृपया नोंद घ्यावी.\nवर्ग शिक्षक : {teacher}\n{school}",
"गणित गृहपाठ": "आदरणीय पालक,\nआजचा गणित विषयाचा गृहपाठ:\n{custom}\nकृपया वहीत सोडवून उद्या पाठवावा.\nवर्ग शिक्षक : {teacher}\n{school}",
"सुट्टीची सूचना": "आदरणीय पालक,\nदिनांक {date} रोजी {custom} निमित्त शाळेला सुट्टी राहील. कृपया नोंद घ्यावी.\n{school}",
"परीक्षा सूचना": "आदरणीय पालक,\nदिनांक {date} पासून {custom} परीक्षा/चाचणी सुरू होत आहे. कृपया पाल्याची तयारी करून घ्यावी.\n{school}",
"पालक सभा": "आदरणीय पालक,\nदिनांक {date} रोजी {custom} या संदर्भात पालक सभा आयोजित करण्यात आली आहे. कृपया वेळेवर उपस्थित राहावे.\n{school}",
"फी भरणा सूचना": "आदरणीय पालक,\nआपल्या पाल्याची शालेय फी/बाकी रक्कम प्रलंबित आहे. कृपया ती लवकरात लवकर भरावी.\n{school}"
};

function settings(){return get("settings",{apiUrl:"",apiToken:"",apiDevice:"",teacher:"श्री पवार डी.एम.",specialTeacher:"",logo:DEFAULT_LOGO});}
function fill(t, o){return t.replaceAll("{student}",o.student||"").replaceAll("{class}",o.class||"").replaceAll("{date}",o.date||today()).replaceAll("{time}",o.time||new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})).replaceAll("{teacher}",o.teacher||settings().teacher).replaceAll("{school}",SCHOOL).replaceAll("{custom}",o.custom||"");}

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
function showTab(id){document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelector(`[data-tab="${id}"]`).classList.add("active");document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(id).classList.remove("hidden"); if(id==="settings") loadSettings(); if(id==="reports") renderReports(); if(id==="students") renderStudents(); if(id==="links") renderLinks(); if(id==="users") renderUsers();}

function init(){["aDate","hDate","nDate"].forEach(id=>$(id).value=today()); loadSettings(); renderStudents(); renderAttendance(); renderLinks(); renderUsers(); updateKpi(); loadTemplate();}
window.onload=init;

function updateKpi(){ $("kStudents").textContent=get("students").length; $("kAttend").textContent=get("attendance").length; $("kHomework").textContent=get("homework").length; $("kNotice").textContent=get("notice").length; }
function logout(){alert("Demo logout. Firebase जोडल्यावर पूर्ण logout चालेल.");}

async function addStudent(){
 let mobile=cleanMobile($("sMobile").value);
 if(mobile.length<12) return $("studentMsg").textContent="मोबाईल नंबर 10 अंक किंवा 91 सहित असावा.";
 if($("sAadhar").value && !/^\d{12}$/.test($("sAadhar").value)) return $("studentMsg").textContent="आधार 12 अंक असावा.";
 let arr=get("students"); arr.push({id:Date.now(),name:$("sName").value,class:$("sClass").value,roll:$("sRoll").value,dob:$("sDob").value,aadhar:$("sAadhar").value,mobile}); set("students",arr);
 $("studentMsg").textContent="विद्यार्थी सेव्ह झाला."; renderStudents(); updateKpi();
}
function renderStudents(){let arr=get("students"); $("studentTable").innerHTML="<tr><th>Roll</th><th>Name</th><th>Class</th><th>Mobile</th><th>DOB</th><th>Aadhar</th></tr>"+arr.map(s=>`<tr><td>${s.roll||""}</td><td>${s.name||""}</td><td>${s.class||""}</td><td>${s.mobile||""}</td><td>${s.dob||""}</td><td>${s.aadhar||""}</td></tr>`).join(""); renderAttendance();}
function renderAttendance(){let cls=$("aClass").value; let arr=get("students").filter(s=>s.class===cls); $("attTable").innerHTML="<tr><th>Roll</th><th>Name</th><th>P/A</th><th>Time</th><th>Message</th></tr>"+arr.map(s=>`<tr><td>${s.roll}</td><td>${s.name}</td><td><select id="pa_${s.id}"><option>P</option><option>A</option><option>Half Day</option></select></td><td><input id="tm_${s.id}" value="${new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}"></td><td><textarea id="ms_${s.id}"></textarea></td></tr>`).join("");}
function saveAttendanceAll(){let cls=$("aClass").value; let arr=get("students").filter(s=>s.class===cls); let logs=get("attendance"); arr.forEach(s=>logs.push({date:$("aDate").value,class:cls,student:s.name,mobile:s.mobile,status:$("pa_"+s.id).value,time:$("tm_"+s.id).value,msg:$("ms_"+s.id).value})); set("attendance",logs); $("attMsg").textContent="उपस्थिती सेव्ह झाली."; updateKpi();}
async function sendAttendanceAll(){saveAttendanceAll(); let cls=$("aClass").value; let arr=get("students").filter(s=>s.class===cls); let sent=0,fail=0; for(const s of arr){let st=$("pa_"+s.id).value; let tp=st==="A"?"विद्यार्थी अनुपस्थित":(st==="Half Day"?"Half Day सूचना":"विद्यार्थी उपस्थित"); let msg=$("ms_"+s.id).value || fill(templates[tp],{student:s.name,class:cls,date:$("aDate").value,time:$("tm_"+s.id).value}); let ok=await sendWhatsApp(s.mobile,msg); ok?sent++:fail++; await new Promise(r=>setTimeout(r,900));} $("attMsg").textContent=`WhatsApp पूर्ण: Success ${sent}, Failed ${fail}`;}

function saveHomework(){let arr=get("homework"); arr.push({date:$("hDate").value,class:$("hClass").value,subject:$("hSubject").value,topic:$("hTopic").value,teaching:$("hTeaching").value,work:$("hWork").value}); set("homework",arr); $("hwMsg").textContent="गृहपाठ सेव्ह झाला."; updateKpi();}
async function sendHomework(){saveHomework(); let cls=$("hClass").value; let students=get("students").filter(s=>s.class===cls); let msg=fill(templates["गणित गृहपाठ"],{class:cls,date:$("hDate").value,custom:`${$("hSubject").value}\nTopic: ${$("hTopic").value}\nवर्गात शिकवले: ${$("hTeaching").value}\nगृहपाठ: ${$("hWork").value}`}); let sent=0,fail=0; for(const s of students){(await sendWhatsApp(s.mobile,msg))?sent++:fail++; await new Promise(r=>setTimeout(r,900));} $("hwMsg").textContent=`गृहपाठ WhatsApp: Success ${sent}, Failed ${fail}`;}

function noticeMessage(){let type=$("nType").value; let base=templates[type]||templates["सुट्टीची सूचना"]; return fill(base,{class:$("nClass").value,date:$("nDate").value,custom:$("nDetails").value});}
function previewNotice(){ $("nPreview").value=noticeMessage(); }
function saveNotice(){let arr=get("notice"); arr.push({date:$("nDate").value,class:$("nClass").value,type:$("nType").value,details:$("nDetails").value,msg:noticeMessage()}); set("notice",arr); $("noticeMsgBox").textContent="सूचना सेव्ह झाली."; updateKpi();}
async function sendNotice(){previewNotice(); saveNotice(); let msg=noticeMessage(); let mob=cleanMobile($("nMobile").value); let list=mob?[{mobile:mob}]:get("students").filter(s=>$("nClass").value==="सर्व वर्ग"||s.class===$("nClass").value); let sent=0,fail=0; for(const s of list){(await sendWhatsApp(s.mobile,msg))?sent++:fail++; await new Promise(r=>setTimeout(r,900));} $("noticeMsgBox").textContent=`सूचना WhatsApp: Success ${sent}, Failed ${fail}`;}

function loadTemplate(){ $("templateText").value=templates[$("templateType").value]||""; }
function copyTemplate(){ $("templateText").select(); document.execCommand("copy"); alert("Template Copy झाला.");}

function addLink(){let arr=get("links"); arr.push({title:$("linkTitle").value,url:$("linkUrl").value}); set("links",arr); renderLinks();}
function renderLinks(){let arr=get("links"); $("linkTable").innerHTML="<tr><th>Title</th><th>Link</th></tr>"+arr.map(x=>`<tr><td>${x.title}</td><td><a target="_blank" href="${x.url}">Open</a></td></tr>`).join("");}

function addUser(){let arr=get("users"); arr.push({name:$("uName").value,role:$("uRole").value,pass:$("uPass").value}); set("users",arr); renderUsers();}
function renderUsers(){let arr=get("users"); $("userTable").innerHTML="<tr><th>Name</th><th>Role</th><th>Password</th></tr>"+arr.map(u=>`<tr><td>${u.name}</td><td>${u.role}</td><td>${u.pass}</td></tr>`).join("");}

function loadSettings(){let s=settings(); $("apiUrl").value=s.apiUrl; $("apiToken").value=s.apiToken; $("apiDevice").value=s.apiDevice; $("setTeacher").value=s.teacher; $("setSpecialTeacher").value=s.specialTeacher||""; $("setLogo").value=s.logo||""; $("schoolLogo").src=s.logo||DEFAULT_LOGO;}
function saveSettings(){set("settings",{apiUrl:$("apiUrl").value.trim().replace(/\/$/,""),apiToken:$("apiToken").value.trim(),apiDevice:$("apiDevice").value.trim(),teacher:$("setTeacher").value,specialTeacher:$("setSpecialTeacher").value,logo:$("setLogo").value||DEFAULT_LOGO}); loadSettings(); $("settingMsg").textContent="Settings save झाले.";}
async function sendManual(){let ok=await sendWhatsApp($("manualMobile").value,$("manualMessage").value); $("manualMsg").textContent=ok?"Message request success.":"Message failed. Console तपासा.";}

async function sendWhatsApp(mobile,message){
 let s=settings(); let base=(s.apiUrl||"").replace(/\/$/,"");
 if(!base) { console.error("API URL blank"); return false; }
 let url=`${base}/send_sms?mobile=${encodeURIComponent(cleanMobile(mobile))}&message=${encodeURIComponent(message)}&api_token=${encodeURIComponent(s.apiToken)}&device_id=${encodeURIComponent(s.apiDevice)}`;
 try{let r=await fetch(url); let t=await r.text(); console.log("WhatsBot response",r.status,t); return r.ok && !/error|failed|invalid|unauthorized/i.test(t);}
 catch(e){console.error(e); return false;}
}

function downloadStudentTemplate(){let csv="name,class,roll,dob,aadhar,mobile\nकु. विद्यार्थी नाव,9वी,1,2010-01-01,123456789012,917507514475\n"; download("student_template.csv",csv);}
function uploadCSV(){let f=$("csvFile").files[0]; if(!f) return; let rd=new FileReader(); rd.onload=()=>{let lines=rd.result.split(/\r?\n/).filter(Boolean); let arr=get("students"); lines.slice(1).forEach(l=>{let [name,cls,roll,dob,aadhar,mobile]=l.split(","); if(name) arr.push({id:Date.now()+Math.random(),name,class:cls,roll,dob,aadhar,mobile:cleanMobile(mobile)});}); set("students",arr); $("csvMsg").textContent="CSV Upload झाले."; renderStudents(); updateKpi();}; rd.readAsText(f);}
function renderReports(){let logs=get("attendance"); $("reportTable").innerHTML="<tr><th>Date</th><th>Class</th><th>Name</th><th>Status</th><th>Time</th><th>Mobile</th></tr>"+logs.map(x=>`<tr><td>${x.date}</td><td>${x.class}</td><td>${x.student}</td><td>${x.status}</td><td>${x.time}</td><td>${x.mobile}</td></tr>`).join("");}
function downloadAttendanceCSV(){let logs=get("attendance"); let csv="date,class,student,status,time,mobile\n"+logs.map(x=>[x.date,x.class,x.student,x.status,x.time,x.mobile].map(v=>`"${String(v||"").replaceAll('"','""')}"`).join(",")).join("\n"); download("attendance_report.csv",csv);}
function download(name,content){let a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content],{type:"text/csv"})); a.download=name; a.click();}
