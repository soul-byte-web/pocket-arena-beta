// src/assetLoader.js
export async function loadAssets(){
  // Procedural atlas as fallback + loader for external assets when added
  const atlas = (function(){
    const cell = 48; const scale = 2; const cols=8, rows=8;
    const c = document.createElement('canvas'); c.width = cols*cell*scale; c.height = rows*cell*scale;
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    function px(x,y,col){ ctx.fillStyle=col; ctx.fillRect(x*scale,y*scale,scale,scale); }
    function drawPlayer(cx,cy){ const offx=cx*cell*scale, offy=cy*cell*scale; for(let y=2;y<10;y++) for(let x=4;x<12;x++) px((offx/scale)+x,(offy/scale)+y,'#bdfcff'); px((offx/scale)+7,(offy/scale)+1,'#6ef6ff'); }
    function drawEnemy(cx,cy,color){ const offx=cx*cell*scale, offy=cy*cell*scale; for(let y=3;y<12;y++) for(let x=3;x<12;x++) px((offx/scale)+x,(offy/scale)+y,color); px((offx/scale)+6,(offy/scale)+5,'#000'); }
    function drawBullet(cx,cy,color){ const offx=cx*cell*scale, offy=cy*cell*scale; px((offx/scale)+7,(offy/scale)+6,color); px((offx/scale)+7,(offy/scale)+5,color); px((offx/scale)+7,(offy/scale)+4,color); }
    drawPlayer(0,0); drawEnemy(1,0,'#4dff9e'); drawEnemy(2,0,'#ff8a3d'); drawEnemy(3,0,'#c98cff'); drawBullet(5,0,'#bdfcff');
    return { canvas:c, cell:cell*scale, drawSprite(name, ctx, x, y, opts={}){ const map={player:[0,0],enemy1:[1,0],enemy2:[2,0],enemy3:[3,0],bullet:[5,0]}; const p=map[name]||[5,0]; const sx=p[0]*this.cell, sy=p[1]*this.cell; const w=this.cell,h=this.cell; const s=opts.scale||1; ctx.save(); ctx.imageSmoothingEnabled=false; if(opts.angle) ctx.rotate(opts.angle); ctx.drawImage(this.canvas, sx, sy, w, h, x-w/2*s, y-h/2*s, w*s, h*s); ctx.restore(); } };
  })();

  // Audio placeholders
  const audio = (function(){
    const ctx = new (window.AudioContext||window.webkitAudioContext)(); const master = ctx.createGain(); master.gain.value=0.12; master.connect(ctx.destination);
    function playTone(freq,d=0.08,type='sine',vol=0.6){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=f; o.connect(g); g.connect(master); g.gain.value=vol; o.start(); o.stop(ctx.currentTime+d); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+d); }
    return { ctx, playTone, shoot:()=>playTone(900,0.08,'sawtooth',0.12), boom:()=>{playTone(160,0.6,'sine',0.6); playTone(600,0.12,'triangle',0.18);} };
  })();

  return { atlas, audio };
}
