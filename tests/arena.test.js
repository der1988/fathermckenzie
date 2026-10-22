import test from 'node:test';
import assert from 'node:assert/strict';
import {createArena,spawnEnemy,hitEnemy,stepArena,TYPES,CENTER,SWEET_MIN,SWEET_MAX} from '../src/arena.js';
function nearby(type,side=1){const g=createArena();g.spawnIn=1e9;const e=spawnEnemy(g,type,side);e.x=CENTER+side*65;return {g,e};}
for(const type of Object.keys(TYPES)){
 test(`${type}: weak strike repels, returns, and scores nothing`,()=>{
 const {g,e}=nearby(type);assert.equal(hitEnemy(g,1,.15),'push');assert.ok(e.vx>0);
 for(let i=0;i<120;i++)stepArena(g);assert.equal(e.state,'approach');assert.equal(g.score,0);
 });
 test(`${type}: correct charge earns exactly one point only when leaving the arena`,()=>{
 const {g,e}=nearby(type,-1);assert.equal(hitEnemy(g,-1,(SWEET_MIN+SWEET_MAX)/2),'launch');assert.equal(g.score,0);assert.ok(e.vx<0);
 for(let i=0;i<300;i++)stepArena(g);assert.equal(g.score,1);assert.equal(g.enemies.length,0);assert.equal(g.explosions,0);
 });
 test(`${type}: maximum charge explodes for zero points`,()=>{
 const {g}=nearby(type);assert.equal(hitEnemy(g,1,1),'explode');for(let i=0;i<300;i++)stepArena(g);
 assert.equal(g.score,0);assert.equal(g.explosions,1);assert.equal(g.enemies.length,0);
 });
}
test('only the narrow golden window produces home runs for every enemy type',()=>{
 for(const type of Object.keys(TYPES)){
  for(const power of [.1,.35,.5,SWEET_MIN-.001,SWEET_MAX+.001,.899])assert.equal(hitEnemy(nearby(type).g,1,power),'push');
  for(const power of [SWEET_MIN,.74,SWEET_MAX])assert.equal(hitEnemy(nearby(type).g,1,power),'launch');
 }
});
test('hits respect facing, range, one target and airborne exclusion',()=>{
 const {g,e}=nearby('skeleton',-1);assert.equal(hitEnemy(g,1,.5),null);e.x=700;assert.equal(hitEnemy(g,1,.5),null);
 e.x=540;const second=spawnEnemy(g,'zombie',1);second.x=550;hitEnemy(g,1,.7);assert.equal(e.state,'flight');assert.equal(second.state,'approach');
});
test('contact has immunity, ends at zero lives and freezes the simulation',()=>{
 const g=createArena();g.spawnIn=1e9;for(let i=0;i<10;i++){const e=spawnEnemy(g,'skeleton',1);e.x=CENTER+20;}
 stepArena(g);assert.equal(g.lives,4);
 for(let i=0;i<5;i++){g.invulnerable=0;g.enemies.forEach(e=>{e.state='approach';e.x=CENTER+20});stepArena(g);}
 assert.equal(g.lives,0);assert.equal(g.over,true);const elapsed=g.elapsed;stepArena(g);assert.equal(g.elapsed,elapsed);assert.equal(hitEnemy(g,1,1),null);
});
test('spawn order, increasing density and endless progression',()=>{
 const g=createArena();stepArena(g,1,()=>.8);assert.equal(g.enemies[0].type,'skeleton');const early=g.spawnIn;
 g.elapsed=21;g.spawnIn=0;stepArena(g,1/60,()=>.8);assert.equal(g.enemies.at(-1).type,'zombie');assert.ok(g.spawnIn<early);
 g.elapsed=46;g.spawnIn=0;stepArena(g,1/60,()=>.8);assert.equal(g.enemies.at(-1).type,'monster');
 g.elapsed=1200;g.spawnIn=0;const before=g.nextId;stepArena(g,1/60,()=>.8);assert.ok(g.nextId-before>10);assert.equal(g.over,false);
});
test('monster rush and zombie stagger differ from steady skeleton movement',()=>{
 const g=createArena();g.spawnIn=1e9;const m=spawnEnemy(g,'monster',1);m.x=900;m.age=2.3;const s=spawnEnemy(g,'skeleton',1);s.x=900;const z=spawnEnemy(g,'zombie',1);z.x=900;
 stepArena(g);assert.ok(m.x<s.x);assert.ok(s.x<z.x);
});
test('explosion window is separate from the golden home-run zone',()=>{
 for(const type of Object.keys(TYPES)){
  const near=nearby(type);assert.equal(hitEnemy(near.g,1,.899),'push');
  for(const power of [.9,.95,1]){const {g}=nearby(type);assert.equal(hitEnemy(g,1,power),'explode');stepArena(g);assert.equal(g.score,0);}
 }
});
test('attacks and enemy pursuit follow the player instead of the screen center',()=>{
 const {g,e}=nearby('skeleton');g.playerX=640;e.x=700;assert.equal(hitEnemy(g,1,.74),'launch');
 const a=spawnEnemy(g,'zombie',-1);a.x=600;const before=a.x;stepArena(g);assert.ok(a.x>before);
 a.x=625;stepArena(g);assert.equal(g.lives,4);
});
