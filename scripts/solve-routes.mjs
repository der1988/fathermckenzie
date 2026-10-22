import {createWorld,strike,stepWorld,clearWorld} from '../src/physics.js';
import {LEVELS,FLOOR} from '../src/level.js';
import {writeFileSync} from 'node:fs';
const solutions=[];
for(const [index,level] of LEVELS.entries()){
 let w=createWorld(level),shots=[];
 for(let attempt=0;attempt<16&&!w.won;attempt++){
  const target=level.seals[w.sealsCollected]??level.portal;
  let best=null;
  for(const facing of [1,-1])for(let angle=5;angle<=80;angle+=15)for(let frames=3;frames<=75;frames+=6){
   const c=structuredClone(w),core=c.parts.chest.position;
   // Only use standing positions on floor or a platform, within real striking range.
   let position=null;
   positions: for(const offset of [30,18,45,0])for(const y of [FLOOR,...level.platforms.map(p=>p.y)]){
    const x=core.x-facing*offset;
    if(x<20||x>1420)continue;
    if(y!==FLOOR&&!level.platforms.some(p=>p.y===y&&x>=p.x+9&&x<=p.x+p.width-9))continue;
    if(level.platforms.some(p=>x+9>p.x&&x-9<p.x+p.width&&y>p.y+.01&&y-45<p.y+p.height))continue;
    if(strike(c,x,facing,frames/75,y,angle)){position={x,y};break positions;}
   }
   if(!position){clearWorld(c);continue;}
   for(let t=0;t<360&&!c.won;t++)stepWorld(c);
   const next=level.seals[c.sealsCollected]??level.portal;
   const score=(c.won?1e7:0)+c.sealsCollected*10000-Math.hypot(c.parts.chest.position.x-next.x,c.parts.chest.position.y-next.y);
   if(!best||score>best.score){if(best)clearWorld(best.world);best={score,world:c,shot:{...position,facing,angle,frames}};}else clearWorld(c);
  }
  if(!best)break;
  clearWorld(w);w=best.world;shots.push(best.shot);
 }
 console.log(index+1,w.won,w.sealsCollected,shots.length,Math.round(w.parts.chest.position.x));
 if(!w.won)process.exitCode=1;
 solutions.push(shots);clearWorld(w);
}
writeFileSync('tests/route-solutions.json',JSON.stringify(solutions,null,2)+'\n');
