'use strict';
/* A DATE IN THE RAIN — vanilla JS + Canvas.
   All art is drawn in code (see world(), person(), interior()); replace those functions with sprites if you like.
   Audio: drop files into ./assets/music and ./assets/sounds; if a file is missing, a synthesized sound is used. */
const $=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mk=()=>document.createElement('canvas'),cv=$('#c'),g=cv.getContext('2d');
const wc=mk(),w=wc.getContext('2d'),cc=mk(),c2=cc.getContext('2d'),ac=mk(),a2=ac.getContext('2d');
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>t*t*(3-2*t),rnd=(a,b)=>a+Math.random()*(b-a);
const mix=(a,b,t)=>((lerp(a>>16,b>>16,t)&255)<<16)|((lerp(a>>8&255,b>>8&255,t)&255)<<8)|(lerp(a&255,b&255,t)&255);
let W=320,H=180,st='title',T=0,once=0,sun=0,S=0,warm=0,zoom=0,umb=0,reveal=0,fade=0,door=0,pAlpha=1,walking=false,esc=0,time=0,
city=[],drops=[],splash=[],flies=[],flash=0,bolt=5,cat={x:0,on:0,next:6},bx=-30,gx=-30,by=150,gy=130,cam={z:1,x:160,y:90},
rainK=1,rainLvl=1,started=false,vig=null,G,MONO=false;

/* ---------- drawing helpers: colour pass uses (night,sunset) pairs, mono pass converts to grey (keep=true keeps red accents) ---------- */
const hx=c=>'#'+(c&0xffffff).toString(16).padStart(6,'0');
function F(x,a,b,k){let c=b==null?a:mix(a,b,S);if(MONO&&!k){const l=((c>>16)*.3+(c>>8&255)*.59+(c&255)*.11)|0;c=l<<16|l<<8|l}x.fillStyle=hx(c)}
const r=(x,y,w,h,a,b,k)=>{F(G,a,b,k);G.fillRect(x|0,y|0,Math.ceil(w),Math.ceil(h))};
const glow=(x,y,rad,rgb,a)=>{const q=G.createRadialGradient(x,y,0,x,y,rad);q.addColorStop(0,`rgba(${rgb},${a})`);q.addColorStop(1,`rgba(${rgb},0)`);G.fillStyle=q;G.fillRect(x-rad,y-rad,rad*2,rad*2)};
const BC=[[0x2a3558,0xc0607a],[0x4a2f58,0x9a4a7a],[0x2f4a58,0xd98c6a],[0x55303a,0xb04a5a]];

function initializeScene(){
  const asp=innerWidth/innerHeight;
  if(asp<1){W=180;H=clamp(Math.round(180/asp),180,440)}else{H=180;W=clamp(Math.round(180*asp),180,440)}
  [cv,wc,cc,ac].forEach(c=>{c.width=W;c.height=H});
  city=[];let x=-4,i=0;
  while(x<W){const bw=24+(Math.random()*22|0);city.push({x,w:bw,h:H*rnd(.3,.55)|0,i:i%4,win:Array.from({length:20},()=>Math.random()<.55)});x+=bw+2;i++}
  const k=W*H/57600;
  drops=Array.from({length:Math.round((RM?70:170)*k)},()=>({x:rnd(0,W+40),y:rnd(0,H),v:rnd(160,260)}));
  flies=Array.from({length:Math.round(36*k)},()=>({x:rnd(0,W),y:rnd(H*.3,H),p:rnd(0,6.3)}));
  vig=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,Math.hypot(W,H)*.6);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,.55)');
  if(reveal>=1){a2.fillStyle='#fff';a2.fillRect(0,0,W,H)}
}

/* ---------- the street ---------- */
function world(ctx,mono){
  G=ctx;MONO=mono;S=mono?0:sun;gy=H*.74|0;
  for(let y=0;y<gy;y+=3){const t=y/gy;F(G,mix(0x0c1022,0x28345c,t),t<.5?mix(0x3b2466,0xe86f9a,t*2):mix(0xe86f9a,0xf5a65b,t*2-1));G.fillRect(0,y,W,3)}
  if(S>0){G.globalAlpha=S;G.fillStyle='#ffd27a';G.beginPath();G.arc(W*.7,gy-8,16,0,7);G.fill();G.globalAlpha=1}
  for(let x=0;x<W;x+=14){const h=24+Math.abs(Math.sin(x*.37))*46|0;r(x,gy-h,14,h,0x141a2e,0x8a4a6a)}
  city.forEach(b=>{const[c,d]=BC[b.i],top=gy-b.h;r(b.x,top,b.w,b.h,c,d);const cols=Math.max(2,b.w/8|0);
    for(let j=0;j<40;j++){const wx=b.x+3+(j%cols)*8,wy=top+4+(j/cols|0)*12;if(wy>gy-10)break;const on=b.win[j%20];r(wx,wy,4,6,on?0xffd98a:0x151a2a,on?0xffeeb0:0x3a2a4a)}
    if(b.i%2===0){const nx=b.x+b.w-6,ny=top+8;glow(nx+1,ny+8,12+S*6,'255,40,50',.3);r(nx,ny,3,16,0xd92332,0xff3355,true);r(nx+1,ny+2,1,3,0xffffff,0xffffff,true)}
    r(b.x+b.w/2-4,top-5,8,5,0x1a1a22,0x5a3a4a);r(b.x+b.w/2-1,top-9,1,4,0x1a1a22,0x5a3a4a);r(b.x,top,b.w,1,0x4a4f66,0xffc0a0);r(b.x+2,top+22+(b.i*5)%10,6,3,0x2a2a33,0x7a5a5a)
  });
  const sw=Math.min(96,W*.55)|0,sx=(W-sw)/2|0,sh=52,top=gy-sh,dx=W/2-8;
  r(sx,top+10,sw,sh-10,0x6b4a34,0xb87a4a);r(sx-4,top,sw+8,11,0x2a2224,0x8a2e3e);r(sx-4,top+9,sw+8,2,0x111111,0x4a1a24);
  for(let x=sx-4;x<sx+sw+4;x+=4){r(x,top+3,2,1,0x1a1618,0x5a1c2a);r(x+2,top+6,2,1,0x1a1618,0x5a1c2a)}for(let y=top+17;y<gy-2;y+=6)r(sx,y,sw,1,0x58392a,0x9a6238);r(dx-3,gy+2,22,2,0x555555,0xa08070);
  r(W/2-22,top+14,44,11,0x161616,0x2a1418);F(G,0xe8e8e8,0xffe9a0);G.font='7px sans-serif';G.textAlign='center';G.fillText('ラーメン',W/2,top+22);
  r(sx+5,top+30,20,14,0xcfa860,0xffd070);r(sx+sw-25,top+30,20,14,0xcfa860,0xffd070);
  r(dx,gy-26,16,28,0x3a2410,0xffc060);r(dx,gy-26,16*(1-door),28,0x4a2e1c,0x9a5a30);r(dx-3,gy-32,22,9,0xd92332,0xff2a3a,true);r(dx+4,gy-32,1,9,0x7a1018,0xa01828,true);r(dx+11,gy-32,1,9,0x7a1018,0xa01828,true);r(dx+7,gy-29,3,2,0xffffff,0xffffff,true);glow(W/2,gy-10,42,MONO?'255,255,255':'255,190,110',.1+S*.14);
  [sx+2,sx+sw-2].forEach(x=>{const y=top+17;glow(x,y,16+S*14,'255,50,40',.35+.1*Math.sin(time*3)+S*.2);r(x,top+10,1,y-top-14,0x111111,0x111111);F(G,0xd92332,0xff3344,true);G.beginPath();G.arc(x,y,4.5,0,7);G.fill()});
  [W*.18,W*.82].forEach(x=>{r(x,gy-44,2,44,0x222222,0x4a3040);r(x-3,gy-46,8,3,0x222222,0x4a3040);glow(x+1,gy-44,22+S*14,MONO?'255,255,255':'255,214,140',.14+S*.28)});
  [2,22].forEach(x=>{const y=gy-7;r(x,y,16,4,0x333333,0x7a1a2a);r(x,y+3,5,5,0x0a0a0a,0x0a0a0a);r(x+11,y+3,5,5,0x0a0a0a,0x0a0a0a);r(x+15,y,2,2,0xdddddd,0xfff0a0)});
  for(let i=0;i<4;i++){const x=3+i*10|0,y=gy-10;
    r(x,y,7,9,0x161616,0x2a2030);r(x+3,y,1,5,0xcfcfcf,0xe8e0d0);r(x+1,y-6,5,6,0xb08868,0xe0a070);r(x,y-7,7,3,i==2?0x8a7a40:0x0a0a0a,i==2?0xd8c070:0x141414);r(x+1,y-4,5,1,0,0);
    if(Math.sin(time*3+i*2)>-.4){glow(x+8,y-2,6,'255,40,20',.55);r(x+7,y-2,2,1,0xff3020,0xff3020,true)}
    G.globalAlpha=.3;for(let k=0;k<3;k++)r(x+8+Math.sin(time+k+i)*2,y-4-((time*6+k*5+i*3)%16),2,2,0x888888,0xbbbbbb);G.globalAlpha=1}
  r(0,gy,W,H-gy,0x14161e,0x4a3040);r(0,gy,W,7,0x23262f,0x7a5a5a);r(0,gy+7,W,1,0x3a3a44,0xb08a70);
  [.14,.4,.66,.86].forEach((f,i)=>{const px=W*f|0,py=gy+14+(i%2)*14+i*3;r(px,py,22,3,0x2a3350,0xf0a080);r(px+4,py+1,14,1,0x4a5578,0xfff0c0)});
  G.globalAlpha=.35;[sx+2,sx+sw-2].forEach(x=>r(x-1,gy+9,2,14,0xd92332,0xff3344,true));
  G.globalAlpha=.2;[W*.18,W*.82].forEach(x=>r(x,gy+9,2,22,0xffe0a0,0xffe0a0));G.globalAlpha=1;
  [.14,.4,.66,.86].forEach((f,i)=>{const px=W*f|0,py=gy+14+(i%2)*14+i*3,rw=(time*5+i*3)%11;G.globalAlpha=.45*(1-rw/11);r(px+11-rw,py+1,rw*2,1,0xaab4d8,0xfff0d0);G.globalAlpha=1});
  for(let x=4;x<W;x+=22)r(x,gy+(H-gy)*.62|0,10,1,0x4a4a55,0xc0a090);
  if(cat.on){const y=H*.93|0,x=cat.x|0,l=(time*10&1);r(x,y,7,4,0x777777,0xd08a4a);r(x+6,y-2,3,3,0x777777,0xd08a4a);r(x+6,y-3,1,1,0x777777,0xd08a4a);r(x-3,y-2,3,1,0x777777,0xd08a4a);r(x+1,y+4,1,l?2:1,0x777777,0xd08a4a);r(x+5,y+4,1,l?1:2,0x777777,0xd08a4a)}
  if(st!=='title'){G.globalAlpha=pAlpha;person(bx,by,true,walking);person(gx,by,false,walking);G.globalAlpha=1;if(umb>0)umbrella()}
}
function person(x,y,boy,wk,sit){
  const s=wk&&(time*8&1),sk=0xc9a283,sk2=0xf2c9a0;x|=0;y|=0;
  if(!sit){const a=G.globalAlpha;G.globalAlpha=a*.4;r(x-1,y-1,11,2,0,0);G.globalAlpha=a;
    const l1=s?7:5,l2=s?5:7,c1=boy?0x20232f:0xb89a88,c2=boy?0x2a2a50:0xf2c9a0;
    r(x+1,y-7,2,l1,c1,c2);r(x+5,y-7,2,l2,c1,c2);r(x+(boy?1:0),y-8+l1,3,1,0x0a0a0a,0x1a1a1a);r(x+(boy?5:4),y-8+l2,3,1,0x0a0a0a,0x1a1a1a)}
  if(boy){
    r(x,y-16,8,9,0x2d4f6e,0x3b8ec2);r(x,y-16,1,9,0x3c6a8e,0x5ab0e0);r(x+5,y-16,3,9,0x1f3a52,0x2a6a96);
    r(x+(s?3:4),y-15,2,6,0x1f3a52,0x2a6a96);r(x+(s?3:4),y-9,2,1,sk,sk2);
    r(x,y-17,8,2,0xd92332,0xff3344,true);r(x-(s?3:2),y-16,2,s?5:4,0xd92332,0xff3344,true);
    r(x+1,y-23,6,6,sk,sk2);r(x,y-24,8,3,0x101010,0x1a1a1a);r(x-1,y-23,2,5,0x101010,0x1a1a1a);r(x+5,y-21,3,1,0x101010,0x1a1a1a);r(x+5,y-20,1,1,0,0);
  }else{
    r(x-1,y-24,10,5,0x141418,0x1c1c26);r(x-1,y-20,2,8,0x141418,0x1c1c26);r(x+7,y-20,2,7,0x141418,0x1c1c26);
    r(x+1,y-22,6,6,sk,sk2);r(x+1,y-22,6,2,0x141418,0x1c1c26);r(x+2,y-20,1,1,0,0);r(x+6,y-23,2,2,0xd92332,0xff3344,true);r(x+2,y-24,2,1,0x3a3a4a,0x6a5a7a);
    r(x,y-16,8,8,0x7a3a55,0xff7aa8);r(x+5,y-16,3,8,0x5a2a40,0xe0608a);r(x,y-12,8,1,0x2a1a22,0xffd0e0);
    r(x+(s?3:2),y-15,2,5,0x5a2a40,0xe0608a);r(x+(s?3:2),y-10,2,1,sk,sk2);
    r(x-1,y-8,10,3,0x7a3a55,0xff7aa8);r(x-1,y-6,10,1,0x5a2a40,0xe0608a);
  }
}
function umbrella(){
  const cx=(bx+gx)/2+4,top=by-36,ro=17*umb,ey=top+5;
  r(cx,top,1,22,0x222222,0x222222);r(cx-2,by-17,2,2,0xc9a283,0xf2c9a0);
  F(G,0xb01c2a,0xe02a3c,true);G.beginPath();G.ellipse(cx+.5,ey,ro,9*umb,0,Math.PI,0);G.fill();
  G.strokeStyle='rgba(60,0,10,.55)';G.lineWidth=1;G.beginPath();for(let k=-2;k<=2;k++){G.moveTo(cx+.5,ey-9*umb);G.lineTo(cx+.5+k*ro/2.2,ey)}G.stroke();
  const n=6,sw=2*ro/n;for(let k=0;k<n;k++)r(cx-ro+k*sw,ey,sw,1+(k&1),0x9a1020,0xb01828,true);
  r(cx-ro*.55,ey-6*umb,ro*.3,1,0xff7a80,0xff9aa0,true);
}
function paintAura(){
  if(st==='title')return;
  const rad=lerp(24,34,umb);a2.globalAlpha=.22;
  for(const x of[bx+4,gx+4]){const y=by-11,q=a2.createRadialGradient(x,y,0,x,y,rad);q.addColorStop(0,'#fff');q.addColorStop(.6,'rgba(255,255,255,.7)');q.addColorStop(1,'rgba(255,255,255,0)');a2.fillStyle=q;a2.fillRect(x-rad,y-rad,rad*2,rad*2)}
  a2.globalAlpha=1;
  if(reveal>0){const cx=(bx+gx)/2+4,cy=by-11,R=reveal*Math.hypot(W,H)*1.05,q=a2.createRadialGradient(cx,cy,R*.7,cx,cy,R);q.addColorStop(0,'#fff');q.addColorStop(1,'rgba(255,255,255,0)');a2.fillStyle=q;a2.fillRect(0,0,W,H)}
  if(reveal>=1){a2.fillStyle='#fff';a2.fillRect(0,0,W,H)}
}
function rain(dt){
  const n=drops.length*rainK|0,cx=(bx+gx)/2+4,op=umb>.5&&pAlpha>0&&st!=='interior',ro=17*umb,top=by-33;
  w.strokeStyle='rgba(205,215,235,.4)';w.lineWidth=1;w.beginPath();
  for(let i=0;i<n;i++){const d=drops[i];d.y+=d.v*dt;d.x-=d.v*.12*dt;
    if(op&&Math.abs(d.x-cx)<ro&&d.y>top){splash.push({x:d.x,y:top+Math.abs(d.x-cx)*.15,t:0});d.y=-4;d.x=rnd(0,W+40)}
    if(d.y>H){d.y=-6;d.x=rnd(0,W+40)}
    w.moveTo(d.x|0,d.y|0);w.lineTo((d.x-1)|0,(d.y+4)|0)}
  w.stroke();
  splash=splash.filter(s=>(s.t+=dt)<.25);w.fillStyle='rgba(255,255,255,.7)';splash.forEach(s=>{w.fillRect(s.x-1|0,s.y-1|0,1,1);w.fillRect(s.x+1|0,s.y-2|0,1,1)});
}
function extras(){
  if(flash>0){w.fillStyle=`rgba(230,235,255,${flash*.55})`;w.fillRect(0,0,W,H)}
  if(warm>0){const cx=(bx+gx)/2+4,cy=by-14,q=w.createRadialGradient(cx,cy,0,cx,cy,75);q.addColorStop(0,`rgba(255,170,90,${.45*warm})`);q.addColorStop(1,'rgba(255,170,90,0)');w.globalCompositeOperation='lighter';w.fillStyle=q;w.fillRect(0,0,W,H);w.globalCompositeOperation='source-over'}
  if(sun>.15&&!RM||sun>.15){w.globalCompositeOperation='lighter';flies.forEach(f=>{const a=sun*(.4+.6*Math.sin(time*2+f.p));w.fillStyle=`rgba(255,220,130,${a})`;w.fillRect(f.x+Math.sin(time*.7+f.p)*6|0,(f.y-(time*4+f.p*9)%H+H)%H|0,1,1)});w.globalCompositeOperation='source-over'}
}

/* ---------- ramen shop interior ---------- */
function steam(x,y){for(let k=0;k<5;k++){const p=(time*8+k*4)%16;G.globalAlpha=.55*(1-p/16);r(x+Math.sin(time*2+k*2)*3,y-p,2,2,0xffffff);}G.globalAlpha=1}
function interior(){
  G=w;MONO=false;S=1;const f=H*.75|0,cb=H*.58|0;
  r(0,0,W,H,0x5a3622);for(let x=0;x<W;x+=9)r(x,0,1,f,0x4a2b1a);r(0,f,W,H-f,0x2f1c10);r(0,f,W,2,0x7a4a2a);
  const wx=W*.6|0,wy=H*.14|0,ww=Math.min(54,W*.34)|0,wh=36;
  for(let y=0;y<wh;y+=3)r(wx,wy+y,ww,3,mix(0x7a3a8a,0xf5a65b,y/wh));
  r(wx+ww*.1,wy+wh-8,ww*.2,8,0x3a2a50);r(wx+ww*.45,wy+wh-12,ww*.25,12,0x4a2a50);
  for(let k=0;k<10;k++)r(wx+(k*7+time*20)%ww,wy+(k*13+time*40)%wh,1,3,0xcfd8f0);
  r(wx-2,wy-2,ww+4,2,0x2a1a10);r(wx-2,wy+wh,ww+4,2,0x2a1a10);r(wx-2,wy-2,2,wh+4,0x2a1a10);r(wx+ww,wy-2,2,wh+4,0x2a1a10);r(wx+ww/2,wy,1,wh,0x2a1a10);
  [.18,.5,.82].forEach(q=>{const lx=W*q+Math.sin(time+q*9)*1.5,y=H*.1;glow(lx,y,20,'255,70,50',.4);r(lx,0,1,y-4,0x111111);F(G,0xd92332,0xff3344,true);G.beginPath();G.arc(lx,y,5,0,7);G.fill()});
  const cw=W*.4|0;r(4,H*.32|0,cw-8,2,0x8a5a2a);[0xc04040,0x40a060,0xd0b040,0x4060c0].forEach((c,i)=>r(8+i*9,H*.32-8,4,8,c));
  r(0,cb,cw,f-cb+2,0x7a4a2a);r(0,cb,cw,3,0xa86a3a);
  const cx=cw*.5|0;r(cx-5,cb-14,10,14,0xf0f0f0);r(cx-3,cb-20,6,6,0xe0b890);r(cx-4,cb-27,8,7,0xffffff);r(cx-2,cb-18,1,1,0);r(cx+1,cb-18,1,1,0);
  r(cx+8,cb-6,10,6,0x333333);r(cx+9,cb-7,8,1,0xe0a050);steam(cx+13,cb-8);
  const tt=H*.68|0,tx=W*.42|0,tw=W*.5|0,b1=tx+tw*.22,b2=tx+tw*.62;
  [b1,b2].forEach(b=>{r(b-1,tt+9,10,2,0x3a2414);r(b+3,tt+11,2,f-tt-3,0x2a1a0e)});person(b1,tt+9,true,0,true);person(b2,tt+9,false,0,true);
  r(tx,tt,tw,3,0x9a6a3a);r(tx+4,tt+3,3,f-tt+8,0x6a4220);r(tx+tw-7,tt+3,3,f-tt+8,0x6a4220);
  [b1+10,b2-8].forEach(x=>{r(x,tt-3,7,3,0xf0e6d0);r(x+1,tt-4,5,1,0xe0a050);steam(x+3,tt-4)});
  for(let i=0;i<4;i++){r(W*.1+i*9,H*.17,6,13,0xe8dcc0);r(W*.1+i*9+2,H*.17+2,2,9,0xd92332)}for(let y=f+6;y<H;y+=6)r(0,y,W,1,0x24140a);r(cx-14,cb-3,6,3,0xf0e6d0);steam(cx-11,cb-4);r(cx+4,cb-12,5,2,0xe0b890);
  glow(W/2,H*.4,W*.5,'255,170,80',.18);
}

/* ---------- state machine ---------- */
const STAGE={title:0,walk:0,collide:1,umbrella:1,talk:2,ask:2,declined:2,response:3,transform:3,walkIn:4,interior:5};
function setState(s){st=s;T=0;once=0;document.querySelectorAll('#prog i').forEach((e,i)=>e.classList.toggle('on',i<=STAGE[s]&&s!=='title'))}
function update(dt){
  T+=dt;by=H*.83|0;walking=false;if(st!=='walk'){bx=W/2-10;gx=W/2+2}
  if(started&&!RM){bolt-=dt;if(bolt<0){bolt=rnd(6,12);flash=1;setTimeout(()=>sfx('thunder'),rnd(300,900))}flash=Math.max(0,flash-dt*2.2)}
  cat.next-=dt;if(!cat.on&&cat.next<0&&started){cat.on=1;cat.x=-10;cat.next=rnd(10,18)}if(cat.on){cat.x+=55*dt;if(cat.x>W+10)cat.on=0}
  if(st==='walk')moveCharacters();
  else if(st==='collide')triggerCollision();
  else if(st==='umbrella')openUmbrella();
  else if(st==='transform')transitionToColor();
  else if(st==='walkIn')enterRestaurant();
  else if(st==='interior'){fade=1-clamp(T/1.2);if(!once){once=1;say(L3,()=>{$('#endmsg').textContent='♥ see you next week ♥';$('#again').textContent='OUR STORY BEGINS ❤️';$('#end').hidden=false})}}
  const cx=(bx+gx)/2+4,cy=by-12;
  if(st==='interior'){cam.z=1;cam.x=W/2;cam.y=H/2}
  else if(st==='transform'){cam.z=lerp(1.45,1.1,sun);cam.x=lerp(cx,W/2,sun);cam.y=lerp(H*.62,H/2,sun)}
  else if(st==='walkIn'){const p=ease(clamp(T/5));cam.z=lerp(1.1,2.2,p);cam.x=W/2;cam.y=lerp(H/2,gy-14,p)}
  else{cam.z=1+.45*zoom;cam.x=lerp(W/2,cx,zoom);cam.y=lerp(H/2,H*.62,zoom)}
}
function moveCharacters(){const p=clamp(T/7);walking=true;bx=lerp(-14,W/2-10,p);gx=lerp(W+6,W/2+2,p);if(p>=1)setState('collide')}
function triggerCollision(){const p=clamp(T),k=RM?0:Math.sin(p*Math.PI)*3;bx=W/2-10-k;gx=W/2+2+k;if(!once){once=1;sfx('ui')}if(p>=1)setState('umbrella')}
function openUmbrella(){
  if(!once){once=1;sfx('umbrella')}umb=ease(clamp(T/.8));zoom=ease(clamp(T/4));warm=zoom;
  if(T>4){setState('talk');showDialogue(L1,()=>{$('#ask').hidden=false;setState('ask')})}
}
function transitionToColor(){const p=clamp(T/9);sun=ease(p);reveal=ease(clamp(p*1.25));rainK=1-.65*sun;rainLvl=lerp(1,.45,sun);if(p>=1)setState('walkIn')}
function enterRestaurant(){
  const p=clamp(T/5);walking=p<.6;bx=lerp(W/2-10,W/2-8,p);gx=lerp(W/2+2,W/2,p);by=lerp(by,H*.755,ease(p));
  door=ease(clamp((p-.1)/.3));pAlpha=1-clamp((p-.55)/.25);fade=clamp((p-.75)/.25);
  if(p>=1){setState('interior');rainLvl=.25;pAlpha=1}
}
function render(dt){
  if(st==='interior')interior();
  else{paintAura();world(w,true);world(c2,false);c2.globalCompositeOperation='destination-in';c2.drawImage(ac,0,0);c2.globalCompositeOperation='source-over';w.drawImage(cc,0,0);rain(dt);extras()}
  g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,W,H);
  g.save();g.translate(W/2,H/2);g.scale(cam.z,cam.z);g.translate(-cam.x,-cam.y);g.drawImage(wc,0,0);g.restore();
  g.fillStyle=vig;g.fillRect(0,0,W,H);
  if(fade>0){g.fillStyle=`rgba(0,0,0,${fade})`;g.fillRect(0,0,W,H)}
}

/* ---------- dialogue ---------- */
const L1=[{who:'Luka',t:'Hey.'},{who:'Mei',t:'Hey.'},{who:'Luka',t:'Sorry for bumping into you...'},{who:'Luka',dots:1},{who:'Luka',t:'Would you mind if I invited you on a date?',auto:1.4}];
const L3=[{who:'Luka',t:"I'm really happy you agreed to go on a date with me. ❤️"},{who:'Luka',t:'Our little adventure begins next week...'},{who:'Luka',t:"Let's make it a night to remember."}];
let dq=[],dcb=null,cur=null,typT=0,done=false,wait=0;
function showDialogue(q,cb){dq=q.slice();dcb=cb;nextLine()}
const say=showDialogue;
function nextLine(){
  if(!dq.length){cur=null;$('#dlg').hidden=true;const cb=dcb;dcb=null;cb&&cb();return}
  cur=dq.shift();typT=0;done=false;wait=0;$('#dlg').hidden=false;$('#tx').textContent='';$('#nx').hidden=true;
  const n=$('#nm');n.textContent=cur.who==='Mei'?'Mei':'Luka';n.className=cur.who==='Mei'?'girl':'';
}
function tickDialogue(dt){
  if(!cur)return;typT+=dt;
  if(cur.dots){$('#tx').textContent='.'.repeat(1+(time*2.5|0)%3);if(typT>2.6)nextLine();return}
  const ch=RM?999:typT*38|0;$('#tx').textContent=cur.t.slice(0,ch);
  if(ch>=cur.t.length){if(!done){done=true;if(!cur.auto)$('#nx').hidden=false;if(!RM&&st!=='interior')sfx('ui')}wait+=dt;if(cur.auto&&wait>cur.auto)nextLine()}
}
function tap(){if(!cur||cur.dots)return;if(!done)typT=1e3;else if(!cur.auto)nextLine()}
$('#dlg').addEventListener('click',tap);
addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&cur&&document.activeElement===document.body){e.preventDefault();tap()}});

/* ---------- yes / no ---------- */
const no=$('#no');let lastDodge=0;
function hearts(x,y){for(let i=0;i<14;i++){const h=document.createElement('span');h.className='h';h.textContent='♥';h.style.left=x+'px';h.style.top=y+'px';h.style.setProperty('--dx',rnd(-80,80)+'px');h.style.animationDelay=rnd(0,.2)+'s';document.body.append(h);setTimeout(()=>h.remove(),1500)}}
function handleYes(e){
  const b=e.currentTarget.getBoundingClientRect();hearts(b.left+b.width/2,b.top);sfx('yes');$('#ask').hidden=true;setState('response');
  showDialogue([{who:'Mei',t:'Hmm... worth a try...',auto:1.6}],()=>setState('transform'));
}
function dodge(){
  if(esc>=4||performance.now()-lastDodge<300)return false;lastDodge=performance.now();esc++;
  no.style.position='fixed';no.style.zIndex=15;
  no.style.left=rnd(10,Math.max(11,innerWidth-no.offsetWidth-10))+'px';no.style.top=rnd(10,Math.max(11,innerHeight-no.offsetHeight-70))+'px';
  no.classList.add('glitch');setTimeout(()=>no.classList.remove('glitch'),360);sfx('ui');
  if(esc>=4){setTimeout(()=>{no.style.position='';no.style.left=no.style.top='';no.textContent='No, thanks';},500)}
  return true;
}
function handleNo(){
  if(dodge())return;if(esc<4)return;
  $('#ask').hidden=true;setState('declined');
  showDialogue([{who:'Mei',t:'Thank you for asking... but maybe another time.'},{who:'Luka',t:'Totally okay. Take care out there.'}],()=>{$('#endmsg').textContent='the rain keeps falling...';$('#again').textContent='REPLAY';$('#end').hidden=false});
}
$('#yes').addEventListener('click',handleYes);
no.addEventListener('pointerdown',e=>{if(esc<4){e.preventDefault();dodge()}});
no.addEventListener('click',handleNo);
document.addEventListener('pointermove',e=>{if($('#ask').hidden||esc>=4)return;const b=no.getBoundingClientRect();if(Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2))<90)dodge()});

/* ---------- audio (files first, synthesized fallback) ---------- */
const au={};['music','rain','thunder','umbrella'].forEach(k=>{au[k]=$('#a-'+k)});
au.music.loop=au.rain.loop=true;
let AC,rainG,nbuf,musicOn=true,rainOn=true,vol=.6,mt=0,rg=0;
function audioInit(){
  if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();
    nbuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const s=AC.createBufferSource();s.buffer=nbuf;s.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=600;
    rainG=AC.createGain();rainG.gain.value=0;s.connect(lp).connect(hp).connect(rainG).connect(AC.destination);s.start()}catch(e){AC=null}
}
function tone(f,d,type='square',v=.08){if(!AC)return;const o=AC.createOscillator(),q=AC.createGain();o.type=type;o.frequency.value=f;q.gain.setValueAtTime(v*vol,AC.currentTime);q.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(q).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}
function burst(d,type,f,v){if(!AC)return;const s=AC.createBufferSource();s.buffer=nbuf;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;const q=AC.createGain();q.gain.setValueAtTime(v,AC.currentTime);q.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);s.connect(fl).connect(q).connect(AC.destination);s.start();s.stop(AC.currentTime+d)}
let lastThunder=0;
function sfx(n){
  const a=au[n];
  if(a&&!a.error&&a.readyState>2){if(n==='thunder'&&!a.paused)return;a.currentTime=0;a.volume=vol;a.play().catch(()=>{});return}
  if(n==='thunder'){if(performance.now()-lastThunder<2500)return;lastThunder=performance.now();burst(2.5,'lowpass',250,.9*vol)}
  else if(n==='umbrella'){burst(.3,'bandpass',1800,.3*vol);tone(180,.08,'square',.05)}
  else if(n==='yes'){tone(660,.1,'square',.07);setTimeout(()=>tone(990,.18,'square',.07),90)}
  else tone(440,.04,'square',.03);
}
function mixAudio(dt){
  const k=1-Math.pow(.02,dt);mt=lerp(mt,started&&musicOn?vol*(st==='interior'?.75:.55):0,k);au.music.volume=clamp(mt);
  rg=lerp(rg,started&&rainOn?vol*rainLvl:0,k);const ok=!au.rain.error&&au.rain.readyState>2;
  au.rain.volume=ok?clamp(rg):0;if(rainG)rainG.gain.value=ok?0:rg*.35;
}

/* ---------- start / restart / UI ---------- */
function startExperience(){
  audioInit();if(AC&&AC.state==='suspended')AC.resume();started=true;
  au.music.play().catch(()=>{});au.rain.play().catch(()=>{});
  $('#title').hidden=true;sfx('ui');setState('walk');
}
function restartExperience(){
  sun=warm=zoom=umb=reveal=fade=door=0;pAlpha=1;rainK=rainLvl=1;esc=0;cur=null;dq=[];dcb=null;
  a2.clearRect(0,0,W,H);['#dlg','#ask','#end'].forEach(s=>$(s).hidden=true);
  no.style.position='';no.style.left=no.style.top='';no.textContent='NO 💀';
  au.music.currentTime=0;$('#title').hidden=false;setState('title');
}
function skip(){if(['walk','collide','umbrella','transform','walkIn'].includes(st))T=1e9;else tap()}
$('#start').addEventListener('click',startExperience);
$('#again').addEventListener('click',()=>{restartExperience()});
$('#rs').addEventListener('click',restartExperience);
$('#skip').addEventListener('click',skip);
$('#mus').addEventListener('click',e=>{musicOn=!musicOn;e.currentTarget.textContent='♪ '+(musicOn?'on':'off');if(musicOn&&started)au.music.play().catch(()=>{})});
$('#rn').addEventListener('click',e=>{rainOn=!rainOn;e.currentTarget.textContent='☂ '+(rainOn?'on':'off')});
$('#vol').addEventListener('input',e=>{vol=+e.target.value});
addEventListener('resize',initializeScene);

/* ---------- main loop ---------- */
let last=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;time+=dt;update(dt);render(dt);tickDialogue(dt);mixAudio(dt)}
initializeScene();setState('title');requestAnimationFrame(loop);
addEventListener('load',()=>setTimeout(()=>{$('#load').classList.add('off');$('#start').disabled=false},700));
