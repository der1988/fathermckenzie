export const FLOOR = 442;
export const CHARACTER_SCALE = 0.7;
export const PORTAL = { x: 843, y: 382 };
export const PLATFORMS = [
  { x: 360, y: 385, width: 110, height: 18 },
  { x: 520, y: 327, width: 112, height: 18 },
  { x: 681, y: 378, width: 93, height: 18 },
];
export function createPriest() {
  return { x: 159, y: FLOOR, vy: 0, facing: 1, walking: false, grounded: true, gait: 0, landing: 0 };
}
export function jump(priest) {
  if (!priest.grounded) return false;
  priest.vy = -9.6;
  priest.grounded = false;
  return true;
}
// Feet are the player origin. Platforms are solid on all four sides, like the ragdoll colliders.
export function movePriest(priest, axis, charging) {
  const half = 9, height = 45;
  const oldX = priest.x, oldY = priest.y;
  const dx = axis * (charging ? 1.15 : 2.8);
  priest.x = Math.max(20, Math.min(940, priest.x + dx));
  for (const p of PLATFORMS) {
    if (oldY <= p.y + .01 || oldY - height >= p.y + p.height) continue;
    if (dx > 0 && oldX + half <= p.x && priest.x + half > p.x) priest.x = p.x - half;
    if (dx < 0 && oldX - half >= p.x + p.width && priest.x - half < p.x + p.width) priest.x = p.x + p.width + half;
  }
  priest.walking = Math.abs(priest.x - oldX) > .01;
  if (axis) priest.facing = axis;
  if (priest.walking && priest.grounded) priest.gait += .24;
  priest.landing = Math.max(0, priest.landing - 1);
  priest.vy += .42;
  const fallingSpeed = priest.vy;
  priest.y += priest.vy;
  priest.grounded = false;
  for (const p of PLATFORMS) {
    if (priest.x + half <= p.x || priest.x - half >= p.x + p.width) continue;
    if (priest.vy >= 0 && oldY <= p.y + .01 && priest.y >= p.y) {
      priest.y = p.y; priest.vy = 0; priest.grounded = true;
    } else if (priest.vy < 0 && oldY - height >= p.y + p.height && priest.y - height <= p.y + p.height) {
      priest.y = p.y + p.height + height; priest.vy = 0;
    }
  }
  if (priest.y >= FLOOR) { priest.y = FLOOR; priest.vy = 0; priest.grounded = true; }
  if (priest.grounded && fallingSpeed > 2) priest.landing = 9;
}
