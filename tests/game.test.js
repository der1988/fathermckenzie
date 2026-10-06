import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(strike(w, 230, 1, .4), true);
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
