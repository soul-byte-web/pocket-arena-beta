// src/renderer.js
export function createRenderer(canvas, assets){
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const atlas = assets.atlas;
  function clear(){ ctx.fillStyle='#07070a'; ctx.fillRect(0,0,canvas.width,canvas.height); }
  function worldToScreen(x,y){ return [x + canvas.width/2, y + canvas.height/2]; }
  function drawPlayer(p){ const [sx,sy]=worldToScreen(p.x,p.y); atlas.drawSprite('player', ctx, sx, sy, {scale:1.5}); }
  function drawEnemies(list){ for(const e of list){ const [sx,sy]=worldToScreen(e.x,e.y); atlas.drawSprite('enemy'+(e.type+1), ctx, sx, sy, {scale:1.1}); // hp
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(sx-18, sy-e.radius-12, 36,6); ctx.fillStyle='#ff5ef0'; ctx.fillRect(sx-18, sy-e.radius-12, 36*Math.max(0,e.hp/e.maxHp), 6);
    } }
  function drawBullets(list){ for(const b of list){ const [sx,sy]=worldToScreen(b.x,b.y); atlas.drawSprite('bullet', ctx, sx, sy, {scale:0.9}); } }
  function drawGems(list){ for(const g of list){ const [sx,sy]=worldToScreen(g.x,g.y); ctx.fillStyle='#7a5cff'; ctx.fillRect(sx-3,sy-3,6,6); } }
  function present(player,enemies,bullets,gems,particles){ clear(); ctx.save(); // simple camera: center on player
    ctx.translate(canvas.width/2 - player.x, canvas.height/2 - player.y);
    // background grid
    ctx.strokeStyle='rgba(255,255,255,0.02)'; ctx.lineWidth=1; const grid=80; for(let x=-2000;x<2000;x+=grid){ ctx.beginPath(); ctx.moveTo(x,-2000); ctx.lineTo(x,2000); ctx.stroke(); }
    for(let y=-2000;y<2000;y+=grid){ ctx.beginPath(); ctx.moveTo(-2000,y); ctx.lineTo(2000,y); ctx.stroke(); }

    // arena ring
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(0,0,1600,0,Math.PI*2); ctx.stroke();

    // draw entities
    drawGems(gems);
    drawEnemies(enemies);
    drawBullets(bullets);
    drawPlayer(player);

    // particles
    for(const p of particles){ ctx.fillStyle='rgba(200,240,255,0.9)'; ctx.fillRect(p.x-2,p.y-2,4,4); }

    ctx.restore(); }
  return {present};
}
