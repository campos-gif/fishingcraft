/* Deterministic fishing challenge, independent of canvas and DOM. */
(function(root){
  function create(value,rod){return {progress:12,tension:18,elapsed:0,struggling:false,result:null,difficulty:Math.min(1.7,1+value/400),rod};}
  function step(f,dt,held){
    if(f.result)return f.result;
    f.elapsed+=dt;f.struggling=f.elapsed%4.6>2.5;
    f.tension=Math.max(0,Math.min(100,f.tension+dt*(held?(f.struggling?42:12)*f.difficulty/(1+f.rod*.18):-32)));
    f.progress=Math.max(0,Math.min(100,f.progress+dt*(held?(f.struggling?3:21)*(1+f.rod*.12)/f.difficulty:-3)));
    if(f.tension>=100)f.result='broken';else if(f.progress>=100)f.result='caught';else if(f.elapsed>=40)f.result='escaped';
    return f.result;
  }
  root.FishingChallenge={create,step};
})(typeof window==='undefined'?globalThis:window);
