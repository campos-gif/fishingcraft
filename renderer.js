/* Costa Voxel. All geometry shares x'=x+.32y, y'=.70y-z.
   Rendering is isolated from world rules, inventory and persistence. */
window.FishingCraftRenderer = (() => {
  const trees=[[-8,-6,1.15],[-5,-6,1],[1,-6,1.2],[8,-6,1.1],[-9,0,1],[1,1,.9],[3,-3,1.15],[-7,3,.85],[5,-6,1],[-8,-3,1.15]];
  const noise=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)};
  const camera={x:0,y:0,last:0,initialized:false};
  function draw(c,g){
    const {W,H,now,player,ship,onBoat,boatLevel,fishState}=g,t=now/1000,moving=g.moving&&!g.paused;
    const s=Math.max(30,Math.min(W/13.5,H/12,62)),focus=onBoat?ship:player;
    const dt=Math.min(.1,Math.max(0,(now-camera.last)/1000));camera.last=now;
    if(!camera.initialized){camera.x=focus.x;camera.y=focus.y;camera.initialized=true}
    const follow=1-Math.exp(-dt*9);camera.x+=(focus.x-camera.x)*follow;camera.y+=(focus.y-camera.y)*follow;
    const ox=W*.5-(camera.x+.32*camera.y)*s,oy=H*.54-camera.y*.7*s;
    const p=(x,y,z=0)=>[ox+(x+.32*y)*s,oy+(y*.7-z)*s];
    const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
    const plane=(x,y,w,h,color,z=0)=>poly([p(x,y,z),p(x+w,y,z),p(x+w,y+h,z),p(x,y+h,z)],color);
    const line=(pts,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
    const visible=(x,y,pad=4)=>{const [a,b]=p(x,y);return a>-pad*s&&a<W+pad*s&&b>-pad*s&&b<H+pad*s};
    function box(x,y,w,d,h,top,front,side,z=0){
      const a=p(x,y,z+h),b=p(x+w,y,z+h),e=p(x+w,y+d,z+h),f=p(x,y+d,z+h);
      poly([b,e,p(x+w,y+d,z),p(x+w,y,z)],side);
      poly([f,e,p(x+w,y+d,z),p(x,y+d,z)],front);
      poly([a,b,e,f],top);line([a,b,e],'#ffffff12');
    }
    function shadow(x,y,w,d){poly([p(x-w*.45,y-d*.4,.015),p(x+w*.4,y-d*.4,.015),p(x+w*.85,y+d,.015),p(x-w*.1,y+d,.015)],'#173f3338')}
    function label(x,y,z,text,color='#fff2c7',size=11){const [a,b]=p(x,y,z);c.font='700 '+size+'px system-ui';c.textAlign='center';const width=c.measureText(text).width;c.fillStyle='#102e3be0';c.fillRect(a-width/2-8,b-14,width+16,21);c.fillStyle=color;c.fillText(text,a,b)}
    c.clearRect(0,0,W,H);
    const sea=c.createLinearGradient(0,0,W,H);sea.addColorStop(0,'#188dab');sea.addColorStop(.55,'#117e9d');sea.addColorStop(1,'#075376');c.fillStyle=sea;c.fillRect(0,0,W,H);
    plane(-12,-10,24,17,'#289fae',-.2);plane(-11.2,-9.2,22.4,15.4,'#43bdbe',-.16);
    for(let x=-11;x<11;x++){const offset=noise(x,7)*.45;plane(x,5.2+offset,1,1,'#63d1c2',-.1);plane(x,-9-offset,1,.7,'#56c9bd',-.1)}
    // Inverse projection gives visible wave bounds at every camera position.
    const ymin=Math.floor(-oy/(s*.7))-1,ymax=Math.ceil((H-oy)/(s*.7))+1;
    for(let y=ymin;y<=ymax;y++){
      const xmin=Math.floor(-ox/s-.32*y)-1,xmax=Math.ceil((W-ox)/s-.32*y)+1;
      for(let x=xmin;x<=xmax;x++){
        if(x>=-10&&x<10&&y>=-8&&y<5)continue;
        const n=noise(x,y);if(n<.53)continue;const wave=Math.sin(t*1.3+n*11);
        line([p(x+.12,y+.4+wave*.04,-.08),p(x+.42,y+.4+wave*.04,-.08),p(x+.52,y+.34+wave*.04,-.08)],'rgba(189,247,228,'+(.06+(wave+1)*.08)+')',1.3);
        if(n>.93)plane(x+.3,y+.5,.055,.055,'#d4fbeb88',-.08);
      }
    }
    for(let i=0;i<12;i++){const x=-10.7+i*1.9,y=5.5+Math.sin(t*.7+i)*.13;line([p(x,y,-.08),p(x+.6,y,-.08)],'#ceffdd9a',2)}
    box(-10,-8,20,13,.55,'#d5be80','#a07d51','#826544',-.78);
    box(-10,-8,20,13,.23,'#e6cf92','#dab979','#bba064',-.23);
    for(let x=-10;x<10;x++)line([p(x,5,-.25),p(x,5,-.7)],'#6e60483a');
    for(let y=-8;y<5;y++)for(let x=-10;x<10;x++){
      if(!visible(x,y,2))continue;
      const n=noise(x,y),lake=Math.hypot(x+.5+3,y+.5+2),beach=x===-10||x===9||y===-8||y===4;
      const col=lake<2.2?'#329da6':lake<2.95?'#b5c88a':beach?'#e9d49b':['#74ad50','#7db557','#82ba5a','#79b251'][Math.floor(n*4)];
      plane(x,y,1.005,1.005,col);
      if(lake<2.2){plane(x+.12,y+.2,.62,.4,'#4eb8b529');line([p(x+.1,y+.6+Math.sin(t+n)*.05),p(x+.55,y+.6+Math.sin(t+n)*.05)],'#aff0d572');continue}
      for(let j=0;j<4;j++){const tx=noise(x+j,y+7),ty=noise(x-9,y+j);plane(x+tx*.75,y+ty*.8,.12+tx*.18,.09,beach?'#f9e7b377':j%2?'#c8df842d':'#427b3425',.002)}
      if(!beach&&lake>3&&n>.8){box(x+.22,y+.5,.05,.05,.13,'#a2cc6f','#5c963e','#508436');box(x+.4,y+.56,.05,.05,.19,'#afd575','#659c45','#508436')}
    }
    for(let i=0;i<4;i++){const x=-3+Math.sin(t*.26+i*2)*1.35,y=-2+Math.cos(t*.2+i*2)*.8;plane(x,y,.28,.1,'#155f6b60');plane(x-.08,y-.04,.07,.18,'#155f6b60')}
    for(const [x,y] of [[-5.5,-1],[-4.8,-3.9],[-1,-3.5],[-2,.6]])for(let i=0;i<3;i++){box(x+i*.11,y,.04,.04,.35+i*.1,'#b8ca73','#668f49','#55793b');box(x+i*.11,y,.08,.08,.12,'#d8be74','#aa8c4b','#927840',.3+i*.1)}
    for(let x=1;x<8;x++){box(x,2.65,.8,.48,.045,'#d6c58c','#b3a372','#bbae7c');plane(x+.06,2.69,.64,.05,'#eddfae',.05)}
    for(let y=3;y<8;y+=.28){box(5,y,3.4,.25,.13,Math.floor(y*4)%2?'#be905b':'#cca16b','#987046','#aa8051');line([p(5.1,y+.12,.135),p(8.25,y+.12,.135)],'#edc89155');for(const x of [5.25,8.1])plane(x,y+.1,.045,.045,'#5e5344',.14)}
    const objects=[];
    for(const x of [5.1,8.2])for(const y of [4,5.8,7.6])objects.push({y:y+.18,draw(){box(x,y,.18,.18,.78,'#e0bc83','#9c784d','#795c3c',-.15);box(x-.03,y-.03,.24,.24,.09,'#f0d199','#ba9864','#947544',.63);if(y===7.6){box(x+.02,y+.02,.12,.12,.24,'#ffdf81','#edb952','#ca8f37',.73);box(x-.03,y-.03,.22,.22,.06,'#3b5553','#293e3f','#233438',.97)}}});
    function leaf(x,y,w,d,h,z,tone=0){box(x,y,w,d,h,tone?'#9cc968':'#86bd59',tone?'#55923f':'#43833c',tone?'#447b38':'#346b35',z);for(let i=0;i<5;i++){const n=noise(x+i,y);plane(x+n*w*.75,y+noise(x,y+i)*d*.75,w*.17,d*.15,i%2?'#c4e38936':'#244f2926',z+h+.002)}}
    for(const [x,y,size] of trees)objects.push({y:y+.2,draw(){
      if(!visible(x,y))return;shadow(x,y,size*1.8,size*.9);
      const hidden=!onBoat&&Math.abs(player.x-x)<1.5*size&&player.y<y+.5&&player.y>y-3.6*size;
      c.save();if(hidden)c.globalAlpha=.38;
      box(x-.16,y-.15,.32,.3,1.8*size,'#c4a06c','#826442','#624e38');for(let j=0;j<3;j++)box(x-.165,y+.152,.33,.02,.055,'#95734c','#6d5438','#6d5438',.25+j*.4);
      const sway=Math.sin(t*.9+x)*.025;
      leaf(x-size*.85+sway,y-size*.6,size*1.7,size*1.2,.7*size,1.25*size);
      leaf(x-size*.62+sway,y-size*.5,size*1.23,size,.6*size,1.95*size,1);
      leaf(x-size*.32+sway,y-size*.3,size*.64,size*.6,.4*size,2.55*size,1);
      c.restore();
    }});
    for(const [x,y,size] of [[-9,3,.5],[9,-4,.65],[-6,-7,.55],[4,3,.38]])objects.push({y:y+.3,draw(){shadow(x,y,size,.5);box(x,y,size,.5,size*.6,'#9cae9f','#788b81','#64786f');box(x+.1,y+.05,size*.65,.35,.14,'#b5c0a6','#879b8a','#728879',size*.6)}});
    for(const [x,y] of [[-6,2],[2,-5],[5,-4],[-7,-5],[2,3]])objects.push({y,draw(){for(let i=0;i<3;i++){box(x+i*.17,y,.04,.04,.2,'#92b94e','#46743a','#426d35');box(x+i*.17-.05,y-.04,.14,.12,.07,i%2?'#f6db88':'#f0bfa5',i%2?'#e5b757':'#d98c76','#be965a',.2)}}});
    objects.push({y:1.55,draw(){box(9,1,.55,.5,.48,'#d9af75','#b58956','#8d6a43');for(const z of [.08,.34])line([p(9,1.51,z),p(9.55,1.51,z)],'#e9c68b',2);line([p(9.1,1.51,.05),p(9.45,1.51,.44)],'#795c3e',2);box(9.1,1.1,.34,.3,.3,'#d9be84','#a78554','#947346',.48)}});
    objects.push({y:1.15,draw(){
      shadow(8,.3,2.4,1.5);box(7.2,-.8,2,1.7,1.55,'#e7cca0','#cda06d','#9f784e');
      for(let z=.2;z<1.5;z+=.24)line([p(7.2,.905,z),p(9.2,.905,z)],'#a6815760');
      for(let i=0;i<4;i++)box(7.02+i*.18,-1.02,2.36-i*.36,2.1,.22,'#5b8991','#3c6873','#2a515e',1.55+i*.22);
      box(7.56,.91,.5,.04,1.03,'#a37b49','#594d37','#594d37');box(8.36,.92,.55,.06,.51,'#e7c986','#f7dc92','#ba9c64',.64);
      line([p(8.63,.99,.65),p(8.63,.99,1.14)],'#8e7654',2);line([p(8.36,.99,.9),p(8.9,.99,.9)],'#8e7654',2);
      box(6.8,1.2,1.25,.45,.55,'#e7cc94','#aa7849','#815b3c');
      for(let x=6.8;x<8;x+=.26)box(x,1.05,.25,.8,.06,'#e6bf74',x%1>.5?'#8faaa0':'#e0c792','#b69f6d',1.65);
      for(const x of [6.85,7.95])box(x,1.75,.055,.06,1.65,'#caad79','#9c794c','#82613d');
      label(8,.15,2.85,'PESCARIA DO ZÉ','#ffe9b7',Math.max(10,s*.19));
    }});
    function person(x,y,npc=false,z=0){
      shadow(x,y,.7,.36);const step=!npc&&moving?Math.sin(t*12)*.09:0;
      for(const [offset,leg] of [[-.23,step],[.06,-step]]){box(x+offset,y-.13,.17,.25,.42,'#59666b','#3b5057','#2e3d49',z+Math.max(0,leg));box(x+offset-.02,y-.02,.2,.28,.13,'#574f42','#3c3932','#2b302e',z+Math.max(0,leg))}
      box(x-.25,y-.15,.5,.32,.58,npc?'#f0cd7c':'#81b6ad',npc?'#b8894b':'#4c918c',npc?'#94743d':'#386e73',z+.4);
      box(x-.12,y+.18,.24,.035,.37,'#ebd4a1',npc?'#9b733f':'#c1af80','#9f916b',z+.44);
      const arm=fishState==='fight'&&!npc?.16:0;
      box(x-.36,y-.09,.12,.18,.43,'#f5c599','#deb184','#bd8d66',z+.48);box(x+.25,y-.09,.12,.18,.43,'#f5c599','#deb184','#bd8d66',z+.48+arm);
      box(x-.22,y-.18,.44,.36,.4,'#f8d8aa','#e9b887','#c89569',z+.98);
      for(const xx of [-.13,.08]){const [a,b]=p(x+xx,y+.185,z+1.22);c.fillStyle='#263c3d';c.fillRect(a,b,Math.max(2,s*.045),Math.max(2,s*.055))}
      box(x-.35,y-.29,.7,.6,.075,'#f3db9e','#bfa36d','#9d8359',z+1.39);box(x-.22,y-.18,.44,.36,.2,'#f5e3b1','#ccb580','#b09b6b',z+1.465);
      box(x-.225,y-.185,.45,.37,.055,'#7c8364','#546b60','#3d5550',z+1.48);
      if(!npc)line([p(x+.35,y,z+.65),p(x+.8,y,z+1.85)],'#765c3b',Math.max(2,s*.04));
    }
    objects.push({y:2.2,draw(){person(7,2,true)}});
    if(!onBoat)objects.push({y:player.y+.2,draw(){person(player.x,player.y)}});
    const bx=onBoat?ship.x:6.7,by=onBoat?ship.y:6.4,angle=onBoat?ship.angle:0;
    objects.push({y:by+.7,draw(){
      const bob=Math.sin(t*1.8)*.035,ca=Math.cos(angle),sa=Math.sin(angle);
      const bp=(x,y,z=0)=>p(bx+x*ca-y*sa,by+x*sa+y*ca,z+bob);
      const shape=[[-.55,-.85],[.55,-.85],[.63,.42],[.22,.99],[-.22,.99],[-.63,.42]];
      const top=shape.map(([x,y])=>bp(x,y,.19));
      poly(shape.map(([x,y])=>bp(x+.12,y+.08,-.12)),'#123d5545');
      if(onBoat&&moving)for(let i=0;i<3;i++){const r=(t*1.3+i*.333)%1;line([bp(-.45-r*.5,-.7-r*1.5,-.04),bp(0,-.95-r*1.5,-.04),bp(.45+r*.5,-.7-r*1.5,-.04)],'rgba(213,247,224,'+((1-r)*.65)+')',1.5)}
      for(let i=0;i<shape.length;i++){const j=(i+1)%shape.length;poly([top[i],top[j],bp(shape[j][0],shape[j][1],-.15),bp(shape[i][0],shape[i][1],-.15)],i%2?'#795b39':'#987447')}
      poly(top,['#d9b478','#e7e0be','#8fb7af','#f6ebc9'][boatLevel]);poly(shape.map(([x,y])=>bp(x*.76,y*.8,.19)),'#806342');
      for(const y of [-.4,.18])poly([bp(-.43,y,.24),bp(.43,y,.24),bp(.43,y+.15,.24),bp(-.43,y+.15,.24)],'#e7c591');
      if(boatLevel>0){poly([bp(-.33,-.75,.6),bp(.33,-.75,.6),bp(.33,-.23,.6),bp(-.33,-.23,.6)],'#f5e9c9');poly([bp(-.3,-.23,.6),bp(.3,-.23,.6),bp(.3,-.23,.25),bp(-.3,-.23,.25)],'#5f9ba7')}
      if(onBoat)person(bx,by,false,.2+bob);
    }});
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    if(fishState!=='ready'){
      const pos=onBoat?ship:player;let target={x:pos.x+1.8,y:pos.y+2};
      if(!onBoat){if(Math.hypot(pos.x+3,pos.y+2)<3.5)target={x:-3,y:-2};else target=[{d:pos.x+10,x:-10.8,y:pos.y},{d:10-pos.x,x:10.8,y:pos.y},{d:pos.y+8,x:pos.x,y:-8.8},{d:5-pos.y,x:pos.x,y:5.8}].sort((a,b)=>a.d-b.d)[0]}
      const progress=g.challenge?g.challenge.progress/100:0,fighting=fishState==='fight';
      const tx=target.x+(pos.x-target.x)*progress*.72,ty=target.y+(pos.y-target.y)*progress*.72;
      const [fx,fy]=p(tx,ty),wiggle=fighting?Math.sin(t*14)*(g.challenge.struggling?7:2):Math.sin(t*5)*2;
      const tip=p(pos.x+.8,pos.y,1.85+(onBoat?.2:0));
      line([tip,[(tip[0]+fx)/2,(tip[1]+fy)/2+(fighting?0:15)],[fx+wiggle,fy]],g.challenge&&g.challenge.tension>72?'#fa9071':'#f8f1d6bb',1.4);
      for(let i=0;i<3;i++){const r=(t*1.2+i/3)%1;line([[fx-5-r*14,fy+r*5],[fx-r*3,fy+3+r*5],[fx+8+r*14,fy+r*5]],'rgba(211,255,235,'+((1-r)*.55)+')',1.4)}
      if(fighting){poly([[fx-10+wiggle,fy-4],[fx+8+wiggle,fy-4],[fx+11+wiggle,fy],[fx+8+wiggle,fy+4],[fx-10+wiggle,fy+4]],'#d6e2a8');poly([[fx-10+wiggle,fy],[fx-17+wiggle,fy-7],[fx-17+wiggle,fy+6]],'#74b1ac');c.fillStyle='#234d57';c.fillRect(fx+5+wiggle,fy-2,2,2)}
      else{c.fillStyle=fishState==='bite'?'#ffda64':'#ed7359';c.fillRect(fx-3,fy+wiggle-4,6,7);c.fillStyle='#fff2cc';c.fillRect(fx-3,fy+wiggle-6,6,3)}
      if(fishState==='bite')label(tx,ty,.6,'! FISGAR','#ffe387',18);
    }
    if(g.catchEffect&&now-g.catchEffect.at<3000){const age=(now-g.catchEffect.at)/1000,pos=onBoat?ship:player;c.save();c.globalAlpha=Math.min(1,3-age);label(pos.x,pos.y,2.2+age*.3,g.catchEffect.name+' · '+g.catchEffect.value+' moedas','#ffe49c',13);c.restore()}
    const light=c.createLinearGradient(0,0,W,H);light.addColorStop(0,'#ffe7b00a');light.addColorStop(1,'#033a6012');c.fillStyle=light;c.fillRect(0,0,W,H);
    if(H>=550)minimap(c,W,player,ship,onBoat);
  }
  function minimap(c,W,player,ship,onBoat){
    const small=W<520,w=small?84:112,h=small?78:100,x=W-w-14,y=16;
    c.fillStyle='#123a45ef';c.fillRect(x,y,w,h);c.strokeStyle='#8ea887';c.lineWidth=2;c.strokeRect(x,y,w,h);
    const ymax=onBoat?Math.max(12,ship.y+5):12,sx=(w-14)/24,sy=(h-30)/(ymax+10);
    const map=(wx,wy)=>[x+7+(wx+12)*sx,y+20+(wy+10)*sy];
    const [a,b]=map(-10,-8);c.fillStyle='#b5cb86';c.fillRect(a,b,20*sx,13*sy);
    const [lx,ly]=map(-5.2,-4.2);c.fillStyle='#3f9eaa';c.fillRect(lx,ly,4.4*sx,4.4*sy);
    const [dx,dy]=map(5,4);c.fillStyle='#dfbf82';c.fillRect(dx,dy,3.4*sx,4*sy);
    const [mx,my]=map(7,2);c.fillStyle='#ffdb7c';c.fillRect(mx-2,my-2,4,4);
    const pos=onBoat?ship:player,[px,py]=map(pos.x,pos.y);c.fillStyle='#fff9da';c.fillRect(Math.max(x+3,Math.min(x+w-6,px-2)),py-2,5,5);
    c.font='700 '+(small?8:9)+'px system-ui';c.textAlign='left';c.fillStyle='#dce8c8';c.fillText('N ↑  CAIS ◆',x+7,y+12);
    c.textAlign='center';c.fillStyle='#e9ddac';c.fillText(onBoat?(ship.y>38?'ALTO-MAR':ship.y>19?'MAR ABERTO':'COSTA'):'COSTA VOXEL',x+w/2,y+h-6);
  }
  return {draw};
})();
