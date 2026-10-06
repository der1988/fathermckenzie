import Matter from 'matter-js';
const { Engine, Bodies, Body, Composite, Constraint } = Matter;
export const FLOOR = 442;
export const PORTAL = { x: 843, y: 382 };
export function createWorld() {
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 }, positionIterations: 8, velocityIterations: 8, constraintIterations: 4 });
  const group = Body.nextGroup(true);
  const parts = {};
  const add = (name, x, y, w, h) => parts[name] = Bodies.rectangle(x, y, w, h, { collisionFilter: { group }, friction: 0.48, frictionAir: 0.003, restitution: 0.35, density: 0.002, label: name });
  add('head', 283, 365, 19, 20);
  add('chest', 283, 389, 18, 26);
  add('hip', 283, 408, 16, 9);
  add('leftArm', 264, 388, 8, 24);
  add('rightArm', 302, 388, 8, 24);
  add('leftLeg', 275, 425, 7, 26);
  add('rightLeg', 291, 425, 7, 26);
  const joint = (a, b, pointA, pointB, length = 1) => Constraint.create({ bodyA: parts[a], bodyB: parts[b], pointA, pointB, length, stiffness: 0.85, damping: 0.15 });
  const joints = [joint('head', 'chest', {x:0,y:10}, {x:0,y:-13}), joint('chest','hip',{x:0,y:13},{x:0,y:-4}), joint('chest','leftArm',{x:-9,y:-9},{x:0,y:-12}), joint('chest','rightArm',{x:9,y:-9},{x:0,y:-12}), joint('hip','leftLeg',{x:-7,y:4},{x:0,y:-13}), joint('hip','rightLeg',{x:7,y:4},{x:0,y:-13})];
  const floor = Bodies.rectangle(480, FLOOR + 40, 1120, 80, { isStatic: true, friction: 0.65 });
  const walls = [Bodies.rectangle(-22, 250, 44, 1000, {isStatic:true}), Bodies.rectangle(982,250,44,1000,{isStatic:true}), Bodies.rectangle(480,-170,960,40,{isStatic:true})];
  Composite.add(engine.world, [floor, ...walls, ...Object.values(parts), ...joints]);
  // The unstruck skeleton stands waiting. All seven linked bodies become dynamic at the first strike.
  Object.values(parts).forEach(body => Body.setStatic(body, true));
  return {engine, parts, hit: false, won: false};
}
export function strike(world, priestX, facing, charge, priestY = FLOOR) {
  const parts = Object.values(world.parts);
  const nearest = Math.min(...parts.map(b => Math.hypot(b.position.x - (priestX + facing * 23), b.position.y - (priestY - 39))));
  if (nearest > 80) return false;
  const power = Math.max(0, Math.min(1, charge));
  const speed = 5.5 + power * 15;
  world.hit = true;
  parts.forEach((body, i) => {
    Body.setStatic(body, false);
    Body.setVelocity(body, {x: facing * speed, y: -(4.5 + power * 8)});
    Body.setAngularVelocity(body, (i % 2 ? -1 : 1) * (0.035 + power * 0.09));
  });
  return true;
}
export function stepWorld(world) {
  if (world.won) return;
  Engine.update(world.engine, 1000 / 60);
  const core = world.parts.chest.position;
  if (world.hit && Math.abs(core.x - PORTAL.x) < 31 && core.y > 310 && core.y < FLOOR + 5) world.won = true;
}
export function clearWorld(world) { Composite.clear(world.engine.world, false); Engine.clear(world.engine); }
