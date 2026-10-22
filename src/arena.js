export const FLOOR=442, WIDTH=960, CENTER=480;
export const TYPES={
 skeleton:{name:'Scheletro',speed:48,threshold:.35,recovery:.65,color:'#ddd8bc'},
 zombie:{name:'Zombie',speed:30,threshold:.5,recovery:1.4,color:'#91a579'},
 monster:{name:'Mostro',speed:38,threshold:.65,recovery:.35,color:'#bd837b'},
};
export function createArena(){return {enemies:[],elapsed:0,spawnIn:1,nextId:0,score:0,explosions:0,lives:5,invulnerable:0,over:false,events:[]};}
export function spawnEnemy(game,type,side){
 const enemy={id:game.nextId++,type,x:side<0?-25:WIDTH+25,y:FLOOR,vx:0,vy:0,rotation:0,state:'approach',stun:0,age:0};
 game.enemies.push(enemy);return enemy;
}
export function hitEnemy(game,facing,power){
 if(game.over)return null;
 power=Math.max(0,Math.min(1,power));
 const enemy=game.enemies.filter(e=>e.state!=='dead'&&e.state!=='flight'&&(e.x-CENTER)*facing>=-8&&Math.abs(e.x-CENTER)<=105&&Math.abs(e.y-FLOOR)<70).sort((a,b)=>Math.abs(a.x-CENTER)-Math.abs(b.x-CENTER))[0];
 if(!enemy)return null;
 const config=TYPES[enemy.type];
 if(power>=1){enemy.state='dead';game.explosions++;game.events.push({type:'explode',x:enemy.x,y:enemy.y-25,color:config.color});return 'explode';}
 if(power>=config.threshold){enemy.state='flight';enemy.vx=facing*(650+power*350);enemy.vy=-230-power*150;game.events.push({type:'launch',x:enemy.x,y:enemy.y-25});return 'launch';}
 enemy.state='stunned';enemy.vx=facing*(110+power*260);enemy.vy=-65;enemy.stun=config.recovery;game.events.push({type:'push',x:enemy.x,y:enemy.y-25});return 'push';
}
export function stepArena(game,dt=1/60,rng=Math.random){
 if(game.over)return;
 game.elapsed+=dt;game.invulnerable=Math.max(0,game.invulnerable-dt);game.spawnIn-=dt;
 if(game.spawnIn<=0){
  const wave=Math.floor(game.elapsed/20);
  for(let i=0;i<1+Math.floor(wave/4);i++){
   const r=rng();const type=game.elapsed<20?'skeleton':game.elapsed<45?(r<.5?'skeleton':'zombie'):(r<.35?'skeleton':r<.7?'zombie':'monster');
   spawnEnemy(game,type,rng()<.5?-1:1);
  }
  game.spawnIn+=Math.max(.25,2.8*Math.pow(.85,wave));
 }
 for(const e of game.enemies){
  const config=TYPES[e.type];e.age+=dt;
  if(e.state==='dead')continue;
  if(e.state==='flight'){
   e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=420*dt;e.rotation+=Math.sign(e.vx)*dt*9;
   if(e.y>FLOOR){e.y=FLOOR;e.vy=-Math.abs(e.vy)*.4;}
   if(e.x<-55||e.x>WIDTH+55){e.state='dead';game.score++;game.events.push({type:'score',x:e.x<0?55:WIDTH-55,y:290});}
  }else if(e.state==='stunned'){
   e.x+=e.vx*dt;e.vx*=Math.exp(-5*dt);e.y=Math.min(FLOOR,e.y+e.vy*dt);e.vy+=420*dt;e.stun-=dt;
   if(e.stun<=0){e.state='approach';e.y=FLOOR;}
  }else{
   // Skeletons hurry steadily; zombies stagger; monsters telegraph then rush.
   const rhythm=e.type==='zombie'?.65+.35*Math.sin(e.age*5)**2:e.type==='monster'?(e.age%3<2.2?.55:3.1):1;
   const direction=Math.sign(CENTER-e.x);
   e.x+=direction*config.speed*(1+game.elapsed/240)*rhythm*dt;
   if(Math.abs(e.x-CENTER)<24){
    if(game.invulnerable===0){game.lives--;game.invulnerable=1.1;game.events.push({type:'hurt',x:CENTER,y:FLOOR-30});}
    e.state='stunned';e.vx=-direction*190;e.vy=-50;e.stun=.7;
    if(game.lives<=0){game.over=true;break;}
   }
  }
 }
 game.enemies=game.enemies.filter(e=>e.state!=='dead');
}
