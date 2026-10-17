/* SECTION: data —— 示例内容（演示数据，非真实诊断结果） */
"use strict";

const PRESETS = [
  { id:"natural",  name:"自然光",   temp:5000, bright:70, dot:"#f3e6cf" },
  { id:"warm",     name:"暖光氛围", temp:3000, bright:52, dot:"#e8b57a" },
  { id:"makeup",   name:"精致妆光", temp:5600, bright:88, dot:"#fdf6ea" },
  { id:"daylight", name:"日光还原", temp:6500, bright:95, dot:"#eaf2fb" },
];

const MAKEUPS = [
  {
    id:"dewy", name:"水光裸感妆", sub:"通透底妆 · 伪素颜",
    tags:["干皮友好","高保湿","日常通勤"], forType:"dry",
    desc:"以保湿打底还原皮肤本身的通透感，弱化粉感，适合肌肤偏干、追求自然光泽的顾客。",
    steps:["妆前使用保湿精华，静待 1 分钟吸收","取黄豆大小水光妆前乳，重点涂于面中","粉底液与一滴面部精油混合，湿海绵轻拍上脸","少量多次按压遮瑕，保留自然肤纹","定妆只压 T 区，保留两颊光泽感"],
    products:[["保湿妆前精华","打底锁水"],["水光粉底液","轻薄高覆着"],["精细遮瑕液","局部点涂"],["润泽定妆粉","T 区控油"]],
  },
  {
    id:"mist", name:"雾面轻羽妆", sub:"柔焦雾面 · 精致持妆",
    tags:["混油皮","控油持妆","约会晚宴"], forType:"combo",
    desc:"半雾面妆效平衡油脂分泌，柔焦质感显毛孔细腻，适合混合性肌肤的长时间带妆场景。",
    steps:["控油妆前乳薄涂 T 区","粉底刷平铺后以海绵垂直按压","遮瑕后静置 30 秒再拍开","透明散粉粉扑对折，按压眼周与鼻翼","腮红选哑光奶茶色，斜向上轻扫"],
    products:[["隐形毛孔妆前","T 区打底"],["持妆粉底液","8 小时带妆"],["柔焦散粉","定妆不假面"],["哑光腮红","收缩感"]],
  },
  {
    id:"calm", name:"桃粉舒缓妆", sub:"低刺激 · 敏感肌友好",
    tags:["敏感肌","精简步骤","气色提升"], forType:"sensitive",
    desc:"精简上妆步骤、减少摩擦与成分刺激，用低饱和桃粉色提升气色，适合换季期敏感泛红的肌肤。",
    steps:["敏感肌专用防晒成膜后再上妆","有色面霜替代粉底，指尖温度铺开","唇颊两用膏轻点颊部与唇中","晕染自然眉形，避免过度修眉","不叠加浓重眼妆，睫毛夹翘即可"],
    products:[["舒缓有色面霜","代替粉底"],["唇颊两用膏","一色自然"],["温和卸妆乳","敏感适用"]],
  },
  {
    id:"porcelain", name:"瓷肌细化妆", sub:"柔焦毛孔 · 精致细腻",
    tags:["毛孔护理","妆前填充","奶油肌"], forType:"pore",
    desc:"通过含硅妆前填充毛孔纹理，再以按压上妆法打造奶油般的平整肌面，适合毛孔粗大、追求细致妆效的顾客。",
    steps:["毛孔填充妆前以画圈方式揉进鼻翼","等待 2 分钟成膜，粉底只在面中铺开","由内向外拍开，毛孔区轻拍带过","局部叠加薄纱散粉，扫去多余粉感","高光只点颧骨最高点，避免加重纹理"],
    products:[["毛孔柔焦妆前","填纹打底"],["奶油肌粉底","中等覆着"],["薄纱蜜粉","轻透定妆"],["液态高光","提升质感"]],
  },
];

const PROGRESS_TEXTS = ["正在进行面部定位…","分析肌肤水润度…","分析油脂分布…","分析毛孔与屏障状态…","生成肌肤档案…"];

/* SECTION: state */
const LS_SKIN = "beauty-mirror.skin";
const LS_LIGHT = "beauty-mirror.light";
const state = {
  skin: loadJSON(LS_SKIN),
  light: loadJSON(LS_LIGHT) || { temp:5000, bright:70, preset:"natural" },
  scanning:false,
};
function loadJSON(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
function save(){
  localStorage.setItem(LS_SKIN, JSON.stringify(state.skin));
  localStorage.setItem(LS_LIGHT, JSON.stringify(state.light));
}

/* SECTION: face svg —— 抽象线稿人像，用于模拟镜面取景 */
const FACE_SVG = `
<svg viewBox="0 0 120 160" fill="none" stroke="rgba(232,207,159,.85)" stroke-width="1.6" stroke-linecap="round">
  <path d="M60 18 C40 18 28 34 28 58 C28 86 42 116 60 126 C78 116 92 86 92 58 C92 34 80 18 60 18 Z" opacity=".9"/>
  <path d="M28 52 C24 30 38 12 60 12 C82 12 96 30 92 52" opacity=".55"/>
  <path d="M40 52 C46 48 54 48 58 51" opacity=".8"/>
  <path d="M80 52 C74 48 66 48 62 51" opacity=".8"/>
  <path d="M40 62 C45 66 53 66 58 62 M62 62 C67 66 75 66 80 62" opacity=".9"/>
  <path d="M60 66 L57 86 C58 89 62 89 63 86" opacity=".7"/>
  <path d="M50 98 C55 102 65 102 70 98 C65 105 55 105 50 98 Z" opacity=".9" fill="rgba(227,183,180,.25)"/>
  <path d="M22 46 C14 60 16 84 26 100 M98 46 C106 60 104 84 94 100" opacity=".4"/>
  <circle cx="60" cy="34" r="0.1"/>
</svg>`;
document.querySelectorAll("#face-main, #face-skin, #face-light").forEach(el => { el.innerHTML = FACE_SVG; });

/* SECTION: view router */
const views = ["boot","mirror","skin","light","makeup"];
function showView(name){
  views.forEach(v => {
    const el = document.getElementById("view-"+v);
    el.classList.toggle("active", v === name);
  });
}
document.querySelectorAll("[data-go]").forEach(btn =>
  btn.addEventListener("click", () => showView(btn.dataset.go)));
document.getElementById("view-boot").addEventListener("click", () => {
  showView("mirror"); toast("已点亮镜面，祝您心情愉悦");
});

/* SECTION: toast */
let toastTimer = null;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* SECTION: skin test */
function generateSkin(){
  // 演示数据：在合理区间内随机生成，不代表真实检测结果
  const rand=(a,b)=>Math.round(a+Math.random()*(b-a));
  const moisture=rand(46,78), oil=rand(38,76), pore=rand(52,82), calm=rand(50,80);
  const score=Math.round(moisture*0.3+((100-oil))*0.15+(100-pore)*0.25+calm*0.3+10);
  let type="中性肌肤";
  if(moisture<58) type="偏干肌肤";
  else if(oil>64) type="偏油肌肤";
  else if(moisture<64 && oil>54) type="混合性肌肤";
  return { score:Math.min(score,96), type, moisture, oil, pore, calm, date:todayStr() };
}
function todayStr(){ const d=new Date(); return `${d.getMonth()+1}月${d.getDate()}日`; }

const metricsDefs = [
  ["水润度","moisture",true],["清爽度","oil",false],["细腻度","pore",false],["强韧度","calm",true],
];
function adviceFor(s){
  const tips=[];
  if(s.moisture<62) tips.push("<b>补水</b>：晨间使用含透明质酸的精华，每周 2 次补水面膜");
  if(s.oil>62) tips.push("<b>控油</b>：T 区选用轻薄水乳，避免厚重封闭型面霜");
  if(s.pore>68) tips.push("<b>细腻</b>：晚间可引入低浓度酸类护理，注意建立耐受");
  if(s.calm<64) tips.push("<b>舒缓</b>：精简护肤步骤，优先修护屏障与严格防晒");
  if(!tips.length) tips.push("整体状态良好，坚持基础清洁、保湿、防晒三步即可");
  return tips;
}

function renderSkinResult(){
  const s=state.skin, box=document.getElementById("skin-result");
  if(!s){ box.classList.remove("show"); return; }
  box.innerHTML = `
    <div class="sr-head">
      <div class="big">${s.score}</div>
      <div class="meta">${s.type}<br>检测时间：${s.date} · 结果仅供参考，不替代专业护理建议</div>
    </div>
    <div class="sr-grid">
      ${metricsDefs.map(([label,key,up])=>{
        const v = up? s[key] : 100-s[key];
        return `<div class="sr-item"><div class="n">${v}</div><div class="t">${label}</div></div>`;
      }).join("")}
    </div>
    <div class="sr-advice">${adviceFor(s).map(t=>`<div>· ${t}</div>`).join("")}</div>`;
  box.classList.add("show");
}
function renderSideSkin(){
  const el=document.getElementById("side-skin");
  const s=state.skin;
  if(!s){
    el.innerHTML=`<div class="empty">今日尚未测肤。<br>点击「智能测肤」，30 秒生成您的专属肌肤档案。</div>`;
    return;
  }
  el.innerHTML=`
    <div class="skin-mini"><span class="score">${s.score}</span><span class="label">${s.type} · ${s.date}</span></div>
    <div class="skin-bars">
      ${metricsDefs.map(([label,key,up])=>{
        const v=up? s[key] : 100-s[key];
        return `<div class="sbar"><span>${label}</span><span class="track"><span class="fill" style="width:${v}%"></span></span><span class="val">${v}</span></div>`;
      }).join("")}
    </div>`;
}

const btnScan=document.getElementById("btn-scan"), btnAgain=document.getElementById("btn-skin-again");
btnScan.addEventListener("click", startScan);
btnAgain.addEventListener("click", startScan);

function startScan(){
  if(state.scanning) return;
  state.scanning=true;
  const stage=document.getElementById("skin-stage");
  const prog=document.getElementById("skin-progress");
  stage.classList.add("scanning");
  document.getElementById("skin-result").classList.remove("show");
  btnScan.disabled=true; btnScan.textContent="检测中，请正对镜面";
  btnAgain.style.display="none";
  let i=0;
  const tick=setInterval(()=>{ i++; if(i<PROGRESS_TEXTS.length) prog.textContent=PROGRESS_TEXTS[i]; }, 760);
  setTimeout(()=>{
    clearInterval(tick);
    stage.classList.remove("scanning");
    state.skin=generateSkin(); save();
    renderSkinResult(); renderSideSkin(); renderMakeup();
    btnScan.disabled=false; btnScan.textContent="开始测肤";
    btnAgain.style.display="";
    state.scanning=false;
    toast("肌肤档案已生成，妆容推荐已同步更新");
  }, 760*PROGRESS_TEXTS.length + 500);
}

/* SECTION: light —— 色温近似取色 */
function kelvinToColor(k){
  // 2700K 暖琥珀 → 5000K 中性 → 6500K 冷白的近似映射
  const t=(k-2700)/(6500-2700);
  const r=Math.round(255-(255-234)*t);
  const g=Math.round(183+(242-183)*t);
  const b=Math.round(118+(255-118)*t);
  return `rgb(${r},${g},${b})`;
}
function applyLight(){
  const l=state.light;
  const root=document.documentElement;
  root.style.setProperty("--light-temp", kelvinToColor(l.temp));
  root.style.setProperty("--light-a", (0.25+ (l.bright/100)*0.55).toFixed(2));
  root.style.setProperty("--mirror-bright", (0.82+(l.bright/100)*0.45).toFixed(2));
  document.getElementById("temp-slider").value=l.temp;
  document.getElementById("bright-slider").value=l.bright;
  document.getElementById("temp-val").textContent=l.temp+"K";
  document.getElementById("bright-val").textContent=l.bright+"%";
  const p=PRESETS.find(x=>x.id===l.preset);
  document.getElementById("lp-caption").textContent = p? `${p.name} · ${l.temp}K` : `自定义 · ${l.temp}K`;
  document.querySelectorAll(".preset").forEach(el=>
    el.classList.toggle("selected", el.dataset.id===l.preset));
}
function renderPresets(){
  document.getElementById("preset-grid").innerHTML = PRESETS.map(p=>`
    <button class="preset" data-id="${p.id}">
      <span class="dot" style="background:${p.dot}"></span><span>${p.name}</span>
    </button>`).join("");
  document.querySelectorAll(".preset").forEach(el=>
    el.addEventListener("click", ()=>{
      const p=PRESETS.find(x=>x.id===el.dataset.id);
      state.light={temp:p.temp, bright:p.bright, preset:p.id};
      save(); applyLight(); toast(`已切换为${p.name}`);
    }));
}
document.getElementById("temp-slider").addEventListener("input", e=>{
  state.light.temp=+e.target.value; state.light.preset=null; save(); applyLight();
});
document.getElementById("bright-slider").addEventListener("input", e=>{
  state.light.bright=+e.target.value; state.light.preset=null; save(); applyLight();
});

/* SECTION: makeup */
function recommendedId(){
  const s=state.skin; if(!s) return null;
  if(s.calm<60) return "calm";
  if(s.moisture<58) return "dewy";
  if(s.pore>70) return "porcelain";
  if(s.oil>60) return "mist";
  return "dewy";
}
function renderMakeup(){
  const rec=recommendedId();
  const s=state.skin;
  const linked=document.getElementById("mk-linked");
  if(s){
    const m=MAKEUPS.find(x=>x.id===rec);
    linked.textContent=`已根据您的肌肤档案（${s.type} · ${s.score} 分）优先推荐「${m.name}」`;
    linked.classList.add("show");
  }else{
    linked.textContent="先完成智能测肤，可获得为您定制的妆容优先级";
    linked.classList.add("show");
  }
  document.getElementById("mk-grid").innerHTML = MAKEUPS.map(m=>`
    <button class="mk-card" data-id="${m.id}" ${m.id===rec?'data-primary-action':''}>
      <div class="mk-top">
        <span class="mk-swatch" style="background:linear-gradient(135deg,${swatch(m.id)})"></span>
        <span><span class="mk-name">${m.name}</span><span class="mk-sub">${m.sub}</span></span>
        ${m.id===rec?'<span class="mk-rec">为你推荐</span>':''}
      </div>
      <div class="mk-tags">${m.tags.map(t=>`<span class="mk-tag">${t}</span>`).join("")}</div>
      <div class="mk-desc">${m.desc}</div>
    </button>`).join("");
  document.querySelectorAll(".mk-card").forEach(el=>
    el.addEventListener("click", ()=>openModal(el.dataset.id)));
}
function swatch(id){
  return {dewy:"#e6c8b8 0%,#f3ddcb 100%", mist:"#cbb4a4 0%,#e0cdbd 100%",
          calm:"#e8b7c4 0%,#f4d6dc 100%", porcelain:"#efd9c4 0%,#f9ecdc 100%"}[id];
}
function openModal(id){
  const m=MAKEUPS.find(x=>x.id===id);
  document.getElementById("mk-modal-card").innerHTML=`
    <button class="modal-close" aria-label="关闭">×</button>
    <div class="modal-title">
      <span class="mk-swatch" style="background:linear-gradient(135deg,${swatch(id)})"></span>
      <div><h3>${m.name}</h3><div class="mk-sub">${m.sub}</div></div>
    </div>
    <div class="mk-desc">${m.desc}</div>
    <div class="modal-sec"><h5>妆 容 步 骤</h5>
      <div class="step-list">${m.steps.map((s,i)=>`<div class="step"><span class="no">${i+1}</span><span>${s}</span></div>`).join("")}</div>
    </div>
    <div class="modal-sec"><h5>建 议 用 品</h5>
      <div class="prod-list">${m.products.map(p=>`<div class="prod"><span class="p-name">${p[0]}</span><span class="p-note">${p[1]}</span></div>`).join("")}</div>
    </div>
    <button class="primary-btn book-btn">预约美容顾问 1 对 1 上妆指导</button>`;
  document.getElementById("mk-modal").classList.add("show");
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".book-btn").addEventListener("click", ()=>{
    closeModal(); toast("已记录您的体验意向，请联系门店美容顾问安排");
  });
}
function closeModal(){ document.getElementById("mk-modal").classList.remove("show"); }
document.getElementById("mk-modal").addEventListener("click", e=>{
  if(e.target.id==="mk-modal") closeModal();
});

/* SECTION: prototype controls —— 演示用横竖屏切换与重置 */
const tablet=document.getElementById("tablet");
document.getElementById("btn-landscape").addEventListener("click", e=>{
  tablet.dataset.orient="landscape"; setProtoBtn(e.currentTarget);
});
document.getElementById("btn-portrait").addEventListener("click", e=>{
  tablet.dataset.orient="portrait"; setProtoBtn(e.currentTarget);
});
function setProtoBtn(btn){
  document.querySelectorAll(".proto-btn").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");
}
document.getElementById("btn-reset").addEventListener("click", ()=>{
  state.skin=null; state.light={temp:5000,bright:70,preset:"natural"}; save();
  renderSideSkin(); renderSkinResult(); renderMakeup(); applyLight();
  showView("boot"); toast("演示数据已重置");
});

/* SECTION: clock */
function tickClock(){
  const d=new Date();
  document.getElementById("clock").textContent =
    String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
}
tickClock(); setInterval(tickClock, 20000);

/* SECTION: init */
renderPresets(); renderSideSkin(); renderSkinResult(); renderMakeup(); applyLight();
