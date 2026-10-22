import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as arena from '../src/arena.js';
import {createAudio} from '../src/audio.js';
function interfaceFixture(){
 const elements=new Map(),events={};
 const gradient={addColorStop(){}};
 const context=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});
 const element=id=>{if(!elements.has(id))elements.set(id,{hidden:id!=='#welcome',style:{},classList:{toggle(){}},textContent:'',getContext:()=>context,focus(){},setAttribute(){},setPointerCapture(){}});return elements.get(id)};
 const sandbox={...arena,createAudio,Math,console,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},requestAnimationFrame(){},document:{querySelector:element,addEventListener:(k,v)=>events[k]=v},window:{addEventListener:(k,v)=>events[k]=v}};
 const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 vm.createContext(sandbox);vm.runInContext(source+'\nthis.inspect=()=>({game,charge,charging,swing,priest,started});this.tick=()=>{update();draw()};',sandbox);
 const key=(type,code)=>events[type]({code,repeat:false,target:{tagName:'CANVAS'},preventDefault(){}});
 return {sandbox,element,key,events};
}
test('menu, render, turning, timed full charge, explosion, pause, restart and death UI',()=>{
 const {sandbox:s,element,key,events}=interfaceFixture();element('#play').onclick();s.tick();assert.equal(element('#welcome').hidden,true);
 key('keydown','ArrowLeft');assert.equal(s.inspect().priest.x,480);assert.equal(s.inspect().priest.facing,-1);key('keyup','ArrowLeft');
 key('keydown','KeyA');for(let i=0;i<75;i++)s.tick();assert.ok(s.inspect().charge>.999);
 const e=arena.spawnEnemy(s.inspect().game,'monster',-1);e.x=425;
 key('keyup','KeyA');for(let i=0;i<10;i++)s.tick();assert.equal(s.inspect().game.explosions,1);assert.equal(element('#score').textContent,'00');
 key('keydown','Escape');const elapsed=s.inspect().game.elapsed;for(let i=0;i<60;i++)s.tick();assert.equal(s.inspect().game.elapsed,elapsed);
 element('#resume').onclick();s.tick();assert.ok(s.inspect().game.elapsed>elapsed);
 for(let i=0;i<30;i++)s.tick();key('keydown','Space');s.tick();events.blur();assert.equal(s.inspect().charging,false);assert.equal(s.inspect().started,false);
 element('#resume').onclick();const g=s.inspect().game;g.lives=1;g.invulnerable=0;const attacker=arena.spawnEnemy(g,'zombie',1);attacker.x=495;s.tick();assert.equal(g.over,true);assert.equal(element('#victory').hidden,false);
 element('#again').onclick();assert.equal(s.inspect().game.lives,5);assert.equal(s.inspect().game.score,0);assert.equal(element('#victory').hidden,true);
});
test('touch direction and hold/release use the same attack; cancellation never swings',()=>{
 const {sandbox:s,element}=interfaceFixture();element('#play').onclick();element('#left').onclick();assert.equal(s.inspect().priest.facing,-1);
 element('#bat').onpointerdown({pointerId:1,preventDefault(){}});for(let i=0;i<30;i++)s.tick();assert.ok(s.inspect().charge>=.39);
 element('#bat').onpointercancel();assert.equal(s.inspect().swing,0);assert.equal(s.inspect().charging,false);
 element('#right').onclick();element('#bat').onpointerdown({pointerId:2,preventDefault(){}});for(let i=0;i<45;i++)s.tick();element('#bat').onpointerup();assert.equal(s.inspect().swing,24);
});
test('keyboard and touch movement stay in the middle third and clear on pause/reset',()=>{
 const {sandbox:s,element,key}=interfaceFixture();element('#play').onclick();s.inspect().game.spawnIn=1e9;
 key('keydown','ArrowLeft');for(let i=0;i<100;i++)s.tick();assert.equal(s.inspect().priest.x,320);assert.equal(s.inspect().game.playerX,320);
 key('keyup','ArrowLeft');key('keydown','ArrowRight');for(let i=0;i<180;i++)s.tick();assert.equal(s.inspect().priest.x,640);
 key('keydown','Escape');element('#resume').onclick();s.tick();assert.equal(s.inspect().priest.x,640);
 element('#left').onpointerdown({pointerId:3,preventDefault(){}});for(let i=0;i<20;i++)s.tick();assert.equal(s.inspect().priest.x,590);
 element('#left').onpointercancel();s.tick();assert.equal(s.inspect().priest.x,590);
 element('#reset').onclick();assert.equal(s.inspect().priest.x,480);s.tick();assert.equal(s.inspect().priest.x,480);
});
test('golden target matches release power, locks at release and awards a home run',()=>{
 const {sandbox:s,element,key}=interfaceFixture();element('#play').onclick();s.inspect().game.spawnIn=1e9;
 key('keydown','KeyA');for(let i=0;i<56;i++)s.tick();
 assert.match(element('#power-label').textContent,/RILASCIA/);
 const e=arena.spawnEnemy(s.inspect().game,'zombie',1);e.x=545;
 key('keyup','KeyA');for(let i=0;i<10;i++)s.tick();assert.equal(e.state,'flight');
 for(let i=0;i<100;i++)s.tick();assert.equal(s.inspect().game.score,1);assert.equal(s.inspect().game.explosions,0);
});
