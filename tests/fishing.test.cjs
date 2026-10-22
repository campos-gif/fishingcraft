const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../fishing.js');
const {create,step}=globalThis.FishingChallenge;
function play(value,rod,strategy){const f=create(value,rod);for(let i=0;i<2600&&!f.result;i++)step(f,1/60,strategy(f));return f}
test('all fish values are catchable with every rod by managing tension',()=>{
  for(let rod=0;rod<4;rod++)for(const value of [12,40,75,190,260])assert.equal(play(value,rod,f=>!f.struggling&&f.tension<65).result,'caught');
});
test('holding continuously breaks the line for a powerful fish',()=>assert.equal(play(260,0,()=>true).result,'broken'));
test('never reeling lets the fish escape',()=>assert.equal(play(12,0,()=>false).result,'escaped'));
test('better rods reduce capture time',()=>assert.ok(play(260,3,f=>!f.struggling&&f.tension<65).elapsed<play(260,0,f=>!f.struggling&&f.tension<65).elapsed));
test('finished challenges cannot award a second capture or change state',()=>{const f=play(12,0,f=>!f.struggling&&f.tension<65),before={...f};step(f,10,true);assert.deepEqual(f,before)});
