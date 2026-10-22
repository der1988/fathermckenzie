import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');
 await page.click('#play');await page.keyboard.press('ArrowLeft');
 await page.keyboard.down('a');await page.waitForTimeout(1400);
 assert.match(await page.locator('#power-label').textContent(),/100%.*ESPLOSIONE/);
 await page.keyboard.up('a');await page.keyboard.press('Escape');assert.equal(await page.locator('#welcome').isVisible(),true);
 await page.click('#resume');assert.equal(await page.locator('#welcome').isVisible(),false);
 await page.click('#menu');await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/father-arena.png',fullPage:true});assert.deepEqual(errors,[]);
}finally{await browser.close()}
