// Original minor-key organ score, composed and synthesized locally with Web Audio.
export function createAudio({Context=globalThis.AudioContext??globalThis.webkitAudioContext}={}){
 let context,master,music,effects,enabled=true,playing=false,nextBeat=0,beat=0;
 const midi=n=>440*2**((n-69)/12);
 function init(){
  if(context||!Context)return Boolean(context);
  context=new Context();master=context.createGain();master.gain.value=.65;master.connect(context.destination);
  music=context.createGain();music.gain.value=0;music.connect(master);
  effects=context.createGain();effects.gain.value=.7;effects.connect(master);
  const reverb=context.createConvolver(),length=Math.floor(context.sampleRate*1.8),impulse=context.createBuffer(2,length,context.sampleRate);
  let seed=59;
  for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/1073741824-1)*(1-i/length)**3;}}
  reverb.buffer=impulse;const wet=context.createGain();wet.gain.value=.32;music.connect(reverb);reverb.connect(wet);wet.connect(master);
  return true;
 }
 function unlock(){if(!init())return;context.resume()?.catch(()=>{});}
 function voice(frequency,at,duration,volume,type='sine',bus=effects,endFrequency=frequency){
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,at);oscillator.frequency.exponentialRampToValueAtTime(Math.max(15,endFrequency),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(bus);oscillator.start(at);oscillator.stop(at+duration+.02);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
 }
 function organ(note,at,duration,volume){for(const [rank,level] of [[1,1],[2,.42],[3,.18],[4,.1]])voice(midi(note)*rank,at,duration,volume*level,'sine',music);}
 const chords=[[45,57,60,64],[41,57,60,65],[38,53,57,62],[40,56,59,64]];
 const melody=[76,72,69,72,76,79,76,72,77,72,69,72,77,81,79,77,74,69,65,69,74,77,76,74,76,71,68,71,76,80,83,80];
 function update(){
  if(!context||!enabled||!playing||context.state!=='running')return;
  if(nextBeat<context.currentTime-.4)nextBeat=context.currentTime;
  let count=0;
  while(nextBeat<context.currentTime+.22&&count++<4){
   const chord=chords[Math.floor(beat/8)%4];
   if(beat%8===0)for(const note of chord)organ(note,nextBeat,3.2,.018);
   if(beat%2===0){organ(chord[0]-12,nextBeat,.66,.035);voice(82,nextBeat,.24,.026,'sine',music,27);}
   organ(melody[beat%melody.length],nextBeat,.64,.017);
   if(beat%8===0)voice(midi(chord[2]+12),nextBeat,2.3,.012,'triangle',music);
   beat++;nextBeat+=60/84/2;
  }
 }
 function setPlaying(value){
  if(playing===value)return;playing=value;
  if(!context)return;
  music.gain.cancelScheduledValues(context.currentTime);music.gain.setTargetAtTime(value ? .65 : 0,context.currentTime,.09);
  if(value)nextBeat=context.currentTime;
 }
 function setEnabled(value){enabled=value;if(!init())return;master.gain.setTargetAtTime(value ? .65 : 0,context.currentTime,.03);if(value){unlock();nextBeat=context.currentTime;}}
 function effect(name,kind='skeleton'){
  if(!enabled||!context||context.state!=='running')return;
  const at=context.currentTime;
  if(name==='swing')voice(260,at,.16,.07,'triangle',effects,65);
  if(name==='push'){voice(kind==='monster'?95:180,at,.16,.12,'triangle',effects,45);voice(640,at,.07,.035,'square',effects,210);}
  if(name==='launch'){voice(130,at,.18,.14,'triangle',effects,50);voice(390,at,.38,.06,'sawtooth',effects,1050);}
  if(name==='explode'){voice(70,at,.55,.2,'sawtooth',effects,18);for(let i=0;i<6;i++)voice(350+i*181,at+i*.012,.14,.025,'square',effects,45+i*30);}
  if(name==='hurt'){voice(170,at,.32,.13,'sawtooth',effects,43);voice(178,at,.35,.07,'triangle',effects,49);}
  if(name==='score')for(const [i,n] of [72,76,79,84].entries())voice(midi(n),at+i*.07,.4,.06,'triangle');
  if(name==='ready'){voice(midi(88),at,.15,.035,'sine');}
  if(name==='death')for(const [i,n] of [52,48,45,40].entries())voice(midi(n),at+i*.14,.9,.08,'triangle');
 }
 return {unlock,update,setPlaying,setEnabled,effect};
}
