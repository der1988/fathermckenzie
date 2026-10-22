import test from 'node:test';
import assert from 'node:assert/strict';
import {createPriest,movePriest,jump,LEVELS} from '../src/level.js';
import {readFileSync} from 'node:fs';
const shots=JSON.parse(readFileSync(new URL('./route-solutions.json',import.meta.url)));
for(const [i,l] of LEVELS.entries())test(`route ${i+1}: priest can walk and jump between every shot position`,()=>{
 let start=createPriest(l);
 for(const [j,target] of shots[i].entries()){
 const q=[start],seen=new Set();let found=null;
 for(let n=0;n<q.length&&n<150000;n++){
 const p=q[n];if(Math.abs(p.x-target.x)<9&&Math.abs(p.y-target.y)<1&&p.grounded){found=p;break;}
 for(const axis of [-1,0,1])for(const up of [false,true]){
 if(up&&!p.grounded)continue;
 const c={...p};if(up)jump(c);for(let t=0;t<5;t++)movePriest(c,axis,false,l.platforms);
 const key=[Math.round(c.x/4),Math.round(c.y/4),Math.round(c.vy),c.grounded].join(',');
 if(!seen.has(key)){seen.add(key);q.push(c);}
 }
 }
 assert.ok(found,`Cannot reach shot ${j+1} at ${target.x}, ${target.y}`);
 start=found;
 }
});
