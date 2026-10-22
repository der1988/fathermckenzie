export const FLOOR = 442;
export const WORLD_WIDTH = 1440;
export const CHARACTER_SCALE = 0.7;
const ledge = (x, y, width, height = 18) => ({ x, y, width, height });
const level = (title, name, style, accent, bone, platforms, options = {}) => ({
  title, platforms,
  start: options.start ?? { x: 159, y: FLOOR },
  skeleton: { x: 283, y: FLOOR, name, style, accent, bone, ...options.skeleton },
  portal: options.portal ?? { x: 843, y: 382 },
  facing: options.facing ?? 1,
  sky: options.sky ?? '#1b2b2c',
});
export const LEVELS = [
  level('Il primo peccato', 'Osvaldo il Pigro', 'cap', '#99b976', '#ddd8ad',
    [ledge(360,385,110),ledge(520,327,112),ledge(681,378,93)]),
  level('La scala dei sospiri', 'Tibio il Ladro', 'bandit', '#b292c8', '#d4c6d9',
    [ledge(355,389,90),ledge(470,339,95),ledge(590,289,100),ledge(720,338,95)],
    {portal:{x:861,y:318},sky:'#282537'}),
  level('Sotto le catacombe', 'Bruno il Minatore', 'miner', '#e7b15c', '#d2c5a1',
    [ledge(346,306,190),ledge(540,360,95),ledge(660,281,118),ledge(760,389,70)],
    {sky:'#302a23'}),
  level('La via del ritorno', 'Ruggero il Pirata', 'pirate', '#d4806f', '#d9c4a7',
    [ledge(590,381,112),ledge(440,321,100),ledge(275,376,110)],
    {start:{x:800,y:FLOOR},skeleton:{x:695},portal:{x:110,y:382},facing:-1,sky:'#20323a'}),
  level('Il ponte spezzato', 'Ottavio il Conte', 'topHat', '#b6819b', '#e4d4ca',
    [ledge(335,384,70),ledge(447,337,65),ledge(554,304,70),ledge(666,348,70),ledge(782,383,122)],
    {portal:{x:843,y:323},sky:'#332536'}),
  level('Le torri del silenzio', 'Arturo il Cavaliere', 'helmet', '#98b9c5', '#c7d2d0',
    [ledge(358,385,88),ledge(455,319,85),ledge(552,253,85),ledge(680,355,92)],
    {sky:'#202b39'}),
  level('La caduta del vescovo', 'Don Femore', 'bishop', '#c497da', '#dfd5b9',
    [ledge(120,338,190),ledge(355,389,85),ledge(490,331,95),ledge(644,381,90)],
    {start:{x:159,y:338},skeleton:{x:265,y:338},sky:'#2e2538'}),
  level('Il giardino velenoso', 'Viola la Botanica', 'flower', '#bbcd76', '#c9d6a4',
    [ledge(342,383,98),ledge(465,332,90),ledge(597,375,98),ledge(736,321,72)],
    {portal:{x:867,y:382},sky:'#253628'}),
  level('Il patto del giullare', 'Gigi il Giullare', 'jester', '#e69b73', '#e2d3ad',
    [ledge(580,386,114),ledge(448,355,85),ledge(308,306,95),ledge(149,364,100)],
    {start:{x:803,y:FLOOR},skeleton:{x:706},portal:{x:85,y:304},facing:-1,sky:'#332c30'}),
  level('L’ultima benedizione', 'Re Calcagno', 'crown', '#f2cd76', '#f0deac',
    [ledge(345,384,75),ledge(451,332,80),ledge(564,278,80),ledge(682,330,80),ledge(793,380,124)],
    {portal:{x:856,y:320},sky:'#352426'}),
];
// Each route has ordered seals: overshooting or taking a shortcut leaves the portal shut.
const routes = [
  { hint:'Due soste: accompagna lo scheletro nei sigilli 1 e 2 prima del portale.', seals:[[580,380],[1020,380]], platforms:[ledge(350,385,110),ledge(710,340,125),ledge(1150,385,90)] },
  { hint:'Scala le terrazze: il secondo sigillo è in alto.', seals:[[560,330],[960,270]], platforms:[ledge(350,390,100),ledge(500,345,150),ledge(690,295,115),ledge(880,285,165),ledge(1110,350,110)] },
  { hint:'Tiri bassi sotto le volte, poi un colpo alto in uscita.', seals:[[570,395],[1000,380]], platforms:[ledge(350,295,360,28),ledge(800,270,330,28),ledge(1170,380,95)] },
  { hint:'Parti da destra: misura la potenza e procedi verso sinistra.', seals:[[900,370],[440,330]], platforms:[ledge(1050,385,100),ledge(770,325,100),ledge(365,345,160),ledge(560,395,95)] },
  { hint:'Supera il ponte a tappe: evita di scavalcare il primo sigillo.', seals:[[580,310],[1030,370]], platforms:[ledge(350,390,85),ledge(475,335,100),ledge(600,335,100),ledge(750,280,95),ledge(920,385,180),ledge(1170,335,120)] },
  { hint:'Aggira le torri, raccogli i sigilli e riposizionati prima del tiro.', seals:[[580,380],[1010,325]], platforms:[ledge(350,380,80),ledge(445,320,80),ledge(580,350,80),ledge(690,280,35,162),ledge(760,380,95),ledge(890,340,90),ledge(1000,340,115),ledge(1160,390,100)] },
  { hint:'Dal pulpito scendi al primo sigillo, poi risali la terrazza.', seals:[[600,390],[1010,300]], platforms:[ledge(100,338,210),ledge(375,390,95),ledge(730,390,110),ledge(860,335,100),ledge(990,315,140),ledge(1180,375,100)] },
  { hint:'Prima il sigillo lontano, poi torna indietro: non basta tirare forte.', seals:[[1020,380],[570,380]], platforms:[ledge(350,385,100),ledge(710,325,140),ledge(1150,370,115)] },
  { hint:'Il giullare inverte la strada: prima sinistra, poi destra, infine il portale.', seals:[[410,380],[930,370]], platforms:[ledge(1090,380,95),ledge(730,315,130),ledge(530,365,95),ledge(230,385,95)] },
  { hint:'Tre sigilli in ordine: basso, alto, ritorno. Pianifica anche l’ultimo colpo.', seals:[[550,380],[1040,290],[790,380]], platforms:[ledge(350,385,100),ledge(650,335,100),ledge(870,360,110),ledge(1010,305,145),ledge(1200,375,100)] },
];
for (const [i,l] of LEVELS.entries()) {
  const route=routes[i];
  l.platforms=route.platforms; l.hint=route.hint;
  l.seals=route.seals.map(([x,y])=>({x,y,radius:70}));
  l.portal={x:l.facing===1?1350:90,y:382};
  if(l.facing===-1){l.start.x=1300;l.skeleton.x=1180;}
  // Subtle bone tones and tiny facial details, with the existing signature accessories.
  l.skeleton.bone=['#ddd8bc','#d9d4b9','#dfd7bf','#d6d2b8','#e0d9c3','#d8d5be','#ded8bd','#d9d7bb','#e1d9bf','#e3dcc6'][i];
  l.skeleton.detail=i%3;
}
// Raised portals have a physical landing under their arch.
for (const l of LEVELS) {
  const bottom = l.portal.y + 60;
  if (bottom < FLOOR && !l.platforms.some(p => p.y === bottom && p.x <= l.portal.x - 35 && p.x + p.width >= l.portal.x + 35))
    l.platforms.push(ledge(l.portal.x - 48, bottom, 96));
}
export const PORTAL = LEVELS[0].portal;
export const PLATFORMS = LEVELS[0].platforms;
export function createPriest(level = LEVELS[0]) {
  return { x: level.start.x, y: level.start.y, vy: 0, facing: level.facing, walking: false, grounded: true, gait: 0, landing: 0 };
}
export function jump(priest) {
  if (!priest.grounded) return false;
  priest.vy = -9.6;
  priest.grounded = false;
  return true;
}
// Feet are the player origin. Platforms are solid on all four sides, like the ragdoll colliders.
export function movePriest(priest, axis, charging, platforms = PLATFORMS) {
  const half = 9, height = 45;
  const oldX = priest.x, oldY = priest.y;
  const dx = axis * (charging ? 1.15 : 2.8);
  priest.x = Math.max(20, Math.min(WORLD_WIDTH-20, priest.x + dx));
  for (const p of platforms) {
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
  for (const p of platforms) {
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
