import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { SHOTS } from './shots.js';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});
await page.clock.pauseAt(new Date('2026-10-06T12:00:01Z'));
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const advance=ms=>page.clock.runFor(Math.round(ms));
async function hold(key,ms){await page.keyboard.down(key);await advance(ms);await page.keyboard.up(key)}
try {
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');
 await page.evaluate(()=>document.fonts.ready);await advance(17);
 assert.equal(await page.locator('#route-list>span').count(),10);
 await page.screenshot({path:'/tmp/father-menu.png',fullPage:true});
 await page.click('#play');
 await page.keyboard.press('s');await advance(220);await page.keyboard.press('r');
 await hold('a',100);await advance(450);
 assert.equal(await page.locator('#strokes').textContent(),'00');
 await page.keyboard.press('Space');
 assert.equal(await page.locator('#aim-panel').isVisible(),true);
 await hold('ArrowUp',300);
 assert.ok(parseFloat(await page.locator('#aim-readout').textContent())>35);
 await hold('ArrowDown',3000);
 assert.equal(await page.locator('#aim-readout').textContent(),'5°');
 await hold('ArrowUp',3000);
 assert.equal(await page.locator('#aim-readout').textContent(),'80°');
 await page.keyboard.press('Space');assert.equal(await page.locator('#aim-panel').isVisible(),false);
 await page.click('#menu');assert.equal(await page.locator('#welcome').isVisible(),true);
 await page.click('#resume');await page.keyboard.press('r');
 for(const [i,l] of LEVELS.entries()){
  assert.equal(await page.locator('#target-name').textContent(),l.skeleton.name);
  assert.match(await page.locator('#level-title').textContent(),new RegExp(`^${String(i+1).padStart(2,'0')} / 10`));
  const distance=Math.abs(l.skeleton.x-l.start.x)-38;
  await hold(l.facing===1?'ArrowRight':'ArrowLeft',distance/2.8*1000/60);
  await page.keyboard.press('Space');
  const shot=SHOTS[i];
  if(shot.angleSteps)await hold(shot.angleSteps>0?'ArrowUp':'ArrowDown',Math.abs(shot.angleSteps)*1000/60);
  await page.keyboard.down('a');await advance(shot.frames*1000/60);
  if(i===0)await page.screenshot({path:'/tmp/father-aim.png',fullPage:true});
  await page.keyboard.up('a');await advance(5500);
  assert.equal(await page.locator('#victory').isVisible(),true,`Level ${i+1}: expected real shot to reach portal`);
  assert.equal(await page.locator('#strokes').textContent(),'01');
  console.log(`Browser level ${i+1}: ${l.skeleton.name} delivered.`);
  if(i===0){
   await page.click('#again');assert.equal(await page.locator('#strokes').textContent(),'00');
   await hold('ArrowRight',distance/2.8*1000/60);await page.keyboard.press('Space');
   if(shot.angleSteps)await hold(shot.angleSteps>0?'ArrowUp':'ArrowDown',Math.abs(shot.angleSteps)*1000/60);
   await hold('a',shot.frames*1000/60);await advance(5500);
   assert.equal(await page.locator('#victory').isVisible(),true);
  }
  if(i<9)await page.click('#next');
 }
 assert.equal(await page.locator('#next').isVisible(),false);
 assert.match(await page.locator('#result').textContent(),/10 livelli in 10 colpi/);
 assert.match(await page.locator('#victory h2').textContent(),/parrocchia è salva/);
 await page.screenshot({path:'/tmp/father-ending.png',fullPage:true});
 await page.keyboard.press('r');assert.equal(await page.locator('#victory').isVisible(),true);
 await page.click('#again');assert.equal(await page.locator('#resume').isVisible(),false);
 await page.click('#play');assert.match(await page.locator('#level-title').textContent(),/^01/);
 await page.click('#sound');assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 await page.click('#menu');await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/father-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log('Passed: menu/resume, A/S controls, aiming and limits, all 10 levels, replay, campaign ending, new game, audio and mobile layout.');
} catch(error) {
 await page.screenshot({path:'/tmp/father-failure.png',fullPage:true});throw error;
} finally {await browser.close()}
