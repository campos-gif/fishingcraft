/* Presentation only: coordinates, economy and save format remain owned by the game. */
window.FishingCraftRenderer = (() => {
  const trees=[[-8,-6],[-5,-6],[1,-6],[8,-6],[-9,0],[1,1],[3,-3],[-7,3],[5,-6],[-8,-3]];
  const noise=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)};
  function draw(c,g){
    const {W,H,now,player,ship,onBoat,boatLevel,fishState,moving}=g,t=now/1000;
    const s=Math.max(30,Math.min(W/16,H/15,52)),sy=s*.78,focus=onBoat?ship:player;
    const ox=W*.5-focus.x*s,oy=H*.54-focus.y*sy;
    const p=(x,y,z=0)=>[ox+x*s-z*s*.22,oy+y*sy-z*s];
    const polygon=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
    const ground=(x,y,w,h,color,z=0)=>polygon([p(x,y,z),p(x+w,y,z),p(x+w,y+h,z),p(x,y+h,z)],color);
    const line=(pts,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
    const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
    function block(x,y,w,d,h,top,front,side,z=0){
      const a=p(x,y,z+h),b=p(x+w,y,z+h),e=p(x+w,y+d,z+h),f=p(x,y+d,z+h);
      polygon([f,e,p(x+w,y+d,z),p(x,y+d,z)],front);
      polygon([b,e,p(x+w,y+d,z),p(x+w,y,z)],side);
      polygon([a,b,e,f],top);line([a,b,e], '#ffffff16');
    }
    function shadow(x,y,size){const [a,b]=p(x,y);ellipse(a+size*s*.25,b,size*s*.65,size*sy*.27,'#173e3630')}
    c.clearRect(0,0,W,H);
    const sea=c.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#157d9c');sea.addColorStop(1,'#084b76');c.fillStyle=sea;c.fillRect(0,0,W,H);
    // Shallow coastal shelf and gentle, world-anchored wavelets.
    ground(-11.4,-9.4,22.8,15.8,'#269caa');ground(-10.8,-8.8,21.6,14.6,'#52b9b3');
    for(let y=Math.floor((0-oy)/sy)-1;y<(H-oy)/sy+1;y++)for(let x=Math.floor(-ox/s)-1;x<(W-ox)/s+1;x++){
      const n=noise(x,y),[a,b]=p(x+.2,y+.5);if(n>.55){const v=Math.sin(t*1.6+n*9);line([[a,b+v*2],[a+s*.25,b+v*2],[a+s*.36,b-1+v*2]],`rgba(188,239,232,${.08+(v+1)*.06})`,1.4)}
    }
    // Raised sand ledge with layered soil, grass and a recessed lake.
    block(-10,-8,20,13,.22,'#e4cc91','#b69a67','#c7ae78',-.22);
    for(let y=-8;y<5;y++)for(let x=-10;x<10;x++){
      const n=noise(x,y),lake=Math.hypot(x+.5+3,y+.5+2);
      const beach=x===-10||x===9||y===-8||y===4;
      const color=lake<2.35?'#348f9d':lake<2.95?'#bfd09a':beach?'#e4cf9d':['#83b66c','#87b96d','#8bbb70','#8ab76a'][Math.floor(n*4)];
      ground(x,y,1.01,1.01,color);
      if(lake<2.35){const [a,b]=p(x+.2,y+.5);line([[a,b],[a+s*.45,b]],'#a9e4d55a',1);continue}
      if(!beach&&lake>3){ground(x+.12,y+.15,.22,.17,'#b8d38925');ground(x+.6,y+.62,.25,.13,'#3d773b12');if(n>.65){const [a,b]=p(x+.35,y+.6);line([[a-2,b],[a-3,b-4],[a,b],[a+2,b-5]],'#477e4e65',1.2)}}
      if(beach&&n>.6){ground(x+.2,y+.4,.07,.05,'#b59d7280');ground(x+.6,y+.7,.1,.05,'#f6e5bc')}
    }
    // Warm stepping-stone path to the fishing shack.
    for(let x=1;x<8;x++){ground(x,2.65,.82,.52,'#c8bc8d');ground(x+.08,2.68,.65,.07,'#e4d9ac')}
    for(let y=3;y<8;y+=.3){block(5,y,3.4,.27,.13,y%1>.5?'#c09a65':'#b98f5d','#856344','#97724c');line([p(5.15,y+.13,.13),p(8.2,y+.13,.13)],'#e4be8c55')}
    for(const x of [5.1,8.2])for(const y of [4,5.8,7.6]){shadow(x,y,.3);block(x,y,.2,.2,.55,'#ecd1a0','#82613e','#a27e4b');ground(x-.02,y-.02,.24,.24,'#f4dcb0',.55)}
    // Sort tall objects by ground depth so characters can pass behind trees.
    const objects=trees.map(([x,y])=>({y,paint(){shadow(x,y,1.6);block(x-.13,y-.12,.28,.28,1.4,'#c4a275','#826347','#a67e51');const sway=Math.sin(t*1.2+x)*.025;block(x-.8+sway,y-.55,1.5,1.2,.75,'#80b46a','#3e7c51','#539458',1.15);block(x-.55+sway,y-.4,1.05,.85,.6,'#a1c578','#57965c','#73a664',1.9)}}));
    function person(x,y,npc=false){shadow(x,y,.7);const step=!npc&&moving?Math.sin(t*12)*.08:0;
      block(x-.22,y-.12,.17,.25,.42,'#334854','#2a3c47','#405663',step);block(x+.06,y-.12,.17,.25,.42,'#334854','#2a3c47','#405663',-step);
      block(x-.25,y-.15,.5,.32,.58,npc?'#e5bc74':'#f3b776',npc?'#bc8355':'#d57b51',npc?'#a9744b':'#b96b48',.4);
      block(x-.34,y-.09,.12,.18,.45,'#f5c599','#dbab7e','#bd8d66',.48);block(x+.25,y-.09,.12,.18,.45,'#f5c599','#dbab7e','#bd8d66',.48);
      block(x-.22,y-.18,.44,.36,.4,'#f8d8aa','#e9b887','#c89569',.98);
      ground(x-.13,y+.185,.055,.01,'#293f45',1.2);ground(x+.08,y+.185,.055,.01,'#293f45',1.2);
      block(x-.36,y-.3,.72,.62,.08,'#efdbad','#b99b67','#d2b985',1.38);block(x-.22,y-.18,.44,.36,.2,'#f6e7bc','#d0b380','#e4cd99',1.46);
      if(!npc)line([p(x+.35,y,.6),p(x+.8,y,1.8)],'#705537',2);
    }
    objects.push({y:1.3,paint(){shadow(8,.4,2);block(7.2,-.8,2,1.7,1.6,'#c9b180','#b98d62','#946e50');block(7,-1,2.4,2.1,.25,'#527d77','#305b59','#426b68',1.6);for(let x=7.1;x<9.3;x+=.3)line([p(x,-1,1.86),p(x,1.1,1.86)],'#a6c0a244');block(7.55,.92,.5,.1,.95,'#886c4b','#463f34','#463f34');block(8.3,.94,.55,.08,.5,'#e4cf97','#91c5bc','#618f8b',.65);block(6.8,1.2,1.25,.45,.55,'#e5c895','#a97f51','#866342');const [a,b]=p(8,.1,2.22);c.font=`bold ${Math.max(10,s*.25)}px system-ui`;c.textAlign='center';c.fillStyle='#f5e7bc';c.fillText('PESCARIA DO ZÉ',a,b)}});
    objects.push({y:2,paint(){person(7,2,true)}});
    if(!onBoat)objects.push({y:player.y,paint(){person(player.x,player.y)}});
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.paint());
    const bx=onBoat?ship.x:6.7,by=onBoat?ship.y:6.4,[a,b]=p(bx,by);
    c.save();c.translate(a,b+Math.sin(t*2)*2);c.scale(s,s*.78);c.rotate(onBoat?ship.angle:0);
    if(onBoat&&moving){for(let i=0;i<3;i++){const r=(t*1.8+i*.33)%1;line([[-.35-r*.5,-.7-r*1.5],[0,-.9-r*1.5],[.35+r*.5,-.7-r*1.5]],`rgba(199,245,230,${(1-r)*.5})`,.035)}}
    ellipse(.1,.18,.74,1.05,'#073e6450');polygon([[-.55,-.8],[.55,-.8],[.62,.45],[0,1.1],[-.62,.45]],'#563f30');polygon([[-.47,-.72],[.47,-.72],[.5,.4],[0,.9],[-.5,.4]],['#c29562','#e9d6a9','#6ca7a1','#f0e8ce'][boatLevel]);
    polygon([[-.34,-.55],[.34,-.55],[.37,.3],[0,.65],[-.37,.3]],'#795a40');for(const y of [-.4,.15])polygon([[-.42,y],[.42,y],[.42,y+.12],[-.42,y+.12]],'#e1bd86');
    if(boatLevel>0){polygon([[-.3,-.65],[.3,-.65],[.3,-.18],[-.3,-.18]],'#f3e8cf');polygon([[-.24,-.57],[.24,-.57],[.24,-.3],[-.24,-.3]],'#468d9d')}
    c.restore();if(onBoat)person(bx,by);
    if(fishState!=='ready'){
      const pos=onBoat?ship:player;
      let target={x:pos.x+1.8,y:pos.y+2};
      if(!onBoat){if(Math.hypot(pos.x+3,pos.y+2)<3.5)target={x:-3,y:-2};else target=[{d:pos.x+10,x:-10.8,y:pos.y},{d:10-pos.x,x:10.8,y:pos.y},{d:pos.y+8,x:pos.x,y:-8.8},{d:5-pos.y,x:pos.x,y:5.8}].sort((a,b)=>a.d-b.d)[0]}
      const progress=g.challenge?g.challenge.progress/100:0;
      const [fx,fy]=p(target.x+(pos.x-target.x)*progress*.75,target.y+(pos.y-target.y)*progress*.75);
      const fighting=fishState==='fight',wiggle=fighting?Math.sin(t*14)*(g.challenge.struggling?7:2):Math.sin(t*5)*2;
      line([p(pos.x+.8,pos.y,1.8),[fx+wiggle,fy]],g.challenge&&g.challenge.tension>72?'#f58e70':'#fff3ccbb',1.3);
      for(let i=0;i<2;i++){const r=(t+i*.5)%1;ellipse(fx,fy,4+r*15,2+r*6,`rgba(220,249,221,${(1-r)*.2})`)}
      if(fighting){polygon([[fx-9+wiggle,fy-3],[fx+7+wiggle,fy-3],[fx+7+wiggle,fy+4],[fx-9+wiggle,fy+4]],'#bdd7b6');polygon([[fx-9+wiggle,fy],[fx-15+wiggle,fy-5],[fx-15+wiggle,fy+5]],'#79aaa4');c.fillStyle='#244d54';c.fillRect(fx+3+wiggle,fy-2,2,2)}
      else{c.fillStyle=fishState==='bite'?'#ffdc72':'#ee775c';c.fillRect(fx-3,fy+wiggle-4,6,7);c.fillStyle='#fff2d2';c.fillRect(fx-3,fy+wiggle-5,6,3)}
      if(fishState==='bite'){c.font='bold 24px system-ui';c.fillStyle='#ffe39b';c.textAlign='center';c.fillText('!',fx,fy-16)}
    }
    const light=c.createLinearGradient(0,0,W,H);light.addColorStop(0,'#ffe4a512');light.addColorStop(1,'#03365618');c.fillStyle=light;c.fillRect(0,0,W,H);
  }
  return {draw};
})();
