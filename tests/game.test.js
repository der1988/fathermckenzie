import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { createCampaign, completeLevel, nextLevel } from '../src/campaign.js';
import { createPriest, movePriest, jump, PLATFORMS, FLOOR, LEVELS } from '../src/level.js';
import { createWorld, strike, stepWorld, clearWorld, predictTrajectory, launchVelocity } from '../src/physics.js';
test('a distant swing misses and leaves the skeleton standing', () => {
  const w = createWorld();
  assert.equal(strike(w, 100, 1, 1), false);
  for(let i=0;i<60;i++)stepWorld(w);
  assert.equal(w.hit, false);
  assert.equal(w.parts.chest.position.x, 283);
  clearWorld(w);
});
test('a measured shot sends the articulated skeleton into the portal', () => {
  const w = createWorld();
  assert.equal(strike(w, 245, 1, .35), true);
  assert.equal(Object.keys(w.parts).length, 7);
  for(let i=0;i<600&&!w.won;i++)stepWorld(w);
  assert.equal(w.won, true);
  assert.ok(Object.values(w.parts).some(b => Math.abs(b.angle) > .1));
  clearWorld(w);
});
test('charge increases launch speed and a missed landing can be hit again', () => {
  const weak = createWorld(), strong = createWorld();
  strike(weak,230,1,.1);strike(strong,230,1,1);
  assert.ok(strong.parts.chest.velocity.x > weak.parts.chest.velocity.x);
  for(let i=0;i<600;i++)stepWorld(weak);
  assert.equal(weak.won,false);
  assert.equal(strike(weak,weak.parts.chest.position.x-35,1,.4),true);
  clearWorld(weak);clearWorld(strong);
});

test('S-style jump lands on a platform, allows another jump, and cannot double jump', () => {
  const p = createPriest();
  p.x = 330;
  assert.equal(jump(p), true);
  assert.equal(jump(p), false);
  for(let i=0;i<26;i++) movePriest(p,1,false);
  for(let i=0;i<45;i++) movePriest(p,0,false);
  assert.equal(p.y, PLATFORMS[0].y);
  assert.equal(p.grounded, true);
  assert.equal(jump(p), true);
});
test('walking off a platform falls to the floor and its underside blocks a jump', () => {
  const p = createPriest();
  p.x = 440; p.y = PLATFORMS[0].y;
  for(let i=0;i<25;i++)movePriest(p,1,false);
  for(let i=0;i<60;i++)movePriest(p,0,false);
  assert.equal(p.y,FLOOR);
  p.x=560;
  jump(p);
  for(let i=0;i<12;i++)movePriest(p,0,false);
  assert.ok(p.y-45 >= PLATFORMS[1].y+PLATFORMS[1].height-.01);
});
test('the ragdoll rests on the same solid platforms used by the priest', () => {
  const w=createWorld();
  for(const body of Object.values(w.parts)) {
    Matter.Body.setStatic(body,false);
    Matter.Body.translate(body,{x:130,y:-145});
  }
  for(let i=0;i<240;i++)stepWorld(w);
  assert.ok(w.parts.chest.position.y < PLATFORMS[0].y);
  assert.ok(w.parts.chest.position.x > PLATFORMS[0].x);
  clearWorld(w);
});

test('the upper platform is reachable from the first ledge', () => {
  const p=createPriest();p.x=440;p.y=PLATFORMS[0].y;
  jump(p);
  for(let i=0;i<42;i++)movePriest(p,1,false);
  for(let i=0;i<20;i++)movePriest(p,0,false);
  assert.equal(p.y,PLATFORMS[1].y);
  assert.equal(p.grounded,true);
});

test('ten distinct levels have unique named, visually distinct skeletons', () => {
  assert.equal(LEVELS.length,10);
  for (const field of ['name','style']) assert.equal(new Set(LEVELS.map(l=>l.skeleton[field])).size,10);
  assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.platforms))).size,10);
});
test('aim elevation changes the real velocity, mirrored shots face left', () => {
  const low=launchVelocity(1,.5,15),high=launchVelocity(1,.5,70),left=launchVelocity(-1,.5,70);
  assert.ok(high.y<low.y);assert.ok(high.x<low.x);
  assert.equal(left.x,-high.x);assert.equal(left.y,high.y);
});
test('trajectory prediction matches live ragdoll physics without changing its source', () => {
  const w=createWorld();
  const before=JSON.stringify(Object.values(w.parts).map(b=>[b.position,b.angle,b.velocity]));
  const prediction=predictTrajectory(w,1,.35,35,100);
  assert.equal(JSON.stringify(Object.values(w.parts).map(b=>[b.position,b.angle,b.velocity])),before);
  assert.equal(w.hit,false);
  strike(w,245,1,.35,FLOOR,35);
  let p=1;
  for(let i=0;i<100;i++){
    stepWorld(w);
    if(i%3===0){assert.ok(Math.hypot(w.parts.chest.position.x-prediction.points[p].x,w.parts.chest.position.y-prediction.points[p].y)<.01);p++}
    if(w.won)break;
  }
  clearWorld(w);
});
test('campaign progresses in order, records each score once, and ends after ten', () => {
  const c=createCampaign();
  assert.equal(nextLevel(c),false);
  for(let i=0;i<10;i++){
    assert.equal(c.index,i);
    assert.equal(completeLevel(c,i+1),true);
    assert.equal(completeLevel(c,100),false);
    assert.equal(nextLevel(c),i<9);
  }
  assert.equal(c.finished,true);assert.equal(c.index,9);
  assert.equal(c.scores.reduce((a,b)=>a+b,0),55);
  assert.equal(nextLevel(c),false);
  assert.deepEqual(createCampaign(),{index:0,scores:[],finished:false});
});

for (const [index, level] of LEVELS.entries()) {
  test(`level ${index+1} can be completed with its actual platforms and portal`, async () => {
    const {SHOTS}=await import('./shots.js');
    const shot=SHOTS[index],w=createWorld(level);
    assert.equal(strike(w,level.skeleton.x-level.facing*38,level.facing,shot.frames/75,level.skeleton.y,35+shot.angleSteps*.75),true);
    for(let i=0;i<360&&!w.won;i++)stepWorld(w);
    assert.equal(w.won,true);
    clearWorld(w);
  });
}
