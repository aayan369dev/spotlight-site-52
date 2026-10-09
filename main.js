const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];


/* intro: lamp on, name reveal, then an iris opens from the lens onto the site */
(function(){
  const root=document.documentElement,el=$('#intro');
  if(!el)return;
  if(!root.classList.contains('introing')){el.remove();return}
  const t=$('#inTitle');t.setAttribute('aria-hidden','true');
  t.innerHTML=t.textContent.split('').map((ch,i)=>'<span style="--i:'+i+'">'+ch+'</span>').join('');
  let done=false,iris=0;
  function finish(){
    if(done)return;done=true;cancelAnimationFrame(iris);
    try{sessionStorage.setItem('spotlight_intro','1')}catch(e){}
    root.classList.remove('introing','introing-open');el.remove();window.scrollTo(0,0);
  }
  function open(){
    if(done)return;
    const r=$('#inTitle').getBoundingClientRect();
    el.style.setProperty('--cx',(r.left+r.width/2)+'px');el.style.setProperty('--cy',(r.top+r.height/2)+'px');
    el.classList.add('in-end');
    const R=Math.hypot(innerWidth,innerHeight)+120,D=1300,s=performance.now();
    (function f(now){
      const k=Math.min((now-s)/D,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      el.style.setProperty('--r',(R*e)+'px');
      if(k<1&&!done)iris=requestAnimationFrame(f);else finish();
    })(s);
    /* let the site's own entrance start as the iris opens */
    setTimeout(()=>{if(!done){root.classList.add('introing-open');root.classList.remove('introing');el.style.pointerEvents='none'}},350);
  }
  const timer=setTimeout(open,3600);
  $('#inSkip').addEventListener('click',()=>{clearTimeout(timer);finish()});
  addEventListener('keydown',e=>{if(e.key==='Escape'){clearTimeout(timer);finish()}});
})();

/* scroll progress */
const bar=$('#bar');
const onScroll=()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(m>0?scrollY/m:0)+')'};
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* menu */
const mb=$('.menu'),lk=$('#links');
mb.addEventListener('click',()=>{const o=lk.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
lk.addEventListener('click',e=>{if(e.target.tagName==='A'){lk.classList.remove('open');mb.setAttribute('aria-expanded','false')}});

/* split headings into words */
$$('h2').forEach(h=>{
  h.classList.remove('rv');h.classList.add('wsplit');
  const words=h.textContent.trim().split(/\s+/);
  h.setAttribute('aria-label',h.textContent.trim());
  h.innerHTML=words.map((w,i)=>'<span class="w'+(i===words.length-1?' hl':'')+'" aria-hidden="true" style="--i:'+i+'">'+w+'</span>').join(' ');
});

/* reveal on scroll */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.classList.add('in');io.unobserve(t);if(t.matches('.card,.post'))setTimeout(()=>t.classList.add('ready'),1100)}}),{threshold:.15});
$$('.rv,#steps,#gantt,.panel,h2.wsplit').forEach(el=>io.observe(el));

/* 3D tilt on cards and magnetic buttons (fine pointers only) */
if(!RM&&matchMedia('(pointer:fine)').matches){
  $$('.card,.post').forEach(c=>{
    c.addEventListener('pointermove',e=>{
      if(!c.classList.contains('ready'))return;
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(900px) rotateX('+(-y*7)+'deg) rotateY('+(x*9)+'deg) translateY(-4px)';
    });
    c.addEventListener('pointerleave',()=>{c.style.transform=''});
  });
  $$('.btn').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.22)+'px '+((e.clientY-r.top-r.height/2)*.35)+'px'});
    b.addEventListener('pointerleave',()=>{b.style.translate='0 0'});
  });
}

/* pointer light: page glow, card glow, headline beam */
const root=document.documentElement.style, h1=$('#h1');
let px=innerWidth*.5,py=innerHeight*.3,last=0,t0=performance.now();
addEventListener('pointermove',e=>{
  px=e.clientX;py=e.clientY;last=performance.now();
  root.setProperty('--gx',px+'px');root.setProperty('--gy',py+'px');
  const c=e.target.closest&&e.target.closest('.card');
  if(c){const r=c.getBoundingClientRect();c.style.setProperty('--px',(e.clientX-r.left)+'px');c.style.setProperty('--py',(e.clientY-r.top)+'px')}
},{passive:true});
function beam(now){
  const r=h1.getBoundingClientRect();
  let x,y;
  if(now-last<2500&&last){x=px-r.left;y=py-r.top}
  else{const k=(now-t0)/1000;x=r.width*(.5+.55*Math.sin(k*.9));y=r.height*(.5+.3*Math.sin(k*1.7))}
  h1.style.setProperty('--hx',x+'px');h1.style.setProperty('--hy',y+'px');
  requestAnimationFrame(beam);
}
if(RM){h1.style.background='none';h1.style.webkitTextFillColor='#17151f'}else requestAnimationFrame(beam);

/* counters */
$$('[data-n]').forEach(el=>{
  const n=+el.dataset.n,s=el.dataset.s||'';
  if(RM||n===0){el.textContent=n+s;return}
  const d=1400,st=performance.now()+700;
  (function f(t){const p=Math.min(Math.max((t-st)/d,0),1),e=1-Math.pow(1-p,3);el.textContent=Math.round(n*e)+s;if(p<1)requestAnimationFrame(f)})(performance.now());
});


/* projects showcase: real sliding track, spotlight per slide, glitch on arrival */
(function(){
  const st=$('#wstage'),list=$('#wlist'),track=$('#wtrack'),dots=$('#wdots');if(!st||!list||!track)return;
  /* EDIT ME: replace these sample projects with real client work */
  const P=[
   {n:'Kulhad & Co.',t:'Digital marketing',c:'#965a05',w:'Monsoon Masala',d:'A monsoon launch run from one calendar: copy, scheduling and ads, every post approved by a person.',v:212,l:'% more saves in 8 weeks'},
   {n:'Raahi Travel',t:'Influencer campaigns',c:'#3b3a8f',w:'Raahi',d:'Thirty creators shortlisted in a day, briefed and tracked in one workflow.',v:30,l:'creators in 1 day'},
   {n:'Nova Pay',t:'PR intelligence',c:'#7a4a04',w:'Nova Pay',d:'Trade-press and social monitoring with a same-day digest and sentiment alerts.',v:48,l:'hr to spot a story spike'},
   {n:'Bloom Skin',t:'Creative production',c:'#3b3a8f',w:'Bloom',d:'One hero shot resized and cut into every platform format in minutes.',v:60,l:'assets from 1 shoot'},
   {n:'Urban Fit',t:'Digital marketing',c:'#965a05',w:'Urban Fit',d:'Meta and Google budgets paced weekly, with recommendations a person signs off.',v:38,l:'% lower cost per lead'},
   {n:'FreshCart',t:'Influencer campaigns',c:'#3b3a8f',w:'FreshCart',d:'Regional creators matched to city launches, with approvals tracked end to end.',v:12,l:'city launches'}
  ];
  const DUR=5000,N=P.length,cnt=$('#wcount');let cur=-1,timer=null,seen=false,hold=false,raf=0;
  list.style.setProperty('--dur',DUR+'ms');
  const slides=P.map((p,i)=>{
    const a=document.createElement('article');a.className='wslide';a.style.setProperty('--c',p.c);
    a.setAttribute('aria-label',(i+1)+' of '+N+': '+p.n);
    a.innerHTML='<div class="wcone" aria-hidden="true"></div><div class="wfloor" aria-hidden="true"></div><div class="wscan" aria-hidden="true"></div><div class="wart"><span class="wt"></span></div><div class="wmeta"><span class="wtag"></span><h3></h3><p></p><div class="wnum"><b>0</b><span></span></div></div>';
    const wt=a.querySelector('.wt');wt.textContent=p.w;wt.dataset.t=p.w;
    a.querySelector('.wtag').textContent=p.t;a.querySelector('h3').textContent=p.n;a.querySelector('p').textContent=p.d;a.querySelector('.wnum span').textContent=p.l;
    track.appendChild(a);
    const d=document.createElement('i');dots.appendChild(d);
    const li=document.createElement('li');li.style.setProperty('--i',i);li.style.setProperty('--c',p.c);
    li.innerHTML='<button type="button"><span class="k">'+String(i+1).padStart(2,'0')+'</span><b></b><small></small></button>';
    li.querySelector('b').textContent=p.n;li.querySelector('small').textContent=p.t;
    li.querySelector('button').addEventListener('click',()=>{show(i);restart()});
    list.appendChild(li);
    return a;
  });
  const btns=[...list.querySelectorAll('button')],dd=[...dots.children];
  function count(el,v){
    cancelAnimationFrame(raf);if(RM){el.textContent=v;return}
    const s=performance.now();(function f(t){const k=Math.min((t-s)/1100,1);el.textContent=Math.round(v*(1-Math.pow(1-k,3)));if(k<1)raf=requestAnimationFrame(f)})(s);
  }
  function show(i){
    i=(i+N)%N;if(i===cur)return;cur=i;
    track.style.transform='translateX('+(-i*100)+'%)';
    st.style.setProperty('--c',P[i].c);cnt.textContent=String(i+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');
    slides.forEach((s,k)=>{s.classList.remove('act');s.querySelector('.wt').style.setProperty('--par',k<i?'-60px':k>i?'60px':'0px')});
    const s=slides[i];void s.offsetWidth;s.classList.add('act');
    count(s.querySelector('.wnum b'),P[i].v);
    btns.forEach((b,k)=>{if(k===i){b.removeAttribute('aria-current');void b.offsetWidth;b.setAttribute('aria-current','true')}else b.removeAttribute('aria-current')});
    dd.forEach((d,k)=>d.classList.toggle('on',k===i));
  }
  const go=d=>{show(cur+d);restart()};
  function restart(){clearInterval(timer);if(RM||!seen)return;timer=setInterval(()=>{if(!hold)show(cur+1)},DUR)}
  [st,list].forEach(e=>{
    const on=()=>{hold=true;list.classList.add('paused')},off=()=>{hold=false;list.classList.remove('paused')};
    e.addEventListener('pointerenter',on);e.addEventListener('pointerleave',off);e.addEventListener('focusin',on);e.addEventListener('focusout',off);
  });
  $('#wprev').addEventListener('click',()=>go(-1));$('#wnext').addEventListener('click',()=>go(1));
  st.tabIndex=0;st.setAttribute('role','group');st.setAttribute('aria-roledescription','carousel');st.setAttribute('aria-label','Projects carousel, use arrow keys');
  st.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(-1);e.preventDefault()}else if(e.key==='ArrowRight'){go(1);e.preventDefault()}});
  /* drag the track with the pointer */
  let sx=null,dx=0;
  st.addEventListener('pointerdown',e=>{if(e.target.closest('.wnav'))return;sx=e.clientX;dx=0});
  addEventListener('pointermove',e=>{
    if(sx===null)return;dx=e.clientX-sx;
    if(Math.abs(dx)>6){track.classList.add('drag');st.classList.add('drag')}
    if(track.classList.contains('drag')){const w=st.clientWidth;let k=dx;if((cur===0&&dx>0)||(cur===N-1&&dx<0))k*=.35;track.style.transform='translateX(calc('+(-cur*100)+'% + '+k+'px))'}
  });
  function end(){
    if(sx===null)return;const d=dx;sx=null;dx=0;
    track.classList.remove('drag');st.classList.remove('drag');
    if(Math.abs(d)>50&&!((cur===0&&d>0)||(cur===N-1&&d<0))){go(d<0?1:-1)}else{track.style.transform='translateX('+(-cur*100)+'%)';restart()}
  }
  addEventListener('pointerup',end);addEventListener('pointercancel',end);
  new IntersectionObserver(es=>{
    const on=es[0].isIntersecting;
    if(on&&!seen){seen=true;list.classList.add('in');cur=-1;show(0)}
    if(on)restart();else clearInterval(timer);
  },{threshold:.3}).observe(st);
  cur=-1;show(0);
})();

/* approval gate demo */
const V=[
 "Rain on the window, kulhad in hand. The 7 a.m. ritual you never skip. Tag someone who owes you a chai.",
 "Some mornings need more than caffeine. Our new Monsoon Masala lands Friday. Slow down. Sip. Repeat.",
 "Introducing Monsoon Masala: cardamom, ginger and a little black pepper, brewed for grey skies. In every Kulhad & Co. cup from Friday."
];
const ta=$('#caption'),post=$('#post'),stat=$('#stat'),ap=$('#approve'),tabs=$$('.tab');
let timer=null,cur=0;
function load(i){
  cur=i;clearInterval(timer);post.classList.remove('done');
  tabs.forEach((b,j)=>b.setAttribute('aria-selected',j===i));
  ta.readOnly=false;ta.value='';ap.disabled=true;
  stat.textContent='AI is drafting...';
  if(RM){ta.value=V[i];ready();return}
  let k=0;timer=setInterval(()=>{ta.value=V[i].slice(0,++k);if(k>=V[i].length){clearInterval(timer);ready()}},16);
}
function ready(){ap.disabled=false;stat.textContent='AI draft. Needs a human edit. Nothing publishes until you approve.'}
tabs.forEach((b,i)=>b.addEventListener('click',()=>load(i)));
ap.addEventListener('click',()=>{
  if(!ta.value.trim())return;
  ta.readOnly=true;ap.disabled=true;post.classList.add('done');
  stat.textContent='Approved by you. Scheduled for Thursday 7:30 PM on Instagram.';
});
$('#redo').addEventListener('click',()=>load(cur));
ta.addEventListener('input',()=>{if(!ta.readOnly){ap.disabled=!ta.value.trim()}});
/* start the first draft when the post scrolls into view */
new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){load(0);o.disconnect()}},{threshold:.4}).observe(post);
ta.value=V[0];ready();

/* ticker duplicate for seamless loop */
const tr=$('#track');tr.innerHTML+=tr.innerHTML;

/* chat assistant: rule-based, runs anywhere with no server */
(function(){
  const fab=$('#chatBtn'),box=$('#chat'),log=$('#log'),chips=$('#chips'),form=$('#chatForm'),inp=$('#chatIn'),nudge=$('#nudge');
  const EMAIL='hello@yourdomain.com';
  const START=['What do you do?','Is everything human-approved?','How long does a build take?','How do I get started?'];
  const KB=[
   {k:['hello','hi','hii','hey','namaste','hola'],t:'Hi! I can tell you what Spotlight does, how our approval process works, or how to start. What would you like to know?',c:START},
   {k:['approv','human','safe','publish','autopilot','without our','control','trust'],t:'Every post, caption and budget move is approved by a person before it goes live. The approval step is built into the tool itself. AI drafts, our team edits, you sign off. Try it in the demo section.',g:'#demo',gl:'See the approval demo',c:['Do you automate PR pitches?','Will ad budgets move on their own?','How do I get started?']},
   {k:['pitch','journalist','press','pr ','pr?','media relations','exchange4media','storyboard'],t:'Our PR work is monitoring and research: trade press and social mentions, sentiment scoring and a daily digest. We never automate pitching. Every pitch is written and sent by a person.',c:['What do you do?','How do I get started?']},
   {k:['budget','ads',' ad ','google ads','meta ads','spend','pacing','cpc','ctr'],t:'We connect to Meta and Google Ads, then recommend budget changes, for example moving spend away from an ad set whose CTR stays flat for three days. A person approves each move. Nothing auto-executes with your money.',c:['Is everything human-approved?','How do I get started?']},
   {k:['creative','resize','reel','shorts','video','design','canva','format'],t:'Creative production is execution-focused: one asset resized into every platform format, rough cuts trimmed for Reels and Shorts, and template-driven social design. Standard formatting drops from hours to minutes.',c:['What do you do?','How long does a build take?']},
   {k:['influencer','creator','creators','negotiat'],t:'We shortlist creators who fit your audience, usually within a day, then track briefs, timelines and approvals in one workflow. Negotiation and relationships stay with our people.',c:['What do you do?','How do I get started?']},
   {k:['digital','content','calendar','social','instagram','linkedin','caption','copy','schedule'],t:'Digital marketing is our flagship: content calendars built from your brief and past performance, brand-voice captions (2 to 3 variants per post), scheduling on Instagram, X, LinkedIn and Meta, ad pacing, and automatic weekly and monthly reports.',g:'#services',gl:'View services',c:['Is everything human-approved?','How do I get started?']},
   {k:['report','dashboard','analytics','metrics','numbers'],t:'Engagement, reach and spend data is pulled in daily from Meta, Google and Instagram. Weekly and monthly client reports are generated from live numbers, so nobody rebuilds charts by hand.',c:['What do you do?','How do I get started?']},
   {k:['how long','timeline','week','roadmap','phase','when','duration','time'],t:'The full platform is planned over 19 weeks. Foundation takes 2 weeks, digital marketing automation weeks 3 to 10, PR intelligence 4 weeks, creative tooling 3 weeks and influencer tooling 2 weeks.',g:'#roadmap',gl:'See the roadmap',c:['What do you do?','How do I get started?']},
   {k:['price','pricing','cost','how much','fee','retainer','budget for','charge','kitna','daam','rate'],t:'Pricing depends on which services you need and the scope. We will not guess a number here. Book a strategy call and we will come back with a clear plan and a quote.',g:'#contact',gl:'Book a strategy call',c:['What do you do?','How do I get started?']},
   {k:['start','book','call','contact','email','reach','talk','meeting','hire','get in touch','onboard'],t:'Easiest way: book a strategy call. Email us at '+EMAIL+' with your goals and we will reply with a plan, not a deck full of promises.',g:'#contact',gl:'Go to contact',c:['What do you do?','Is everything human-approved?']},
   {k:['what do you do','service','services','offer','help','about','who are you','spotlight'],t:'Spotlight is a digital media and marketing agency with four services: digital marketing, PR intelligence, creative production and influencer campaigns. AI drafts and monitors, people approve every decision.',g:'#services',gl:'View services',c:['Is everything human-approved?','How long does a build take?','How do I get started?']},
   {k:['thank','thanks','shukriya','dhanyavad','ok','okay'],t:'Happy to help! Anything else you want to know?',c:START},
   {k:['bye','goodbye','later'],t:'Bye! Whenever you are ready for your moment in the Spotlight, we are here.'}
  ];
  const norm=s=>' '+s.toLowerCase().replace(/[^a-z0-9? ]/g,' ')+' ';
  function find(q){
    const n=norm(q);let best=null,sc=0;
    for(const e of KB){let s=0;for(const k of e.k){if(n.includes(k.length<4?' '+k.trim()+' ':k))s+=k.length}if(s>sc){sc=s;best=e}}
    return best||{t:'I am not sure about that one. I can cover services, approvals, timelines and getting started, or you can email '+EMAIL+' and a person will answer.',c:START};
  }
  function add(txt,who,go){
    const d=document.createElement('div');d.className='msg '+who;d.textContent=txt;
    if(go){const a=document.createElement('a');a.className='go';a.tabIndex=0;a.textContent=go.l+' →';
      const run=()=>{box.hidden=true;fab.setAttribute('aria-expanded','false');document.querySelector(go.h).scrollIntoView({behavior:RM?'auto':'smooth'})};
      a.addEventListener('click',run);a.addEventListener('keydown',e=>{if(e.key==='Enter')run()});d.append(document.createElement('br'),a)}
    log.append(d);log.scrollTop=log.scrollHeight;return d;
  }
  function setChips(list){
    chips.innerHTML='';(list||[]).forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=c;b.style.animationDelay=(i*70)+'ms';b.addEventListener('click',()=>ask(c));chips.append(b)});
    log.scrollTop=log.scrollHeight;
  }
  let busy=false;
  function ask(q){
    if(busy||!q.trim())return;busy=true;
    add(q.trim(),'me');setChips([]);
    const r=find(q);
    const ty=document.createElement('div');ty.className='msg bot typing';ty.innerHTML='<i></i><i></i><i></i>';log.append(ty);log.scrollTop=log.scrollHeight;
    setTimeout(()=>{ty.remove();add(r.t,'bot',r.g?{h:r.g,l:r.gl}:null);setChips(r.c);busy=false},RM?0:650+Math.min(r.t.length*6,900));
  }
  let started=false;
  function open(){
    box.hidden=false;fab.setAttribute('aria-expanded','true');fab.setAttribute('aria-label','Close chat');nudge.classList.remove('show');
    if(!started){started=true;busy=true;
      const ty=document.createElement('div');ty.className='msg bot typing';ty.innerHTML='<i></i><i></i><i></i>';log.append(ty);
      setTimeout(()=>{ty.remove();add('Welcome to Spotlight! I am the studio assistant. Ask me anything about our services, how approvals work, or timelines.','bot');setChips(START);busy=false},RM?0:800)}
    setTimeout(()=>inp.focus({preventScroll:true}),50);
  }
  function close(){box.hidden=true;fab.setAttribute('aria-expanded','false');fab.setAttribute('aria-label','Open chat');fab.focus()}
  fab.addEventListener('click',()=>box.hidden?open():close());
  $('#chatX').addEventListener('click',close);
  nudge.addEventListener('click',open);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()});
  form.addEventListener('submit',e=>{e.preventDefault();const v=inp.value;inp.value='';ask(v)});
  setTimeout(()=>{if(box.hidden&&!started&&!document.body.classList.contains('cookie-open')){nudge.classList.add('show');setTimeout(()=>nudge.classList.remove('show'),7000)}},5000);
})();

/* copy email */
$('#copy').addEventListener('click',async e=>{
  const b=e.currentTarget,txt=$('#mail').textContent;
  try{await navigator.clipboard.writeText(txt);b.textContent='Copied'}
  catch(_){const r=document.createRange();r.selectNodeContents($('#mail'));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected, press copy'}
  setTimeout(()=>b.textContent='Copy',2000);
});

/* footer year */
(function(){var y=document.getElementById('y');if(y)y.textContent=new Date().getFullYear()})();


/* enquiry form: validation, spam protection, honest send states */
(function(){
  const f=$('#enq');if(!f)return;
  const ENDPOINT=''; // Paste a form-handler URL here, e.g. 'https://formspree.io/f/yourid'. Empty = email fallback.
  const EMAIL=$('#mail').textContent.trim();
  const LOADED=Date.now(),COOL='spotlight_last_send',COOL_MS=60000;
  const F={name:$('#f-name'),email:$('#f-email'),company:$('#f-co'),service:$('#f-svc'),message:$('#f-msg'),ok:$('#f-ok'),web:$('#f-web')};
  const stat=$('#fstat'),go=$('#f-go'),cnt=$('#cnt');
  const RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules={
    name:v=>v.trim().length<2?'Please enter your name.':'',
    email:v=>!RE.test(v.trim())?'Please enter a valid email, like name@company.com.':'',
    message:v=>v.trim().length<20?'Please write at least 20 characters so we can help properly.':'',
    ok:()=>!F.ok.checked?'Please tick the box so we can reply to you.':''
  };
  const errEl={name:$('#e-name'),email:$('#e-email'),message:$('#e-msg'),ok:$('#e-ok')};
  function check(k){
    const el=F[k],msg=rules[k](k==='ok'?'':el.value);
    errEl[k].textContent=msg;el.setAttribute('aria-invalid',msg?'true':'false');return !msg;
  }
  Object.keys(rules).forEach(k=>{
    F[k].addEventListener('blur',()=>{if(k!=='ok'&&!F[k].value&&!F[k].dataset.touched)return;check(k)});
    F[k].addEventListener('input',()=>{F[k].dataset.touched='1';if(F[k].getAttribute('aria-invalid')==='true')check(k)});
    F[k].addEventListener('change',()=>{if(k==='ok')check(k)});
  });
  F.message.addEventListener('input',()=>{cnt.textContent=F.message.value.length+' / 1200'});
  const say=(t,c)=>{stat.className='fstat'+(c?' '+c:'');stat.textContent=t};
  function fallback(d){
    const body='Name: '+d.name+'\nEmail: '+d.email+(d.company?'\nCompany: '+d.company:'')+'\nInterested in: '+d.service+'\n\n'+d.message;
    const href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Spotlight strategy call: '+d.name)+'&body='+encodeURIComponent(body);
    stat.className='fstat ok';stat.innerHTML='';
    const p=document.createElement('div');p.textContent='Your message is ready. Nothing has been sent yet. Open it in your email app, or copy it and email '+EMAIL+'.';
    const row=document.createElement('div');row.className='row';
    const a=document.createElement('a');a.className='btn sm';a.href=href;a.textContent='Open email app';
    const c=document.createElement('button');c.type='button';c.className='btn sm ghost';c.textContent='Copy message';
    c.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(body);c.textContent='Copied'}catch(_){const t=document.createElement('textarea');t.value=body;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();try{document.execCommand('copy');c.textContent='Copied'}catch(e){c.textContent='Select and copy manually'}t.remove()}});
    row.append(a,c);stat.append(p,row);
  }
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const okAll=['name','email','message','ok'].map(check).every(Boolean);
    if(!okAll){const bad=f.querySelector('[aria-invalid="true"]');if(bad)bad.focus();say('Please fix the highlighted fields.','bad');return}
    if(F.web.value){say('Thank you. We will be in touch soon.','ok');f.reset();return} // honeypot: bots fill hidden fields
    if(Date.now()-LOADED<3000){say('That was very quick. Please check your details and press the button again.','bad');return}
    try{const last=+localStorage.getItem(COOL)||0;if(Date.now()-last<COOL_MS){say('You just sent a message. Please wait a minute before sending another.','bad');return}}catch(_){}
    const d={name:F.name.value.trim(),email:F.email.value.trim(),company:F.company.value.trim(),service:F.service.value,message:F.message.value.trim()};
    if(!ENDPOINT){fallback(d);return}
    go.classList.add('busy');go.textContent='Sending...';say('');
    try{
      const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)});
      if(!r.ok)throw new Error(r.status);
      try{localStorage.setItem(COOL,String(Date.now()))}catch(_){}
      f.reset();cnt.textContent='0 / 1200';say('Thank you, '+d.name.split(' ')[0]+'. We have your message and will reply within one working day.','ok');
    }catch(_){say('Sorry, that did not send. Please try again, or email '+EMAIL+'.','bad')}
    go.classList.remove('busy');go.textContent='Book a strategy call';
  });
})();

/* scroll-driven cinematic reel: SPOT [lamp] LIGHT -> zoom -> light burst -> words -> closing scene */
(function(){
  const reel=$('#reel');if(!reel)return;
  const cv=$('#burst'),cx=cv.getContext('2d'),pin=$('.reel-pin'),lamp=$('#rlamp'),gl=$('#gwl'),gr=$('#gwr'),fl=$('.flash');
  const cbl=$('#cbl'),ctr=$('#ctr'),sB=$('#sB'),rt=$('#rtext'),cnt=$('#rcount'),sC=$('#sC'),lnA=$('#lnA'),lnB=$('#lnB'),cinfo=$('#cinfo'),hint=$('#rhint'),dots=$$('.rdots i');
  const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),seg=(p,a,b)=>cl((p-a)/(b-a)),ease=t=>t*t*(3-2*t),eo=t=>1-Math.pow(1-t,3);
  rt.innerHTML=rt.textContent.trim().split(/\s+/).map(w=>'<span>'+w+'</span>').join(' ');
  const wsp=[...rt.children];

  /* particles: spiky powder burst along random rays */
  const COLS=['255,176,40','255,208,110','232,150,30','78,76,170'],P=[];
  let W=0,H=0,D=1;
  function build(){
    P.length=0;const n=innerWidth<700?1300:3400,rays=[];
    for(let r=0;r<64;r++)rays.push({a:r/64*Math.PI*2+(Math.random()-.5)*.09,L:.5+Math.random()*.5});
    for(let i=0;i<n;i++){const r=rays[(Math.random()*64)|0];
      P.push({a:r.a+(Math.random()-.5)*.05,L:r.L,u:Math.pow(Math.random(),.75),s:.6+Math.random()*1.9,c:(Math.random()*COLS.length)|0,j:Math.random()-.5})}
    P.sort((x,y)=>x.c-y.c);
  }
  function size(){D=Math.min(devicePixelRatio||1,1.5);W=cv.width=Math.round(pin.clientWidth*D);H=cv.height=Math.round(pin.clientHeight*D)}
  size();build();
  addEventListener('resize',()=>{size();build()});

  function burst(b,fade,ox,oy){
    cx.clearRect(0,0,W,H);
    if(b<=0||fade<=0)return;
    cx.globalCompositeOperation='source-over';
    const R=Math.hypot(W,H)*.6,e=eo(b);
    const g=cx.createRadialGradient(ox,oy,0,ox,oy,R*.5*e+1);
    g.addColorStop(0,'rgba(255,214,110,'+(.7*fade)+')');g.addColorStop(.45,'rgba(255,196,90,'+(.3*fade)+')');g.addColorStop(1,'rgba(90,86,190,0)');
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    let last=-1;
    for(const q of P){
      if(q.c!==last){cx.fillStyle='rgb('+COLS[q.c]+')';last=q.c}
      const r=q.L*q.u*R*e,x=ox+Math.cos(q.a)*r-Math.sin(q.a)*q.j*10*D*b,y=oy+Math.sin(q.a)*r+Math.cos(q.a)*q.j*10*D*b;
      cx.globalAlpha=Math.max(0,(.95-q.u*.5)*fade);
      cx.beginPath();cx.arc(x,y,q.s*D*1.15*(1.25-q.u*.7),0,6.283);cx.fill();
    }
    cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  }

  /* dust motes drifting up through the lamp's beam */
  const mc=$('#motes'),mx2=mc.getContext('2d'),MW=mc.width,MH=mc.height,M=[];
  for(let i=0;i<46;i++)M.push({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.9,v:.0006+Math.random()*.0016,a:Math.random()*6.28,s:.4+Math.random()});
  let lampVis=1;
  function motes(t){
    mx2.clearRect(0,0,MW,MH);if(lampVis<.05)return;
    for(const m of M){
      m.y-=m.v;m.x+=Math.sin(t/1700+m.a)*.0004;
      if(m.y<0){m.y=1;m.x=Math.random()}
      const cone=.5+m.y*.5,dx=Math.abs(m.x-.5)*2;if(dx>cone)continue;
      const f=Math.sin(Math.min(m.y,1)*Math.PI)*(.45+.55*Math.sin(t/600*m.s+m.a)**2);
      mx2.globalAlpha=Math.max(0,f)*lampVis;mx2.fillStyle=m.r>1.6?'#fff6d6':'#f0a02a';
      mx2.beginPath();mx2.arc(m.x*MW,m.y*MH,m.r*1.6,0,6.283);mx2.fill();
    }
    mx2.globalAlpha=1;
  }
  let ps=0,mx=0,my=0,tmx=0,tmy=0,live=false;
  addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5},{passive:true});
  new IntersectionObserver(es=>{live=es[0].isIntersecting},{rootMargin:'100px'}).observe(reel);

  const sH=$('#sH'),hdr=document.querySelector('header');
  const LC=[.5,.4]; /* lens centre inside lamp.webp */
  function render(P0){
    mx+=(tmx-mx)*.06;my+=(tmy-my)*.06;
    const vw=pin.clientWidth,vh=pin.clientHeight,mob=vw<700;
    /* hero intro: copy fades, lamp glides from the right to centre, words fade in */
    const h0=seg(P0,0,.1),eh=ease(h0),p=seg(P0,.1,1);
    sH.style.opacity=1-seg(P0,0,.07);sH.style.transform='translateY('+(-30*seg(P0,0,.07))+'px)';
    const hv=P0<.075;sH.style.visibility=hv?'visible':'hidden';sH.style.pointerEvents=hv?'auto':'none';
    /* scene A: words part, lamp zooms */
    const a=seg(p,0,.34),ea=ease(a),gone=seg(p,.30,.42);
    const t=ea*.55+gone*.45,wo=eh*(1-seg(p,.28,.40));
    gl.style.setProperty('--t',t);gr.style.setProperty('--t',t);gl.style.setProperty('--o',wo);gr.style.setProperty('--o',wo);
    let lo,tx=0,ty=0,s,rz,ry;
    if(p<.5){
      const hs=mob?.72:.82;
      lo=1-seg(p,.30,.38);s=(hs+(1-hs)*eh)*(1+.95*ea);
      tx=(1-eh)*(mob?vw*.12:vw*.24);ty=(1-eh)*(mob?vh*.2:vh*.03)-.05*vh*ea;
      rz=-4+8*a+(1-eh)*6;ry=-22+44*a+mx*14+(1-eh)*-14;
    }else{
      const q=seg(p,.78,.92);lo=q;s=.8+.1*eo(q);tx=(1-eo(q))*vw*.55+vw*.2;ty=-.02*vh;rz=18-26*eo(q);ry=-10+mx*10;
    }
    lamp.style.opacity=lo;lampVis=lo;lamp.style.visibility=lo>.01?'visible':'hidden';
    lamp.style.transform='translate(-50%,-50%) translate3d('+tx+'px,'+ty+'px,0) rotateX('+(-my*8)+'deg) rotateY('+ry+'deg) rotateZ('+rz+'deg) scale('+s+')';
    const co=eh*(1-seg(p,.04,.16));cbl.style.opacity=co;ctr.style.opacity=co;
    hint.style.opacity=seg(P0,.09,.12)*(1-seg(p,0,.05));
    /* flash + burst from the lens */
    fl.style.opacity=(1-Math.abs(seg(p,.30,.46)*2-1))*.92;
    const lw=lamp.offsetWidth,lh=lamp.offsetHeight,sc=p<.5?s:1;
    const ox=(vw/2+tx+(LC[0]-.5)*lw*sc)*D,oy=(vh*.46+ty+(LC[1]-.5)*lh*sc)*D;
    burst(seg(p,.33,.66),1-seg(p,.74,.90),ox,oy);
    /* scene B: scrubbed words + counter */
    const bo=seg(p,.50,.60)*(1-seg(p,.76,.84));
    sB.style.opacity=bo;sB.style.visibility=bo>.01?'visible':'hidden';
    wsp.forEach((w,i)=>{w.style.opacity=.12+.88*cl((p-(.51+i*.0042))/.025)});
    cnt.textContent=Math.round(100*seg(p,.54,.72));
    /* scene C: giant lines + info */
    const co2=seg(p,.80,.84);sC.style.opacity=co2>0?1:0;sC.style.visibility=co2>0?'visible':'hidden';
    lnA.style.setProperty('--c',(100*(1-seg(p,.80,.88)))+'%');lnB.style.setProperty('--c',(100*(1-seg(p,.84,.92)))+'%');
    const ci=seg(p,.88,.96);cinfo.style.opacity=ci;cinfo.style.pointerEvents=ci>.5?'auto':'none';
    const idx=P0<.1?-1:p<.3?0:p<.78?1:2;dots.forEach((d,i)=>d.classList.toggle('on',i===idx));
  }

  if(RM){render(0);return}
  render(0);
  (function loop(){
    if(live){
      const hh=hdr?hdr.offsetHeight:0,r=reel.getBoundingClientRect(),total=reel.offsetHeight-pin.offsetHeight;
      pin.style.setProperty('--hh',hh+'px');
      const target=total>0?cl((hh-r.top)/total):0;
      ps+=(target-ps)*.14;if(Math.abs(target-ps)<.0004)ps=target;
      render(ps);motes(performance.now());
    }
    requestAnimationFrame(loop);
  })();
})();
