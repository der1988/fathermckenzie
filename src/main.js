import '@fontsource/barlow-condensed/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import './style.css';
import { PLATFORMS, CHARACTER_SCALE, createPriest, movePriest, jump } from './level.js';
import { createWorld, strike, stepWorld, clearWorld, FLOOR, PORTAL } from './physics.js';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = s => document.querySelector(s);
let world = createWorld(), started = false, strokes = 0, charge = 0, charging = false, swing = 0, shake = 0, flash = 0, time = 0;
let priest = createPriest();
let swingPower = 0, swingStart = 0;
let keys = new Set(), particles = [], trail = [], soundEnabled = false, audio;
const W = 960, H = 540;
const palette = { lime: '#dced97', bone: '#ddd8ad', darkBone: '#919779', orange: '#ef934e' };
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function text(str,x,y,color='#c7d0ad',size=10,align='left'){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillText(str,Math.round(x),Math.round(y));ctx.textAlign='left'}
function line(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.stroke()}
function noise(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function tone(freq,duration=.12,type='triangle',gain=.045){if(!soundEnabled)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq/3),audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
function burst(x,y,n,color){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*8,vy:-Math.random()*6,life:30+Math.random()*25,color})}
function reset(autoStart=true){clearWorld(world);world=createWorld();priest=createPriest();keys.clear();strokes=0;charge=0;charging=false;swing=0;particles=[];trail=[];started=autoStart;$('#strokes').textContent='00';$('#victory').hidden=true;$('#welcome').hidden=autoStart;$('#status').textContent=autoStart?'Avvicinati allo scheletro e carica il colpo.':'La tua parrocchia ti aspetta.';canvas.focus({preventScroll:true})}
function start(){started=true;$('#welcome').hidden=true;$('#status').textContent='Avvicinati allo scheletro e carica il colpo.';canvas.focus({preventScroll:true});tone(260)}
$('#play').onclick=start;$('#again').onclick=()=>reset();$('#reset').onclick=()=>reset();
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;$('#sound span').textContent=soundEnabled?'ON':'OFF';$('#sound').setAttribute('aria-pressed',String(soundEnabled));$('#sound').setAttribute('aria-label',soundEnabled?'Disattiva audio':'Attiva audio');tone(400)};
function backswingAngle(power){return -.45-2*Math.min(1,power/.25)-.3*power}
function release(){
 if(!charging)return;
 charging=false;swing=24;swingPower=charge;swingStart=backswingAngle(charge);charge=0;
}
function impact(){
 if(strike(world,priest.x,priest.facing,swingPower,priest.y)){
  strokes++;$('#strokes').textContent=String(strokes).padStart(2,'0');shake=7;flash=3;
  burst(world.parts.chest.position.x,world.parts.chest.position.y,20,palette.lime);tone(145,.22,'sawtooth');
  $('#status').textContent=swingPower>.8?'Una benedizione potente. Segui lo scheletro!':'Bel colpo. Salta sulle piattaforme e segui lo scheletro.';
 }else{tone(80,.08);$('#status').textContent='Troppo lontano! Avvicinati e guarda verso lo scheletro.'}
}
window.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyS'].includes(e.code))e.preventDefault();
 if(e.code==='KeyR'){reset();return}
 if(!started||world.won)return;
 if(e.code==='KeyA'&&!e.repeat&&swing===0){charging=true;charge=0}
 if(e.code==='KeyS'&&!e.repeat&&jump(priest))tone(210,.1);
 keys.add(e.code);
});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyA')release()});
window.addEventListener('blur',()=>{keys.clear();charging=false;charge=0});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();charging=false;charge=0}});
function background(){
 rect(0,0,W,H,'#202e2b');
 const gradient=ctx.createLinearGradient(0,0,0,442);gradient.addColorStop(0,'#1b2b2c');gradient.addColorStop(.7,'#34443a');gradient.addColorStop(1,'#4a5140');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,442);
 // Pixel moon, stars and drifting cloud bands.
 for(let i=0;i<65;i++){let x=noise(i)*960,y=noise(i+81)*270;rect(x,y,i%7===0?2:1,1,i%3===0?'#8c9980':'#566e62')}
 rect(637,53,46,40,'#a7b58b');rect(630,61,60,25,'#a7b58b');rect(641,48,37,49,'#a7b58b');rect(650,57,12,7,'#929f7b');rect(673,72,10,12,'#929f7b');rect(638,78,9,6,'#bdc79c');
 for(let i=0;i<9;i++){let x=((i*149+time*(i%2?.09:.05))%1150)-150;rect(x,110+i%4*26,110+i%3*28,6,'#35493f');rect(x+20,104+i%4*26,65,6,'#35493f')}
 // Far church and cemetery skyline.
 rect(76,218,128,149,'#23342e');rect(113,152,45,190,'#23342e');line([[108,153],[135,110],[163,153]],'#23342e',9);rect(133,86,5,32,'#23342e');rect(122,96,27,5,'#23342e');rect(123,177,20,42,'#38473a');rect(131,177,4,42,'#23342e');rect(121,194,24,4,'#23342e');
 for(let i=0;i<10;i++){const x=i*114-15;rect(x,329-noise(i)*25,37,75,'#2a3b31');rect(x+5,321-noise(i)*25,27,8,'#2a3b31')}
 // Wrought iron fence.
 rect(0,361,960,3,'#26372d');rect(0,393,960,3,'#26372d');for(let x=8;x<960;x+=23){rect(x,343,3,83,'#24372d');line([[x-3,348],[x+1,337],[x+5,348]],'#24372d',2)}
 // Bare trees at both edges.
 for(const [x,s] of [[36,1],[730,.7],[938,1]]){ctx.save();ctx.translate(x,432);ctx.scale(s,s);line([[0,0],[9,-92],[0,-173],[9,-245]],'#1b3029',10);line([[6,-103],[-25,-155],[-58,-164],[-75,-198]],'#1b3029',6);line([[3,-160],[35,-193],[44,-238]],'#1b3029',6);line([[-22,-150],[-23,-202],[-38,-227]],'#1b3029',4);line([[31,-190],[73,-207],[80,-227]],'#1b3029',4);ctx.restore()}
 for(const [x,y] of [[71,414],[413,413],[634,420]]){rect(x,y-34,24,35,'#4d5946');rect(x+5,y-40,14,6,'#4d5946');rect(x+10,y-30,4,20,'#2f3f32');rect(x+5,y-24,14,4,'#2f3f32');rect(x-4,y,33,5,'#566246')}
 // Ground, roots, stones and moss.
 rect(0,FLOOR,960,98,'#20291f');rect(0,FLOOR,960,5,'#788151');rect(0,FLOOR+5,960,8,'#4b5937');rect(0,FLOOR+13,960,13,'#303e2a');
 for(let i=0;i<170;i++){let x=noise(i+501)*960,y=461+noise(i+907)*78;rect(x,y,3+Math.floor(noise(i)*7),2,i%3?'#34402b':'#404831')}
 for(let i=0;i<130;i++){let x=noise(i+60)*960;rect(x,437-noise(i+350)*7,2,7+noise(i+350)*7,i%3?'#69784a':'#87915b')}
 line([[0,488],[120,488],[147,507],[319,507],[339,492],[448,492]],'#3a422b',2);line([[592,480],[702,480],[729,500],[960,500]],'#3a422b',2);
 // Starting cross and distance markers.
 rect(117,389,4,50,'#8c9970');rect(107,400,24,4,'#8c9970');rect(119,390,34,16,'#cbd496');text('START',122,401,'#36402c',7);
 for(const [x,l] of [[390,'10 YD'],[565,'20 YD'],[740,'30 YD']]){rect(x,430,2,11,'#a6af78');text(l,x,471,'#778361',7,'center')}
}
function portal(){const {x,y}=PORTAL;const glow=ctx.createRadialGradient(x,y,10,x,y,112);glow.addColorStop(0,'#e88e4544');glow.addColorStop(1,'#e88e4500');ctx.fillStyle=glow;ctx.fillRect(x-115,y-115,230,175);
 // Stepped stone arch.
 rect(x-35,350,9,92,'#656a50');rect(x+27,350,9,92,'#656a50');rect(x-28,332,9,23,'#77775a');rect(x+20,332,9,23,'#77775a');rect(x-20,321,40,12,'#74765a');rect(x-13,314,26,9,'#858060');
 rect(x-26,351,53,91,'#321e22');rect(x-19,333,39,105,'#3b2125');rect(x-11,328,23,110,'#3b2125');
 for(let i=0;i<8;i++){const w=39-i*4;let yy=346+i*10;line([[x-w/2,432],[x-w/2,yy],[x,yy-12],[x+w/2,yy],[x+w/2,432]],i%2?'#78412e':'#aa5430',2)}
 for(let i=0;i<18;i++){let py=436-((time*.65+i*11)%95),px=x+Math.sin(i*9+time*.04)*22;rect(px,py,2,3,i%3?'#ed9750':'#ffca71')}
 for(let i=0;i<4;i++){rect(x-35,360+i*21,9,2,'#333c2e');rect(x+27,360+i*21,9,2,'#333c2e')}
 rect(x-12,307,24,5,'#c99c5d');text('INFERNO',x,282,'#edb473',12,'center');text('SOLO ANDATA',x,295,'#ae9a6d',7,'center');
 const bob=Math.round(Math.sin(time*.07)*3);arrow(x-70+bob,379,1);arrow(x+70-bob,379,-1);ctx.save();ctx.translate(x,305+bob);ctx.rotate(Math.PI/2);arrow(0,0,1);ctx.restore();rect(x-41,438,84,5,'#858160');
}
function arrow(x,y,dir){line([[x-dir*15,y],[x+dir*5,y]],'#ecc174',3);line([[x-dir*2,y-7],[x+dir*6,y],[x-dir*2,y+7]],'#ecc174',3)}
function drawPlatforms(){
 for(const p of PLATFORMS){
  rect(p.x+3,p.y+6,p.width,18,'#16271f');
  rect(p.x,p.y,p.width,p.height,'#586047');rect(p.x,p.y,p.width,4,'#9aa36a');
  rect(p.x,p.y+4,p.width,3,'#727f50');rect(p.x,p.y+p.height-3,p.width,3,'#303e2c');
  for(let x= p.x+18;x<p.x+p.width;x+=24){rect(x,p.y+8,2,7,'#344530');rect(x-9,p.y+8,10,1,'#778061')}
  for(let i=0;i<6;i++){let x=p.x+8+i*17;rect(x,p.y-3,2,4,'#8b995e');if(i%2===0){rect(x,p.y+18,2,14,'#536a3f');rect(x-3,p.y+23,6,2,'#667c47')}}
 }
}
function drawPriest(){
 const {x,y,facing,walking,grounded,gait,landing}=priest;
 const walk=walking&&grounded?Math.sin(gait):0;
 const bob=walking&&grounded?Math.abs(Math.cos(gait))*1.8:Math.sin(time*.045)*.55;
 const crouch=landing>0?Math.sin(landing/9*Math.PI)*4:charging?charge*3:0;
 const progress=(24-swing)/24;
 let batAngle=-.45;
 if(charging)batAngle=backswingAngle(charge);
 else if(swing>0){
  if(progress<.38){const t=progress/.38;batAngle=swingStart+(.65-swingStart)*t*t;}
  else {const t=(progress-.38)/.62;batAngle=.65+(-.45-.65)*(t*t*(3-2*t));}
 }
 const lean=charging?-charge*.14:swing>0?Math.sin(progress*Math.PI)*.2:walking?.06:0;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing*CHARACTER_SCALE,CHARACTER_SCALE);
 if(grounded)rect(-17,0,36,2,'#18231a');
 // Alternating articulated legs and lifted feet; tuck the knees while airborne.
 for(const side of [-1,1]){
  const stride=grounded?walk*side:side*.7;
  const kneeX=side*6+stride*6,footX=side*6+stride*10;
  const footY=grounded?-2-Math.max(0,-stride)*5:-6+(priest.vy<0?-4:0);
  line([[side*6,-23],[kneeX,-13],[footX,footY-2]],side<0?'#18252a':'#2c3838',6);
  rect(footX-3,footY-3,11,5,'#0e1517');
 }
 ctx.save();ctx.translate(0,crouch-bob);ctx.rotate(lean);
 // Robe flares with the stride, jump and backswing.
 const hem=walking?walk*3:!grounded?-priest.vy*.35:Math.sin(time*.04);
 ctx.fillStyle='#131c22';ctx.beginPath();ctx.moveTo(-12,-43);ctx.lineTo(12,-43);ctx.lineTo(17+hem,-13);ctx.lineTo(-17+hem,-13);ctx.closePath();ctx.fill();
 line([[-7,-37],[-8+hem,-16]],'#2c363b',3);line([[8,-37],[11+hem,-16]],'#080f16',3);
 rect(-12,-43,24,9,'#19242a');line([[0,-39],[hem,-16]],'#505246',1);
 // Head nods into the strike, with a white clerical collar and swinging cross.
 ctx.save();ctx.translate(0,-44);ctx.rotate(swing>0?Math.sin(progress*Math.PI)*.12:walk*.025);
 rect(-8,-20,17,19,'#c1a485');rect(-9,-21,18,6,'#32312d');rect(-10,-17,5,15,'#32312d');rect(8,-12,5,5,'#c1a485');rect(5,-13,3,3,'#27302c');rect(-4,-5,13,4,'#978570');rect(-3,-1,9,4,'#e4dfc6');ctx.restore();
 const crossX=3+Math.round(walk*2+(charging?-charge*2:0));rect(crossX,-34,2,12,'#d9bb68');rect(crossX-4,-31,10,2,'#d9bb68');
 // Both arms follow the grip. A full charge places the club behind the head.
 const handX=6+Math.cos(batAngle)*17,handY=-37+Math.sin(batAngle)*17;
 line([[-8,-39],[handX-8,-30],[handX,handY]],'#354044',6);
 line([[9,-39],[handX+1,-31],[handX+3,handY]],'#263237',7);
 ctx.save();ctx.translate(handX,handY);ctx.rotate(batAngle);
 rect(-3,-3,7,6,'#c1a485');rect(3,-2,19,4,'#956737');rect(20,-5,24,9,'#b28a4a');rect(21,-5,22,3,'#c3a362');rect(25,2,16,2,'#704e2b');
 ctx.restore();
 if(swing>0&&progress>.2&&progress<.48){ctx.strokeStyle='#e4dda580';ctx.lineWidth=3;ctx.beginPath();ctx.arc(6,-37,51,batAngle-.55,batAngle);ctx.stroke()}
 ctx.restore();ctx.restore();
 if(charging){rect(x-23,y-66,46,7,'#19221b');rect(x-21,y-64,Math.round(42*charge),3,charge>.85?'#eda35f':palette.lime);text(`${Math.round(charge*100)}%`,x,y-72,palette.lime,8,'center')}
 if(started&&!world.hit)text('PADRE McKENZIE',x,y+19,'#c4cda6',7,'center');
}
function drawSkeleton(){for(const [name,b] of Object.entries(world.parts)){ctx.save();ctx.translate(Math.round(b.position.x),Math.round(b.position.y));ctx.rotate(b.angle);ctx.scale(CHARACTER_SCALE,CHARACTER_SCALE);if(name==='head'){rect(-9,-10,18,17,palette.bone);rect(-6,7,12,4,palette.bone);rect(-7,-5,5,5,'#2b3028');rect(3,-5,5,5,'#2b3028');rect(0,1,2,3,'#646b52');for(let i=-4;i<6;i+=3)rect(i,6,1,4,'#6a7056')}else if(name==='chest'){rect(-2,-12,4,25,palette.darkBone);for(let i=0;i<4;i++){rect(-9,-10+i*6,18,3,palette.bone);rect(-9,-10+i*6,3,5,palette.bone);rect(6,-10+i*6,3,5,palette.bone)}}else if(name==='hip'){rect(-8,-4,16,4,palette.bone);rect(-8,-1,5,6,palette.bone);rect(3,-1,5,6,palette.bone)}else{rect(-2,-12,4,25,palette.bone);rect(-4,-12,8,4,palette.bone);rect(-3,8,7,4,palette.darkBone)}ctx.restore()}
 if(!world.hit){text('IL PECCATORE',283,369,'#c6cba6',7,'center');rect(281,374,3,3,'#c6cba6')}
}
function update(){time++;if(started&&!world.won){const axis=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);movePriest(priest,axis,charging);if(swing===16)impact();if(charging)charge=Math.min(1,charge+1/75);stepWorld(world);if(world.hit&&time%3===0){trail.push({...world.parts.chest.position,life:25});if(time%6===0&&world.parts.chest.speed>4)burst(world.parts.chest.position.x,world.parts.chest.position.y,1,'#a9b884')}
 if(world.won){charging=false;charge=0;burst(PORTAL.x,PORTAL.y,75,palette.orange);tone(600,.7,'triangle');$('#victory').hidden=false;$('#result').textContent=strokes===1?'Un colpo. Un’anima. Un miracolo discutibile.':`${strokes} colpi per la salvezza. Più o meno.`;$('#status').textContent='Missione compiuta. Lo scheletro è all’inferno.'}}
 if(swing>0)swing--;shake*=.82;if(flash>0)flash--;particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life--});particles=particles.filter(p=>p.life>0);trail.forEach(p=>p.life--);trail=trail.filter(p=>p.life>0);
}
function draw(){ctx.save();if(shake>.2)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);background();drawPlatforms();portal();for(const p of trail){ctx.globalAlpha=p.life/100;rect(p.x-2,p.y-2,4,4,palette.lime)}ctx.globalAlpha=1;if(!world.won)drawSkeleton();drawPriest();for(const p of particles){ctx.globalAlpha=Math.min(1,p.life/20);rect(p.x,p.y,3,3,p.color)}ctx.globalAlpha=1;if(flash){ctx.fillStyle='#edecad18';ctx.fillRect(0,0,W,H)}
 // Vignette with crisp scanlines for a quiet CRT feel.
 const v=ctx.createRadialGradient(480,300,170,480,280,580);v.addColorStop(0,'#0000');v.addColorStop(1,'#07130e66');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);ctx.globalAlpha=.045;for(let y=0;y<H;y+=3)rect(0,y,W,1,'#000');ctx.globalAlpha=1;ctx.restore()}
let previous=performance.now(),accumulator=0;function frame(now){accumulator+=Math.min(now-previous,100);previous=now;while(accumulator>=1000/60){update();accumulator-=1000/60}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
