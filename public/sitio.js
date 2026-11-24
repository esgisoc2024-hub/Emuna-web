/* Comportamiento del sitio público de EMUNÁ. Cada bloque se activa solo si su sección está en la página. */
(function () {
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const still=matchMedia("(prefers-reduced-motion:reduce)").matches;
const WA=($(".wa-f")||{}).href||"";

/* Botón del panel: solo aparece si hay una sesión iniciada de un administrador.
   La sesión dura una hora y esta página no la renueva: si ya venció pero sigue guardada, el botón se muestra igual
   (el panel pide iniciar sesión de nuevo si hace falta). Solo se oculta si se confirmó que la cuenta no es administradora. */
const pnl=$("#pnl");
try{const k=Object.keys(localStorage).find(x=>/^sb-.+-auth-token$/.test(x)),ss=k&&JSON.parse(localStorage.getItem(k)),tk=ss&&ss.access_token;
 if(pnl&&tk){if(localStorage.getItem("emuna_panel")!=="0")pnl.hidden=false;
  if(!(ss.expires_at&&ss.expires_at*1000<Date.now()))fetch("/api/me",{headers:{Authorization:"Bearer "+tk}}).then(r=>r.ok?r.json():null).then(d=>{if(!d)return;pnl.hidden=!d.panel;localStorage.setItem("emuna_panel",d.panel?"1":"0")}).catch(()=>{})}}catch(e){}

/* menú del celular */
const mn=$("#mn"),bg=$("#bg");
if(mn&&bg){
 const menu=o=>{mn.classList.toggle("o",o);document.body.classList.toggle("mo",o);bg.setAttribute("aria-expanded",o);bg.textContent=o?"Cerrar":"Menú";mn.setAttribute("aria-hidden",!o)};
 bg.onclick=()=>menu(!mn.classList.contains("o"));
 mn.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu(false)));
 addEventListener("keydown",e=>{if(e.key==="Escape")menu(false)});
}

/* encabezado con fondo al bajar, y profundidad: las capas se mueven a distinta velocidad */
const hd=$("#hd"),deep=[...$$("[data-d]")];let tick=false;
function onScroll(){hd&&hd.classList.toggle("s",scrollY>30);
 if(still||tick||!deep.length)return;tick=true;requestAnimationFrame(()=>{tick=false;const vh=innerHeight;
  deep.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;
   el.style.translate=`0 ${(((r.top+r.height/2)-vh/2)*parseFloat(el.dataset.d)).toFixed(1)}px`})})}
addEventListener("scroll",onScroll,{passive:true});onScroll();

const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* inicio: luz que sigue al cursor, bombilla y escena de las tarjetas */
const heroEl=$("#inicio");
if(heroEl){
 setTimeout(()=>{$$(".js .pl").forEach(p=>{p.style.animation="none";p.style.opacity=1});onScroll()},1700);
 if(!still&&matchMedia("(pointer:fine)").matches)heroEl.addEventListener("pointermove",e=>{const r=heroEl.getBoundingClientRect();heroEl.style.setProperty("--mx",(e.clientX-r.left)+"px");heroEl.style.setProperty("--my",(e.clientY-r.top)+"px")});
 const luz=$("#luz");if(luz)luz.onclick=e=>{const on=document.body.classList.toggle("lit");e.currentTarget.setAttribute("aria-pressed",on)};

 const stack=$(".stack"),p1=$(".p1"),p2=$(".p2"),p3=$(".p3"),mcur=$(".cur"),wbtn=$(".wa-btn"),pct=$("#pct"),chT=$("#chT"),chM=$("#chM");
 if(stack){
  const MSGS=["Hola, vi el anuncio. Quiero avanzar, ¿cómo seguimos?","¿Tienen lugar esta semana? Quiero reservar.","Me interesa el plan completo, ¿me pasás el link de pago?"];
  $$(".p1 .bars b").forEach((b,i)=>b.style.transitionDelay=(.9+i*.07)+"s");
  let heroOn=true;new IntersectionObserver(es=>{heroOn=es[0].isIntersecting},{threshold:.1}).observe(heroEl);
  const awake=async()=>{while(!heroOn||document.hidden)await wait(400)};
  const countUp=()=>{const t0=performance.now(),d=1400;(function f(t){const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);pct.textContent="+"+Math.round(38*e)+"%";if(k<1)requestAnimationFrame(f)})(t0)};
  if(still){stack.classList.add("go");p3.classList.add("show","is-sold")}
  else{
   requestAnimationFrame(()=>stack.classList.add("go"));setTimeout(countUp,900);p3.classList.add("show");
   /* las tarjetas flotan y la pila se inclina hacia el cursor */
   let tx=0,ty=0,cx=0,cy=0;const pls=[p1,p2,p3];
   if(matchMedia("(pointer:fine)").matches){heroEl.addEventListener("pointermove",e=>{const r=stack.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});heroEl.addEventListener("pointerleave",()=>{tx=ty=0})}
   (function fl(t){if(heroOn){cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;stack.style.transform=`perspective(1400px) rotateX(${(-cy*7).toFixed(2)}deg) rotateY(${(cx*9).toFixed(2)}deg)`;
    pls.forEach((p,i)=>p.style.setProperty("--fy",(Math.sin(t/1000*.9+i*1.9)*7).toFixed(1)+"px"))}requestAnimationFrame(fl)})(0);
   (async()=>{await wait(2600);let n=0;
    for(;;){await awake();
     mcur.style.left=(wbtn.offsetLeft+wbtn.offsetWidth*.62)+"px";mcur.style.top=(wbtn.offsetTop+wbtn.offsetHeight*.5)+"px";p2.classList.add("aim");await wait(1200);
     p2.classList.add("click");await wait(450);p2.classList.toggle("click",false);
     p3.classList.toggle("show",false);p3.classList.toggle("is-sold",false);await wait(400);chT.textContent="Escribiendo…";p3.classList.add("is-typing");await wait(1500);
     n=(n+1)%MSGS.length;chM.textContent=MSGS[n];chT.textContent="Consulta nueva, recién";p3.classList.toggle("is-typing",false);p3.classList.add("show");await wait(1500);
     p3.classList.add("is-sold");p1.classList.add("pulse");await wait(1500);p1.classList.toggle("pulse",false);
     p2.classList.toggle("aim",false);mcur.style.left="22%";mcur.style.top="26%";await wait(2600)}
})();
  }
 }
}

/* carrusel de proyectos: tarjetas superpuestas */
const deck=$("#deck");
if(deck){
 const cards=[...deck.querySelectorAll(".cd")],dots=$("#dots");let cur=0;
 cards.forEach(()=>dots.append(document.createElement("i")));
 const show=i=>{const n=cards.length;cur=(i+n)%n;
  cards.forEach((c,k)=>{let p=(k-cur+n)%n;if(p===n-1&&n>3)p=-1;c.dataset.p=p;c.setAttribute("aria-hidden",p!==0)});
  [...dots.children].forEach((d,k)=>d.classList.toggle("on",k===cur))};
 show(0);
 $("#nx").onclick=()=>show(cur+1);$("#pv").onclick=()=>show(cur-1);
 cards.forEach((c,k)=>c.addEventListener("click",()=>{if(k!==cur)show(k)}));
 let sx=null;
 deck.addEventListener("pointerdown",e=>{sx=e.clientX});
 deck.addEventListener("pointerup",e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))});
 deck.tabIndex=0;deck.addEventListener("keydown",e=>{if(e.key==="ArrowRight")show(cur+1);if(e.key==="ArrowLeft")show(cur-1)});
}

/* casos reales cargados desde el panel */
const wk=$("#wk");
if(wk)fetch("/api/cases").then(r=>r.ok?r.json():[]).then(l=>{if(!Array.isArray(l)||!l.length)return;$("#trabajos").hidden=false;l.forEach(c=>{const a=document.createElement("a");a.className="wc";a.href="/casos/"+encodeURIComponent(c.slug);
 const im=document.createElement("div");im.className="wi";if(c.images&&c.images[0]){const g=document.createElement("img");g.src=c.images[0];g.alt=c.title;g.loading="lazy";im.append(g)}
 const t=document.createElement("div");t.className="tg";String(c.service||"").split(/[,/]/).map(x=>x.trim()).filter(Boolean).slice(0,3).forEach(x=>{const e=document.createElement("span");e.textContent=x;t.append(e)});
 const h=document.createElement("h3");h.textContent=c.title;const v=document.createElement("span");v.className="vp";v.textContent="Ver proyecto";a.append(im,t,h,v);wk.append(a)})}).catch(()=>{});

/* formulario de contacto */
const lf=$("#lf");
if(lf){
 const sel=$("#s"),pick=v=>{const o=[...sel.options].find(o=>o.value===v||o.text===v);if(o)sel.value=o.value};
 try{const sv=new URLSearchParams(location.search).get("servicio");if(sv)pick(sv)}catch(e){}
 lf.addEventListener("submit",e=>{e.preventDefault();const f=e.target,b=$("#sb"),er=$("#er");er.classList.remove("show");$("#ok").classList.remove("show");
  if(!f.checkValidity()){er.textContent="Revisá el formulario: necesitamos tu nombre, un email válido y un mensaje de al menos 15 caracteres.";er.classList.add("show");const bad=f.querySelector(":invalid");bad&&bad.focus();return}
  b.disabled=true;b.textContent="Enviando";
  fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(f)))})
  .then(r=>{if(!r.ok)throw 0;try{sessionStorage.setItem("emuna_nombre",String(f.elements.name.value||"").trim().split(/\s+/)[0].slice(0,40))}catch(e){}location.href="/gracias"})
  .catch(()=>{er.innerHTML='No pudimos enviar tu consulta. <a target="_blank" rel="noopener">Escribinos por WhatsApp</a> y te respondemos enseguida.';er.querySelector("a").href=WA;er.classList.add("show")})
  .finally(()=>{b.disabled=false;b.textContent="Enviar consulta"})});
}

/* página de gracias: saluda por el nombre que dejó en el formulario */
const gnm=$("#gnm");
if(gnm)try{const n=sessionStorage.getItem("emuna_nombre");if(n)gnm.textContent=", "+n}catch(e){}
})();
