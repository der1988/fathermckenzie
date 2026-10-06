import Matter from 'matter-js';
const { Engine, Bodies, Body, Composite, Constraint } = Matter;
import { FLOOR, LEVELS, CHARACTER_SCALE as SCALE } from './level.js';
export { FLOOR, PORTAL } from './level.js';
export function createWorld(level = LEVELS[0]) {
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 }, positionIterations: 8, velocityIterations: 8, constraintIterations: 4 });
  const group = Body.nextGroup(true);
  const parts = {};
  const add = (name, x, y, w, h) => parts[name] = Bodies.rectangle(level.skeleton.x + (x - 283) * SCALE, level.skeleton.y + (y - FLOOR) * SCALE, w * SCALE, h * SCALE, { collisionFilter: { group }, friction: 0.48, frictionAir: 0.003, restitution: 0.35, density: 0.002, label: name });
  add('head', 283, 365, 19, 20);
  add('chest', 283, 389, 18, 26);
  add('hip', 283, 408, 16, 9);
  add('leftArm', 264, 388, 8, 24);
  add('rightArm', 302, 388, 8, 24);
  add('leftLeg', 275, 425, 7, 26);
  add('rightLeg', 291, 425, 7, 26);
  const joint = (a, b, pointA, pointB, length = 1) => Constraint.create({ bodyA: parts[a], bodyB: parts[b], pointA: {x: pointA.x * SCALE, y: pointA.y * SCALE}, pointB: {x: pointB.x * SCALE, y: pointB.y * SCALE}, length: length * SCALE, stiffness: 0.85, damping: 0.15 });
  const joints = [joint('head', 'chest', {x:0,y:10}, {x:0,y:-13}), joint('chest','hip',{x:0,y:13},{x:0,y:-4}), joint('chest','leftArm',{x:-9,y:-9},{x:0,y:-12}), joint('chest','rightArm',{x:9,y:-9},{x:0,y:-12}), joint('hip','leftLeg',{x:-7,y:4},{x:0,y:-13}), joint('hip','rightLeg',{x:7,y:4},{x:0,y:-13})];
  const floor = Bodies.rectangle(480, FLOOR + 40, 1120, 80, { isStatic: true, friction: 0.65 });
  const walls = [Bodies.rectangle(-22, 250, 44, 1000, {isStatic:true}), Bodies.rectangle(982,250,44,1000,{isStatic:true}), Bodies.rectangle(480,-170,960,40,{isStatic:true})];
  const platforms = level.platforms.map(p => Bodies.rectangle(p.x + p.width / 2, p.y + p.height / 2, p.width, p.height, {isStatic: true, friction: .65, label: 'platform'}));
  Composite.add(engine.world, [floor, ...platforms, ...walls, ...Object.values(parts), ...joints]);
  // The unstruck skeleton stands waiting. All seven linked bodies become dynamic at the first strike.
  Object.values(parts).forEach(body => Body.setStatic(body, true));
  return {engine, parts, level, hit: false, won: false};
}
export const MIN_ANGLE = 5, MAX_ANGLE = 80, DEFAULT_ANGLE = 35;
export function launchVelocity(facing, charge, angle = DEFAULT_ANGLE) {
  const speed = 8 + Math.max(0, Math.min(1, charge)) * 18;
  const radians = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle)) * Math.PI / 180;
  return { x: facing * Math.cos(radians) * speed, y: -Math.sin(radians) * speed };
}
function launch(world, facing, charge, angle) {
  const power = Math.max(0, Math.min(1, charge));
  world.hit = true;
  Object.values(world.parts).forEach((body, i) => {
    Body.setStatic(body, false);
    Body.setVelocity(body, launchVelocity(facing, power, angle));
    Body.setAngularVelocity(body, (i % 2 ? -1 : 1) * (0.035 + power * 0.09));
  });
}
export function canStrike(world, priestX, facing, priestY = FLOOR) {
  const nearest = Math.min(...Object.values(world.parts).map(b => Math.hypot(b.position.x - (priestX + facing * 18), b.position.y - (priestY - 26))));
  return nearest <= 44 && (world.parts.chest.position.x - priestX) * facing >= -8;
}
export function strike(world, priestX, facing, charge, priestY = FLOOR, angle = DEFAULT_ANGLE) {
  if (!canStrike(world, priestX, facing, priestY)) return false;
  launch(world, facing, charge, angle);
  return true;
}
// Simulate a separate ragdoll with the very same launch and collisions, without touching the game.
export function predictTrajectory(world, facing, power, angle, frames = 180) {
  const preview = createWorld(world.level);
  for (const [name, body] of Object.entries(world.parts)) {
    Body.setPosition(preview.parts[name], body.position);
    Body.setAngle(preview.parts[name], body.angle);
  }
  launch(preview, facing, power, angle);
  const points = [{ ...preview.parts.chest.position }];
  for (let i = 0; i < frames; i++) {
    stepWorld(preview);
    if (i % 3 === 0 || preview.won) points.push({ ...preview.parts.chest.position });
    if (preview.won) break;
  }
  const result = { points, won: preview.won };
  clearWorld(preview);
  return result;
}
export function stepWorld(world) {
  if (world.won) return;
  Engine.update(world.engine, 1000 / 60);
  const core = world.parts.chest.position;
  if (world.hit && Math.abs(core.x - world.level.portal.x) < 31 && core.y > world.level.portal.y - 72 && core.y < world.level.portal.y + 65) world.won = true;
}
export function clearWorld(world) { Composite.clear(world.engine.world, false); Engine.clear(world.engine); }
