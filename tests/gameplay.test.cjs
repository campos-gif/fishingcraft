const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function game(saved={}){
  let time=0,drawn;const elements=new Map(),storage=new Map([['fishingcraft_save_v3',JSON.stringify(saved)]]);
  function node(){return {style:{},children:[],handlers:{},hidden:false,textContent:'',addEventListener(k,f){(this.handlers[k]??=[]).push(f)},dispatch(k,e={}){for(const f of this.handlers[k]||[])f({preventDefault(){},currentTarget:this,...e})},append(n){this.children.push(n)},replaceChildren(){this.children=[]},focus(){},setPointerCapture(){},getContext(){return {setTransform(){}}}}}
  const document={...node(),hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,node());return elements.get(id)},createElement:node};
  const context=vm.createContext({document,performance:{now:()=>time},innerWidth:390,innerHeight:844,devicePixelRatio:1,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(){},console});
  context.window=context;context.addEventListener=()=>{};
  context.FishingCraftRenderer={draw:(c,g)=>{drawn=g}};
  for(const file of ['persistence.js','fishing.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');let code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  // Test-only observation seam; production script and handlers execute unchanged.
  code=code.replace('update();requestAnimationFrame(frame);','globalThis.inspect={frame,fish,store,inventory,board,land,update,startGame,state:()=>({player,ship,bag,coins,rodLevel,boatLevel,fishState,challenge,inventoryOpen}),hold:v=>reeling=v};update();requestAnimationFrame(frame);');
  vm.runInContext(code,context);
  const api=context.inspect;return {api,document,el:id=>document.getElementById(id),save:()=>JSON.parse(storage.get('fishingcraft_save_v3')),draw:()=>drawn,tick(dt=16){time+=dt;api.frame(time)}};
}
test('legacy and malformed saves start safely without discarding valid fish',()=>{
 for(const saved of [null,[],{}, {coins:-20,rodLevel:1.7,boatOwned:2.8,boatLevel:9,bag:[null,{},['Tilápia',15],['invalid','22']]}]){
   const g=game(saved);g.api.startGame();assert.ok(Number.isInteger(g.api.state().rodLevel));assert.ok(g.api.state().coins>=0);
   if(saved?.bag){assert.equal(g.api.state().bag.length,1);assert.equal(g.api.state().boatLevel,2)}
 }
});
test('inventory groups fish, cancels fishing and blocks motion',()=>{
 const g=game({bag:[['Tilápia',15],['Tilápia',15],['Bagre',12]]});g.api.startGame();g.api.state().player.x=-.2;g.api.state().player.y=-2;g.api.fish();assert.equal(g.api.state().fishState,'waiting');
 g.api.inventory(true);assert.equal(g.api.state().fishState,'ready');assert.ok(g.el('inventoryList').children.some(n=>n.textContent==='Tilápia × 2 · 30 moedas'));
 const before={...g.api.state().player};g.document.dispatch('keydown',{key:'ArrowRight',code:'ArrowRight'});g.tick(70);assert.deepEqual({...g.api.state().player},before);assert.equal(g.draw().paused,true);
 g.document.dispatch('keydown',{key:'Escape',code:'Escape'});assert.equal(g.api.state().inventoryOpen,false);
});
test('capture, sale, upgrade and reload preserve the economy',()=>{
 const g=game({coins:100});g.api.startGame();Object.assign(g.api.state().player,{x:-.2,y:-2});g.api.fish();g.tick(4000);assert.equal(g.api.state().fishState,'bite');g.api.fish();
 for(let i=0;i<2500&&g.api.state().fishState==='fight';i++){g.api.hold(!g.api.state().challenge.struggling&&g.api.state().challenge.tension<65);g.tick(16)}
 assert.equal(g.api.state().bag.length,1);assert.equal(g.save().bag.length,1);assert.ok(g.draw().catchEffect);const value=g.api.state().bag[0][1];
 Object.assign(g.api.state().player,{x:7,y:2});g.api.store(true);g.el('sell').onclick();assert.equal(g.api.state().coins,100+value);assert.equal(g.api.state().bag.length,0);
 g.el('rods').children[0].onclick();assert.equal(g.api.state().coins,100+value-65);assert.equal(g.api.state().rodLevel,1);
 const reload=game(g.save());assert.equal(reload.api.state().rodLevel,1);assert.equal(reload.api.state().coins,100+value-65);
 g.tick(3100);assert.equal(g.draw().catchEffect,null);
});
test('lake and cabin are solid while vendor and dock access remain open',()=>{
 const g=game();assert.equal(g.api.land(-3,-2),false);assert.equal(g.api.land(8,0),false);assert.equal(g.api.land(7,2),true);assert.equal(g.api.land(6,4.1),true);assert.equal(g.api.land(-.5,-2),true);
});
test('screen-down input projects vertically and Escape cancels a cast',()=>{
 const g=game();g.api.startGame();g.document.dispatch('keydown',{key:'ArrowDown',code:'ArrowDown'});g.tick(70);const p=g.api.state().player;assert.ok(Math.abs(p.x+.32*p.y)<1e-10);assert.ok(p.y>0);
 Object.assign(p,{x:-.2,y:-2});g.api.fish();g.document.dispatch('keydown',{key:'Escape',code:'Escape'});assert.equal(g.api.state().fishState,'ready');
});
