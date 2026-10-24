"use strict";
console.log("book-class 앱이 준비되었습니다");
const LETTERS=[..."ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ"];
const INITIALS=[..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const DOUBLE={"ㄲ":"ㄱ","ㄸ":"ㄷ","ㅃ":"ㅂ","ㅆ":"ㅅ","ㅉ":"ㅈ"};
const COLORS=["#e6eedf","#f6e8db","#e5ecf5","#f1e4ee","#f3edcd","#dff0ec"];
const KEY="book-class-consonants-v1";
const MOCK=[
{id:"s1",name:"강현수",words:["인공지능","기술","로봇","미래","상상","공존","학습"]},
{id:"s2",name:"김서연",words:["인공지능","로봇","미래","마음","친구","윤리","질문"]},
{id:"s3",name:"박지우",words:["인공지능","기술","미래","데이터","배움","함께","꿈"]},
{id:"s4",name:"이도윤",words:["로봇","기술","인공지능","선택","책임","판단","코딩"]},
{id:"s5",name:"정하린",words:["미래","인공지능","로봇","상상","존중","탐구","표현"]},
{id:"s6",name:"최민준",words:["기술","인공지능","미래","연결","소통","느낌","우리"]}];
// 한글 음절 = 초성 × 588 + 중성 × 28 + 종성 + 0xAC00.
function getInitial(word){
 const code=word.trim().normalize("NFC").charCodeAt(0);
 if(code<0xac00||code>0xd7a3||!Number.isFinite(code))return null;
 const initial=INITIALS[Math.floor((code-0xac00)/588)];
 return DOUBLE[initial]||initial;
}
function load(){
 try{
  const data=JSON.parse(localStorage.getItem(KEY));
  if(Array.isArray(data)&&data.length===MOCK.length&&data.every((s,i)=>s.id===MOCK[i].id&&s.name===MOCK[i].name&&Array.isArray(s.words)&&s.words.length<=200&&s.words.every(w=>typeof w==="string"&&w.length<=24&&getInitial(w))))return data;
 }catch(e){}
 return MOCK.map(s=>({...s,words:[...s.words]}));
}
let students=load(),current="s1",teacherStudent="s1",view="cloud",target=null,frame;
const $=id=>document.getElementById(id);
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
const active=()=>students.find(s=>s.id===current);
function announce(message){$("status").textContent=message;}
function options(select,value){students.forEach(s=>{const o=el("option","",s.name);o.value=s.id;select.append(o);});select.value=value;}
function chip(word,index,remove){
 const n=el("span","chip");n.style.background=COLORS[LETTERS.indexOf(getInitial(word))%COLORS.length];n.append(el("span","",word));
 if(remove){const b=el("button","","×");b.type="button";b.setAttribute("aria-label",word+" 삭제");b.onclick=()=>remove(index);n.append(b);}
 return n;
}
function renderBoard(){
 const board=$("board");board.replaceChildren();const s=active();
 LETTERS.forEach(initial=>{
  const card=el("article","card"),head=el("div","bar"),add=el("button","add","+ 추가"),chips=el("div","chips");
  add.type="button";add.setAttribute("aria-label",initial+" 칸에 단어 추가");add.onclick=()=>openAdd(initial);
  head.append(el("h3","",initial),add);
  s.words.forEach((word,index)=>{if(getInitial(word)===initial)chips.append(chip(word,index,i=>{
   const deleted=s.words.splice(i,1)[0];changed(deleted+" 단어를 지웠어요.");
   board.querySelectorAll(".card")[LETTERS.indexOf(initial)].querySelector(".add").focus();
  }));});
  if(!chips.childElementCount)chips.append(el("p","empty","어떤 낱말이 떠오르나요?"));
  card.append(head,chips);board.append(card);
 });
 const book=el("article","book");
 book.append(el("div","symbol","📖"),el("small","","오늘의 독서 주제"),el("h2","","인공지능과 함께\n살아갈 미래"),el("p","","책 속의 낱말에 나의 생각을 더해요."),el("span","count",s.name+" · "+s.words.length+"개 낱말 · "+new Set(s.words.map(getInitial)).size+"/14 자음"));
 board.append(book);
}
function changed(message){
 let saved=true;try{localStorage.setItem(KEY,JSON.stringify(students));}catch(e){saved=false;}
 renderBoard();if(!$("teacherPanel").hidden)renderTeacher();
 announce(message+(saved?"":" 저장 공간을 사용할 수 없어 이번 화면에서만 유지됩니다."));
}
function addWord(raw,expected){
 const word=raw.trim().normalize("NFC"),initial=getInitial(word);
 if(!initial)return "한글로 시작하는 낱말을 입력해 주세요.";
 if(word.length>24)return "24자 이내로 입력해 주세요.";
 if(expected&&expected!==initial)return word+"의 초성은 "+initial+"입니다. "+expected+"으로 시작하는 낱말을 입력해 주세요.";
 if(active().words.includes(word))return "이미 나의 판에 있는 낱말이에요.";
 if(active().words.length>=200)return "학생당 200개까지 입력할 수 있어요.";
 active().words.push(word);changed(word+" → "+initial+" 칸에 채웠어요.");return "";
}
$("wordForm").onsubmit=e=>{e.preventDefault();const error=addWord($("wordInput").value);if(error)announce(error);else $("wordInput").value="";$("wordInput").focus();};
options($("studentSelect"),current);
$("studentSelect").onchange=e=>{current=e.target.value;renderBoard();announce(active().name+" 학생의 판입니다.");};
function mode(teacher){
 $("studentPanel").hidden=teacher;$("teacherPanel").hidden=!teacher;
 $("studentMode").setAttribute("aria-pressed",String(!teacher));$("teacherMode").setAttribute("aria-pressed",String(teacher));
 announce("");if(teacher)renderTeacher();
}
$("studentMode").onclick=()=>mode(false);$("teacherMode").onclick=()=>mode(true);
const tabs=[...document.querySelectorAll("[data-view]")];
function choose(tab){view=tab.dataset.view;tabs.forEach(t=>{t.setAttribute("aria-selected",String(t===tab));t.tabIndex=t===tab?0:-1;});$("teacherContent").setAttribute("aria-labelledby",tab.id);renderTeacher();}
tabs.forEach((tab,i)=>{
 tab.onclick=()=>choose(tab);
 tab.onkeydown=e=>{let next;if(e.key==="ArrowRight")next=(i+1)%3;if(e.key==="ArrowLeft")next=(i+2)%3;if(e.key==="Home")next=0;if(e.key==="End")next=2;if(next!==undefined){e.preventDefault();tabs[next].focus();choose(tabs[next]);}};
});
function frequencies(){
 const counts=new Map();students.forEach(s=>s.words.forEach(w=>counts.set(w,(counts.get(w)||0)+1)));
 return [...counts].map(([word,count])=>({word,count})).sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word,"ko"));
}
function result(s){
 const card=el("article","result");card.append(el("h3","",s.name),el("p","",s.words.length+"개 낱말 · "+new Set(s.words.map(getInitial)).size+"/14 자음 채움"));
 s.words.forEach((w,i)=>card.append(chip(w,i)));if(!s.words.length)card.append(el("p","","아직 등록한 낱말이 없어요."));return card;
}
function renderTeacher(){
 const entries=frequencies(),stats=$("stats"),content=$("teacherContent");stats.replaceChildren();content.replaceChildren();
 [["참여 학생",students.filter(s=>s.words.length).length+"명"],["모인 낱말",students.reduce((a,s)=>a+s.words.length,0)+"개"],["서로 다른 생각",entries.length+"개"]].forEach(([label,value])=>{const n=el("div","stat");n.append(el("small","",label),el("strong","",value));stats.append(n);});
 if(view==="cloud"){
  const h=el("div","cloudHeading");h.append(el("h3","","우리의 생각이 만든 낱말 숲"),el("p","","낱말을 눌러 같은 자음의 생각과 등록한 학생을 살펴보세요."));
  const cloud=el("div","cloud");cloud.id="cloud";cloud.setAttribute("aria-label","낱말 구름, 빈도순");
  content.append(h,cloud,el("p","cloudNote","TOP 5 강조 · 전체 학생의 낱말 빈도 집계"));schedule();
 }else if(view==="all"){const grid=el("div","results");students.forEach(s=>grid.append(result(s)));content.append(grid);}
 else{const label=el("label","","학생 선택"),select=el("select");options(select,teacherStudent);select.onchange=()=>{teacherStudent=select.value;renderTeacher();};label.append(select);content.append(label,result(students.find(s=>s.id===teacherStudent)));}
}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(drawCloud);}
// r = bθ인 아르키메데스 나선. 측정된 글자 사각형 사이에 4px 간격을 둡니다.
function drawCloud(){
 const cloud=$("cloud");if(!cloud||$("teacherPanel").hidden)return;
 cloud.replaceChildren();const entries=frequencies(),visible=entries.slice(0,100),width=cloud.clientWidth,height=cloud.clientHeight;
 if(!entries.length){cloud.append(el("p","empty","낱말을 추가하면 생각의 숲이 자라나요."));return;}if(!width)return;
 const nodes=visible.map((entry,i)=>{
  const n=el("button","cloudWord"+(i<5?" top":""),entry.word);n.type="button";n.style.visibility="hidden";
  n.style.color=i<5?["#345e4c","#b27448","#597758","#588d89","#8a657f"][i]:["#7c8b75","#9c8b72","#758b92","#8d8198"][i%4];
  n.setAttribute("aria-label",entry.word+" "+entry.count+"회, "+getInitial(entry.word)+" 자음 낱말 보기");n.title=entry.word+" · "+entry.count+"회";n.onclick=()=>openWords(entry.word);cloud.append(n);return n;
 });
 let success=false;
 for(let attempt=0;attempt<12&&!success;attempt++){
  const placed=[];success=true;
  for(let i=0;i<nodes.length;i++){
   const n=nodes[i],entry=visible[i];
   n.style.fontSize=Math.max(9,(14+35*Math.sqrt(entry.count/entries[0].count)+(i<5?7:0))*Math.pow(.86,attempt)*Math.min(1,width/720))+"px";
   const w=n.offsetWidth,h=n.offsetHeight;let box=null;
   for(let step=0;step<5000;step++){
    const theta=step*.12,r=2.5*theta,x=width/2+r*Math.cos(theta)-w/2,y=height/2+r*Math.sin(theta)*.72-h/2;
    if(x<4||y<4||x+w>width-4||y+h>height-4)continue;
    if(!placed.some(p=>x<p.x+p.w+4&&x+w+4>p.x&&y<p.y+p.h+4&&y+h+4>p.y)){box={x,y,w,h};break;}
   }
   if(!box){success=false;break;}placed.push(box);n.style.left=box.x+"px";n.style.top=box.y+"px";
  }
 }
 if(!success){
  // 아주 작은 화면에서는 읽을 수 있는 줄바꿈 배치로 전환합니다.
  cloud.style.display="flex";cloud.style.flexWrap="wrap";cloud.style.justifyContent="center";cloud.style.alignContent="center";cloud.style.gap="8px";cloud.style.height="auto";cloud.style.minHeight="420px";
  nodes.forEach(n=>{n.style.position="static";n.style.fontSize="14px";});
 }else cloud.style.display="block";
 nodes.forEach(n=>n.style.visibility="visible");
 if(entries.length>visible.length)cloud.parentElement.querySelector(".cloudNote").textContent="빈도순 상위 100개 표시 · 전체 낱말은 전체 모아보기에서 확인하세요.";
}
const dialog=$("dialog");
function openAdd(initial){
 target=initial;$("dialogTitle").textContent=initial+" 칸에 낱말 채우기";const body=$("dialogBody");body.replaceChildren();
 const label=el("label","",initial+"으로 시작하는 낱말");label.htmlFor="dialogWord";
 const input=el("input");input.id="dialogWord";input.maxLength=24;input.required=true;input.autocomplete="off";input.setAttribute("aria-describedby","dialogError");
 const error=el("p","error");error.id="dialogError";error.setAttribute("role","alert");
 const button=el("button","primary","+ 단어 채우기");button.type="submit";
 body.append(label,input,error,button);dialog.showModal();input.focus();
}
function openWords(word){
 target=null;const initial=getInitial(word);$("dialogTitle").textContent=initial+" · 자음 낱말 모아보기";
 const body=$("dialogBody");body.replaceChildren();body.append(el("p","hint","선택한 낱말 ‘"+word+"’ · "+frequencies().find(e=>e.word===word).count+"회 등장"));
 const list=el("ul","dialogList");
 students.forEach(s=>s.words.filter(w=>getInitial(w)===initial).forEach(w=>{const row=el("li");row.append(el(w===word?"strong":"span","",w),el("small","",s.name));list.append(row);}));
 body.append(list);dialog.showModal();
}
$("dialogForm").onsubmit=e=>{e.preventDefault();if(!target)return;const error=addWord($("dialogWord").value,target);if(error)$("dialogError").textContent=error;else dialog.close();};
$("closeDialog").onclick=()=>dialog.close();
dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
window.addEventListener("resize",schedule);
window.addEventListener("storage",e=>{if(e.key===KEY){students=load();renderBoard();if(!$("teacherPanel").hidden)renderTeacher();announce("같은 브라우저의 다른 탭에서 바뀐 활동을 반영했어요.");}});
if(document.fonts)document.fonts.ready.then(schedule);
renderBoard();



// 3. RAFT 전략 글쓰기: 닿소리 데이터와 분리하여 저장합니다.
const RAFT_KEY = "book-class-raft-v1";
const RAFT_FIELDS = [
 {key:"role", letter:"R", english:"Role", label:"역할", hint:"글쓴이는 누구인가요?", placeholder:"예: 책 속 주인공, 미래의 과학자"},
 {key:"audience", letter:"A", english:"Audience", label:"청중", hint:"누구에게 전하고 싶나요?", placeholder:"예: 후배들, 시민들, 작가님"},
 {key:"format", letter:"F", english:"Format", label:"형식", hint:"어떤 방식으로 쓸까요?", placeholder:"예: 편지글, 신문 기사, 연설문"},
 {key:"topic", letter:"T", english:"Topic", label:"주제", hint:"어떤 생각을 전할까요?", placeholder:"예: 사람과 인공지능의 공존"}
];
const RAFT_MOCK = {
 role:"AI 기술자",
 audience:"미래의 어린이들",
 format:"편지글",
 topic:"사람과 인공지능이 서로 돕는 미래",
 body:"미래의 어린이들에게\n\n안녕? 나는 사람들의 일상을 돕는 인공지능을 만드는 AI 기술자야. 오늘 책을 읽으며, 기술이 똑똑해지는 것만큼 사람을 이해하는 일이 중요하다는 생각을 했어.\n\n내가 만들고 싶은 인공지능은 정답을 대신 말해 주는 기계가 아니야. 너희가 스스로 질문하고 새로운 방법을 찾을 수 있도록 곁에서 도와주는 친구란다. 모르는 것을 물어볼 수는 있지만, 어떤 선택을 할지는 너희가 충분히 생각해 보았으면 해.\n\n책 속 로봇이 친구의 마음을 알아가듯, 우리도 서로 다른 생각에 귀를 기울여야 해. 기술을 사용할 때는 누군가의 개인정보가 드러나지 않는지, 잘못된 정보로 다른 사람을 아프게 하지 않는지 함께 살펴보자.\n\n너희가 살아갈 미래에는 놀라운 기술이 더 많아질 거야. 하지만 그 미래를 따뜻하게 만드는 것은 서로를 존중하고 책임 있게 행동하는 너희의 마음이라고 믿어. 너희는 인공지능과 어떤 세상을 만들고 싶니?\n\n너희의 질문을 기다리며,\nAI 기술자가"
};
const emptyRaft = () => ({role:"",audience:"",format:"",topic:"",body:""});
function loadRafts(){
 let saved;
 try { saved=JSON.parse(localStorage.getItem(RAFT_KEY)); } catch(e){}
 const data={};
 students.forEach(s=>{
  const candidate=saved && saved[s.id];
  const valid=candidate && [...RAFT_FIELDS.map(f=>f.key),"body"].every(key=>typeof candidate[key]==="string");
  data[s.id]=valid
   ? Object.fromEntries([...RAFT_FIELDS.map(f=>f.key),"body"].map(key=>[key,candidate[key].slice(0,key==="body"?50000:120)]))
   : (s.id==="s1"?{...RAFT_MOCK}:emptyRaft());
 });
 return data;
}
let rafts=loadRafts(),activity="words";
function raftSentence(raft){
 const role=raft.role.trim(),audience=raft.audience.trim(),format=raft.format.trim(),topic=raft.topic.trim();
 const code=role.charCodeAt(role.length-1);
 const particle=code>=0xac00&&code<=0xd7a3&&(code-0xac00)%28===0?"가":"이";
 return "나는 "+(role||"[역할]")+particle+" 되어, "+(audience||"[청중]")+"에게, "+(format||"[형식]")+" 방식으로, "+(topic||"[주제]")+"에 대해 씁니다.";
}
function wordCount(body){return Array.from(body).length;}
function saveRaft(){
 try{localStorage.setItem(RAFT_KEY,JSON.stringify(rafts));$("raftSave").textContent="이 브라우저에 자동 저장됨";}
 catch(e){$("raftSave").textContent="저장 공간을 사용할 수 없습니다. 현재 화면에서만 유지됩니다.";}
}
const activityNav=el("div","activity-nav");
activityNav.setAttribute("role","tablist");activityNav.setAttribute("aria-label","독서 활동 선택");
const wordsActivity=el("button","","1. 닿소리 채우기");
const raftActivity=el("button","","3. RAFT 전략 글쓰기");
wordsActivity.id="wordsActivity";raftActivity.id="raftActivity";
[wordsActivity,raftActivity].forEach(b=>{b.type="button";b.setAttribute("role","tab");activityNav.append(b);});
$("studentPanel").before(activityNav);
const wordWorkspace=el("div");wordWorkspace.id="wordWorkspace";
[$("wordForm"),$("wordForm").nextElementSibling,$("board")].forEach(n=>wordWorkspace.append(n));
$("studentPanel").append(wordWorkspace);
const raftWorkspace=el("div","raft-workspace");raftWorkspace.id="raftWorkspace";raftWorkspace.hidden=true;
const raftBand=el("div","raft-band");raftBand.id="raftBand";raftBand.setAttribute("aria-label","나의 RAFT 글쓰기 계획");
const raftGrid=el("div","raft-grid");
RAFT_FIELDS.forEach(field=>{
 const card=el("div","raft-field raft-"+field.key);
 const label=el("label","raft-label");label.htmlFor="raft-"+field.key;
 label.append(el("span","raft-letter",field.letter),el("span","",field.english+" · "+field.label));
 const hint=el("p","hint",field.hint);hint.id="raft-hint-"+field.key;
 const input=el("input","raft-input");input.id="raft-"+field.key;input.maxLength=120;input.placeholder=field.placeholder;input.autocomplete="off";input.setAttribute("aria-describedby",hint.id);
 input.addEventListener("input",()=>{
  rafts[current][field.key]=input.value;updateRaftSummary();saveRaft();
  if(field.key==="format")updateFormatChips();
 });
 card.append(label,hint,input);
 if(field.key==="format"){
  const choices=el("div","format-chips");choices.setAttribute("aria-label","추천 글 형식");
  ["편지글","신문 기사","연설문","건의문"].forEach(format=>{
   const b=el("button","format-chip",format);b.type="button";b.dataset.format=format;b.setAttribute("aria-pressed","false");
   b.addEventListener("click",()=>{input.value=format;rafts[current].format=format;updateRaftSummary();updateFormatChips();saveRaft();});
   choices.append(b);
  });
  card.append(choices);
 }
 raftGrid.append(card);
});
const writing=el("div","writing-area");
const writingHeader=el("div","bar");
const writingLabel=el("label","","나의 생각을 글로 펼치기");writingLabel.htmlFor="raftBody";
const counter=el("span","writing-count");counter.id="raftCount";
writingHeader.append(writingLabel,counter);
const textarea=el("textarea","raft-body");textarea.id="raftBody";textarea.maxLength=50000;textarea.rows=16;textarea.placeholder="내가 정한 역할이 되어 첫 문장을 시작해 보세요.\n책에서 만난 장면이나 문장을 떠올리며 나의 생각을 더해 보세요.";textarea.setAttribute("aria-describedby","raftCount raftBodyHint");
textarea.addEventListener("input",()=>{rafts[current].body=textarea.value;updateRaftSummary();saveRaft();});
const writingHint=el("p","hint","공백과 줄바꿈을 포함한 글자 수입니다. 최대 50,000자까지 작성할 수 있어요.");writingHint.id="raftBodyHint";
const saveLabel=el("p","hint");saveLabel.id="raftSave";saveLabel.setAttribute("role","status");
writing.append(writingHeader,textarea,writingHint,saveLabel);
raftWorkspace.append(raftBand,raftGrid,writing);$("studentPanel").append(raftWorkspace);
function updateFormatChips(){
 document.querySelectorAll("[data-format]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.format===rafts[current].format)));
}
function updateRaftSummary(){
 $("raftBand").textContent=raftSentence(rafts[current]);
 $("raftCount").textContent=wordCount(rafts[current].body).toLocaleString("ko-KR")+"자 작성";
}
function renderRaftStudent(){
 const raft=rafts[current];
 RAFT_FIELDS.forEach(f=>$("raft-"+f.key).value=raft[f.key]);
 $("raftBody").value=raft.body;updateRaftSummary();updateFormatChips();
 $("raftSave").textContent="입력 내용은 이 브라우저에 자동 저장됩니다.";
}
function renderRaftTeacher(){
 const content=$("teacherContent");content.replaceChildren();
 $("stats").hidden=true;
 document.querySelector(".tabs").hidden=true;
 content.setAttribute("aria-labelledby","raftActivity");
 const bar=el("div","bar");
 const title=el("h3","","RAFT 작품 감상");
 const label=el("label","","학생 선택"),select=el("select");select.id="raftTeacherSelect";
 options(select,teacherStudent);select.addEventListener("change",()=>{teacherStudent=select.value;renderRaftTeacher();});
 label.append(select);bar.append(title,label);content.append(bar);
 const student=students.find(s=>s.id===teacherStudent),raft=rafts[teacherStudent];
 const banner=el("div","raft-band viewer-band",raftSentence(raft));content.append(banner);
 const grid=el("div","raft-grid viewer-grid");
 RAFT_FIELDS.forEach(f=>{
  const card=el("article","raft-field raft-"+f.key);
  const heading=el("h3","raft-label");heading.append(el("span","raft-letter",f.letter),el("span","",f.english+" · "+f.label));
  card.append(heading,el("p","raft-value",raft[f.key].trim()||"아직 입력하지 않았어요."));grid.append(card);
 });
 const paper=el("article","raft-paper");
 const paperHead=el("div","paper-head");paperHead.append(el("h3","",student.name+"의 글"),el("span","writing-count",wordCount(raft.body).toLocaleString("ko-KR")+"자 작성"));
 paper.append(paperHead,el("p","paper-body",raft.body.trim()?raft.body:"아직 작성한 본문이 없어요. 학생이 글을 쓰면 여기에 표시됩니다."));
 content.append(grid,paper);
}
const renderWordsTeacher=renderTeacher;
renderTeacher=function(){
 if(activity==="raft")renderRaftTeacher();
 else{
  $("stats").hidden=false;document.querySelector(".tabs").hidden=false;
  $("teacherContent").setAttribute("aria-labelledby",tabs.find(t=>t.dataset.view===view).id);
  renderWordsTeacher();
 }
};
const originalStudentChange=$("studentSelect").onchange;
$("studentSelect").onchange=e=>{originalStudentChange(e);renderRaftStudent();};
function setActivity(next){
 activity=next;const isRaft=next==="raft";
 wordsActivity.setAttribute("aria-selected",String(!isRaft));raftActivity.setAttribute("aria-selected",String(isRaft));
 wordsActivity.tabIndex=isRaft?-1:0;raftActivity.tabIndex=isRaft?0:-1;
 $("wordWorkspace").hidden=isRaft;raftWorkspace.hidden=!isRaft;
 const intro=document.querySelector(".intro");intro.querySelector("small").textContent=isRaft?"CREATIVE READING · STEP 03":"CREATIVE READING · STEP 01";
 const title=intro.querySelector("h1");title.replaceChildren();
 title.append(document.createTextNode(isRaft?"다른 시선으로 펼치는,":"생각이 낱말이 되는 순간,"),el("br"),document.createTextNode(isRaft?"RAFT 전략 글쓰기":"닿소리 채우기"));
 intro.querySelector("p").textContent=isRaft?"역할과 청중, 형식과 주제를 정하고 책 속 생각을 나의 글로 펼쳐 보세요.":"책에서 만난 낱말과 나의 생각을 열네 개의 자음에 담아 보세요.";
 $("studentPanel").querySelector("h2").textContent=isRaft?"나의 RAFT 워크시트":"나의 닿소리 판";
 if(isRaft)renderRaftStudent();if(!$("teacherPanel").hidden)renderTeacher();announce("");
}
wordsActivity.onclick=()=>setActivity("words");raftActivity.onclick=()=>setActivity("raft");
[wordsActivity,raftActivity].forEach((button,index)=>button.addEventListener("keydown",e=>{
 if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)){
  e.preventDefault();const next=e.key==="Home"?0:e.key==="End"?1:1-index;
  setActivity(next?"raft":"words");[wordsActivity,raftActivity][next].focus();
 }
}));
window.addEventListener("storage",e=>{
 if(e.key===RAFT_KEY||e.key===null){
  rafts=loadRafts();renderRaftStudent();
  if(!$("teacherPanel").hidden&&activity==="raft")renderRaftTeacher();
  announce("다른 탭에서 변경된 RAFT 글쓰기를 반영했어요.");
 }
});
renderRaftStudent();setActivity("words");

