import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudio} from '../src/audio.js';
function audioFixture(){
 const calls=[],nodes=[];
 class Parameter{
  setValueAtTime(value,time){assert.ok(Number.isFinite(value)&&Number.isFinite(time));calls.push(['set',value,time]);}
  exponentialRampToValueAtTime(value,time){assert.ok(value>0&&Number.isFinite(time));}
  setTargetAtTime(value,time,constant){assert.ok(constant>0);calls.push(['target',value,time]);}
  cancelScheduledValues(){}
 }
 class Node{connect(){return this}disconnect(){}}
 class Context{
  constructor(){this.currentTime=0;this.sampleRate=8000;this.state='suspended';this.destination=new Node();Context.instance=this;}
  resume(){this.state='running';return Promise.resolve();}
  createGain(){const n=new Node();n.gain=new Parameter();return n}
  createOscillator(){const n=new Node();n.frequency=new Parameter();n.start=time=>{assert.ok(time>=this.currentTime);calls.push(['start',time]);};n.stop=time=>{assert.ok(time>=this.currentTime);};nodes.push(n);return n}
  createConvolver(){return new Node()}
  createBuffer(channels,length){const data=Array.from({length:channels},()=>new Float32Array(length));return {getChannelData:channel=>data[channel]}}
 }
 return {Context,calls,nodes};
}
test('organ starts on unlock, schedules once, pauses, mutes and resumes without accumulated notes',()=>{
 const {Context,calls}=audioFixture();const audio=createAudio({Context});audio.update();assert.equal(calls.length,0);
 audio.unlock();audio.setPlaying(true);audio.update();const starts=()=>calls.filter(c=>c[0]==='start').length;
 const first=starts();assert.ok(first>15);audio.update();assert.equal(starts(),first);
 Context.instance.currentTime=5;audio.setPlaying(false);audio.update();assert.equal(starts(),first);
 audio.setPlaying(true);audio.update();assert.ok(starts()>first);const resumed=starts();
 audio.setEnabled(false);Context.instance.currentTime=50;audio.update();audio.effect('explode');assert.equal(starts(),resumed);
 audio.setEnabled(true);audio.update();assert.ok(starts()-resumed<40);
});
test('every gameplay effect produces finite, bounded oscillator envelopes',()=>{
 const {Context,calls}=audioFixture();const audio=createAudio({Context});audio.unlock();
 for(const name of ['swing','push','launch','explode','hurt','score','ready','death']){const before=calls.length;audio.effect(name,'monster');assert.ok(calls.length>before);}
});
test('missing Web Audio leaves the game playable',()=>{
 const audio=createAudio({Context:null});audio.unlock();audio.setPlaying(true);audio.update();audio.setEnabled(false);audio.effect('explode');
});
