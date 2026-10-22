import '@fontsource/barlow-condensed/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import './style.css';
import {createArena,stepArena,hitEnemy,TYPES,FLOOR,CENTER,PLAYER_MIN,PLAYER_MAX,EXPLOSION_POWER,movePlayer} from './arena.js';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
const W=960,H=540,CHARACTER_SCALE=1;
const palette={lime:'#dced97',orange:'#ef934e'};
let game=createArena(),started=false,hasRun=false,charge=0,charging=false,swing=0,swingPower=0,swingStart=0,swingFacing=1;
let shake=0,flash=0,time=0,particles=[],labels=[],soundEnabled=false,audio;
let priest={x:CENTER,y:FLOOR,facing:1,walking:false,grounded:true,gait:0,landing:0,vy:0};
const moveKeys=new Set();
let best=0;try{best=Number(localStorage.getItem('father-arena-best'))||0}catch{}
function refreshHUD(){
 $('#score').textContent=String(game.score).padStart(2,'0');$('#lives').textContent='✝'.repeat(Math.max(0,game.lives));
 $('#wave').textContent=`ORDA ${1+Math.floor(game.elapsed/20)} · ${Math.floor(game.elapsed)}s`;
 $('#best').textContent=best;$('#explosions').textContent=game.explosions;
 $('#power-fill').style.width=`${charge*100}%`;$('#power-fill').style.background=charge>=EXPLOSION_POWER?'#df7264':'#dced97';
 $('#power-label').textContent=charging?`${Math.round(charge*100)}% · ${charge>=EXPLOSION_POWER?'ESPLOSIONE · 0 PUNTI':charge>=.65?'FUORICAMPO PER TUTTI':charge>=.5?'FUORICAMPO SCHELETRI / ZOMBIE':charge>=.35?'FUORICAMPO SCHELETRI':'RESPINTA'}`:'TIENI A O SPAZIO · RILASCIA PER COLPIRE';
}
function cancelCharge(){charging=false;charge=0;chargeKey=null;}
function start(){game=createArena();started=true;hasRun=true;cancelCharge();swing=0;particles=[];labels=[];priest.facing=1;priest.x=CENTER;priest.walking=false;moveKeys.clear();$('#welcome').hidden=true;$('#victory').hidden=true;$('#status').textContent='La messa è finita. L’assedio no.';refreshHUD();canvas.focus({preventScroll:true});}
function openMenu(){started=false;moveKeys.clear();priest.walking=false;cancelCharge();$('#welcome').hidden=false;$('#victory').hidden=true;$('#resume').hidden=!hasRun||game.over;refreshHUD();}
function resume(){if(!hasRun||game.over)return;started=true;$('#welcome').hidden=true;canvas.focus({preventScroll:true});}
$('#play').onclick=start;$('#again').onclick=start;$('#resume').onclick=resume;$('#menu').onclick=openMenu;$('#reset').onclick=start;
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;$('#sound span').textContent=soundEnabled?'ON':'OFF';$('#sound').setAttribute('aria-pressed',String(soundEnabled));tone(400)};
function backswingAngle(power){return -.45-2*Math.min(1,power/.25)-.3*power;}
let chargeKey=null;
function beginCharge(key){if(!started||game.over||swing>0||charging)return;chargeKey=key;charging=true;charge=0;}
function release(){if(!charging)return;charging=false;chargeKey=null;swing=24;swingPower=charge;swingFacing=priest.facing;swingStart=backswingAngle(charge);charge=0;}
function turn(direction){if(swing===0)priest.facing=direction;}
window.addEventListener('keydown',e=>{
 const controls=['ArrowLeft','ArrowRight','KeyA','Space'];
 if(controls.includes(e.code)&&e.target.tagName==='BUTTON')return;
 if(controls.includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(e.code==='Escape'){if(started)openMenu();else resume();return;}
 if(!started||game.over)return;
 if(e.code==='KeyR'){start();return;}
 if(e.code==='ArrowLeft'){moveKeys.add('left-key');turn(-1)}if(e.code==='ArrowRight'){moveKeys.add('right-key');turn(1)}
 if(e.code==='KeyA'||e.code==='Space')beginCharge(e.code);
});
window.addEventListener('keyup',e=>{if(e.code==='ArrowLeft')moveKeys.delete('left-key');if(e.code==='ArrowRight')moveKeys.delete('right-key');if(e.code===chargeKey)release()});
window.addEventListener('blur',()=>{if(started&&!game.over)openMenu()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!game.over)openMenu()});
for(const [id,dir] of [['left',-1],['right',1]]){
 const button=$('#'+id);
 button.onclick=()=>{turn(dir);canvas.focus({preventScroll:true})};
 button.onpointerdown=e=>{e.preventDefault();if(!started||game.over)return;button.setPointerCapture(e.pointerId);moveKeys.add(id+'-touch');turn(dir)};
 const stop=()=>moveKeys.delete(id+'-touch');button.onpointerup=stop;button.onpointercancel=stop;button.onlostpointercapture=stop;
}
$('#bat').onpointerdown=e=>{e.preventDefault();$('#bat').setPointerCapture(e.pointerId);beginCharge('pointer')};
$('#bat').onpointerup=()=>{if(chargeKey==='pointer')release()};$('#bat').onpointercancel=cancelCharge;
function update(){
 if(started&&!game.over){
  const axis=(moveKeys.has('right-key')||moveKeys.has('right-touch')?1:0)-(moveKeys.has('left-key')||moveKeys.has('left-touch')?1:0);
  const oldX=game.playerX;movePlayer(game,axis);priest.x=game.playerX;priest.walking=oldX!==priest.x;if(priest.walking)priest.gait+=.24;if(axis)turn(axis);
  time++;if(charging)charge=Math.min(1,charge+1/60);
  if(swing===16){const hit=hitEnemy(game,swingFacing,swingPower);if(!hit){$('#status').textContent='Aria benedetta. Aspetta che siano a portata.';tone(80,.08)}}
  if(swing>0)swing--;
  stepArena(game);
  for(const event of game.events){
   if(event.type==='explode'){burst(event.x,event.y,45,event.color);labels.push({...event,label:'POLVERE ALLA POLVERE · +0',life:80});shake=8;tone(75,.25,'sawtooth');$('#status').textContent='Cremazione istantanea. Punti: zero. Fattura: salata.';}
   if(event.type==='score'){labels.push({...event,label:'FUORICAMPO +1',life:90});tone(550,.2);$('#status').textContent='Un’anima fuori parrocchia. +1';}
   if(event.type==='launch'||event.type==='push'){burst(event.x,event.y,8,palette.lime);shake=3;tone(145,.15,'triangle');}
   if(event.type==='hurt'){shake=10;flash=7;tone(65,.3,'sawtooth');$('#status').textContent='Il gregge morde. Gira la mazza dall’altra parte!';}
  }game.events=[];
  if(game.score>best){best=game.score;try{localStorage.setItem('father-arena-best',String(best))}catch{}}
  if(game.over){started=false;cancelCharge();$('#victory').hidden=false;$('#result').textContent=`${game.score} fuoricampo · ${game.explosions} esplosioni senza punti · ${Math.floor(game.elapsed)} secondi sopravvissuti.`;}
  refreshHUD();
 }
 if(started||game.over){particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life--});particles=particles.filter(p=>p.life>0);labels.forEach(p=>{p.y-=.35;p.life--});labels=labels.filter(p=>p.life>0);shake*=.82;if(flash>0)flash--;}
}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function text(str,x,y,color='#c7d0ad',size=10,align='left'){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillText(str,Math.round(x),Math.round(y));ctx.textAlign='left'}
function line(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.stroke()}
function noise(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function tone(freq,duration=.12,type='triangle',gain=.045){if(!soundEnabled)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq/3),audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
function burst(x,y,n,color){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*8,vy:-Math.random()*6,life:30+Math.random()*25,color})}
function background(){
 rect(0,0,W,H,'#202e2b');
 const gradient=ctx.createLinearGradient(0,0,0,442);gradient.addColorStop(0,'#1b2b2c');gradient.addColorStop(.7,'#34443a');gradient.addColorStop(1,'#4a5140');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,442);
 // Pixel moon, stars and drifting cloud bands.
 for(let i=0;i<65;i++){let x=noise(i)*960,y=noise(i+81)*270;rect(x,y,i%7===0?2:1,1,i%3===0?'#8c9980':'#566e62')}
 rect(637,53,46,40,'#a7b58b');rect(630,61,60,25,'#a7b58b');rect(641,48,37,49,'#a7b58b');rect(650,57,12,7,'#929f7b');rect(673,72,10,12,'#929f7b');rect(638,78,9,6,'#bdc79c');
 for(let i=0;i<9;i++){let x=((i*149+time*(i%2?.09:.05))%1150)-150;rect(x,110+i%4*26,110+i%3*28,6,'#35493f');rect(x+20,104+i%4*26,65,6,'#35493f')}
 // Central parish church: stepped stone facade, bell tower and warm windows.
 rect(354,226,252,175,'#293b34');rect(366,235,228,166,'#34463b');
 for(let i=0;i<7;i++)rect(350+i*17,226-i*12,260-i*34,12,'#23352f');
 rect(451,127,58,133,'#2d4037');rect(445,123,70,12,'#52604b');
 for(let i=0;i<5;i++)rect(447+i*7,123-i*12,66-i*14,12,'#23352f');
 rect(478,42,5,37,'#9ca47b');rect(467,52,27,5,'#9ca47b');
 rect(465,146,30,45,'#172a27');rect(471,153,18,25,'#a28c55');rect(468,176,24,5,'#bc9f60');
 rect(476,142,5,36,'#3e4e3e');
 for(const x of [390,548]){rect(x,274,23,49,'#192d27');rect(x+4,280,15,37,'#bd965854');rect(x+10,277,3,43,'#536049');rect(x+3,296,17,3,'#536049');}
 rect(455,329,50,72,'#172823');rect(461,320,38,12,'#172823');rect(479,331,2,70,'#576149');
 for(let y=246;y<394;y+=23)for(let x=372;x<591;x+=37)rect(x+(y%2?12:0),y,16,1,'#57604b40');
 rect(346,401,268,8,'#58634c');rect(338,409,284,7,'#3c4c3c');
 text('SAN NESSUNO',480,250,'#9aab7e',10,'center');
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
 if(charging){rect(x-23,y-66,46,7,'#19221b');rect(x-21,y-64,Math.round(42*charge),3,charge>=EXPLOSION_POWER?'#ed6660':charge>=.35?'#dced97':'#a0b6bb');text(`${Math.round(charge*100)}%`,x,y-72,palette.lime,8,'center')}
 if(started)text('PADRE McKENZIE',x,y+19,'#c4cda6',7,'center');
}
function drawEnemy(e){
 const c=TYPES[e.type].color,walk=Math.sin(e.age*(e.type==='zombie'?5:9))*5;
 ctx.save();ctx.translate(e.x,e.y-28);ctx.rotate(e.rotation);ctx.scale(e.type==='monster'?1.35:1,e.type==='monster'?1.25:1);
 if(e.type==='skeleton'){
  rect(-9,-28,18,16,c);rect(-6,-12,12,4,c);rect(-6,-24,4,5,'#253228');rect(3,-24,4,5,'#253228');
  line([[0,-7],[0,12]],'#949a7f',3);for(let i=0;i<4;i++)rect(-8,-6+i*5,16,2,c);
  line([[-7,-5],[-15,8+walk]],c,3);line([[7,-5],[15,8-walk]],c,3);
 }else{
  rect(-11,-30,22,20,c);rect(-13,-11,26,26,e.type==='zombie'?'#596a50':'#754f50');
  rect(-7,-25,4,4,'#e9bf71');rect(4,-25,4,4,'#e9bf71');rect(-5,-16,12,3,'#292823');
  line([[-12,-6],[-22,1+walk]],c,7);line([[12,-6],[22,1-walk]],c,7);
  if(e.type==='monster'){line([[-9,-28],[-15,-40],[-5,-32]],'#dac6a0',4);line([[9,-28],[15,-40],[5,-32]],'#dac6a0',4);if(e.state==='approach'&&e.age%3>2)text('!',0,-47,'#ef934e',17,'center');}
  else{rect(-11,-30,13,5,'#414d39');rect(3,-11,4,14,c);}
 }
 line([[-5,12],[-8-walk,26]],c,e.type==='skeleton'?3:6);line([[5,12],[8+walk,26]],c,e.type==='skeleton'?3:6);
 ctx.restore();
}
function draw(){
 ctx.save();if(shake>.2)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);background();
 // The dotted semicircles show bat reach, not a predicted shot.
 ctx.strokeStyle='#dced9730';ctx.setLineDash([3,7]);ctx.beginPath();ctx.ellipse(priest.x,FLOOR,105,22,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 line([[PLAYER_MIN,FLOOR+7],[PLAYER_MIN,FLOOR+19]],'#b2c780',2);line([[PLAYER_MAX,FLOOR+7],[PLAYER_MAX,FLOOR+19]],'#b2c780',2);
 text('← FUORICAMPO +1',110,320,'#b3bd91',10,'center');text('FUORICAMPO +1 →',850,320,'#b3bd91',10,'center');
 for(const e of game.enemies)drawEnemy(e);
 ctx.globalAlpha=game.invulnerable>0&&Math.floor(time/5)%2?.35:1;drawPriest();ctx.globalAlpha=1;
 text(priest.facing<0?'◀ COLPISCI A SINISTRA':'COLPISCI A DESTRA ▶',CENTER,490,'#dced97',11,'center');
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life/20);rect(p.x,p.y,3,3,p.color)}ctx.globalAlpha=1;
 for(const p of labels)text(p.label,Math.max(150,Math.min(810,p.x)),p.y,'#efce85',12,'center');
 if(flash){ctx.fillStyle='#e26b5428';ctx.fillRect(0,0,W,H)}
 const v=ctx.createRadialGradient(480,300,170,480,280,580);v.addColorStop(0,'#0000');v.addColorStop(1,'#07130e66');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.045;for(let y=0;y<H;y+=3)rect(0,y,W,1,'#000');ctx.globalAlpha=1;ctx.restore();
}
refreshHUD();let previous=performance.now(),accumulator=0;
function frame(now){accumulator+=Math.min(now-previous,100);previous=now;while(accumulator>=1000/60){update();accumulator-=1000/60}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
