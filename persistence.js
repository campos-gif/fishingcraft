/* Keep the v3 save compatible while rejecting corrupted fields. */
(function(root){
  function normalize(value){
    const s=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    const integer=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
    const boatOwned=integer(s.boatOwned,3);
    return {coins:integer(s.coins,Number.MAX_SAFE_INTEGER),
      bag:Array.isArray(s.bag)?s.bag.filter(f=>Array.isArray(f)&&typeof f[0]==='string'&&f[0].trim()&&Number.isSafeInteger(f[1])&&f[1]>=0).map(f=>[f[0],f[1]]):[],
      rodLevel:integer(s.rodLevel,3),boatOwned,boatLevel:integer(s.boatLevel,boatOwned)};
  }
  root.FishingCraftSave={normalize};
})(typeof window==='undefined'?globalThis:window);
