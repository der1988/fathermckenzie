import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { createPriest, movePriest, jump, PLATFORMS, FLOOR } from '../src/level.js';
import { createWorld, strike, stepWorld, clearWorld } from '../src/physics.js';
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
  assert.equal(strike(w, 245, 1, .5), true);
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
