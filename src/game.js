// src/game.js
import { loadAssets } from './assetLoader.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { Weapons, Upgrades } from './items.js';

export class Game {
  constructor(canvas){ this.canvas = canvas; this.width = canvas.clientWidth; this.height = canvas.clientHeight; this.assets = null; this.renderer = null; this.input = createInput(canvas); this.state='idle';
    this.player = {x:0,y:0,radius:18,hp:100,maxHp:100,xp:0,xpNext:12,lvl:1,speed:260,damage:10,fireRate:3.2,fireTimer:0,weapon:Weapons.pistol,alive:true};
    this.bullets = []; this.enemies = []; this.gems = []; this.particles = []; this.score=0; this.wave=0; this.loopHandle=null;
  }
  async init(){ this.assets = await loadAssets(); this.renderer = createRenderer(this.canvas, this.assets); this.assets.audio.playTone?.(); }
  start(){ this.state='playing'; this.last = performance.now(); requestAnimationFrame(this.loop.bind(this)); }
  reset(){ this.player.x=0; this.player.y=0; this.player.hp=this.player.maxHp; this.bullets.length=0; this.enemies.length=0; this.gems.length=0; this.particles.length=0; this.wave=0; this.score=0; this.spawnWave(); }
  spawnWave(){ this.wave++; const count = 6 + Math.floor(this.wave*1.6); for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2; const r=400+Math.random()*600; this.enemies.push({x:Math.cos(a)*r, y:Math.sin(a)*r, vx:0,vy:0,speed:80+Math.random()*120+this.wave*6, hp:20+this.wave*6, maxHp:20+this.wave*6, type:i%3, radius:12}); } }
  spawnBullet(x,y,vx,vy,dmg){ this.bullets.push({x,y,vx,vy,dmg,life:1.6}); this.assets.audio.shoot(); }
  loop(now){ const dt = Math.min(0.05, (now - this.last)/1000); this.last=now; this.update(dt); this.renderer.present(this.player,this.enemies,this.bullets,this.gems,this.particles); requestAnimationFrame(this.loop.bind(this)); }
  update(dt){ if(this.state!=='playing') return; // input target
    const mx = this.input.mx - window.innerWidth/2; const my = this.input.my - window.innerHeight/2; const tx = mx + this.player.x; const ty = my + this.player.y;
    // auto-fire
    this.player.fireTimer -= dt; if(this.player.fireTimer <= 0){ this.player.weapon.fire(this, this.player, {x:tx,y:ty}); this.player.fireTimer = 1/Math.max(0.1,this.player.fireRate); }
    // bullets
    for(let i=this.bullets.length-1;i>=0;i--){ const b=this.bullets[i]; b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt; if(b.life<=0) this.bullets.splice(i,1); else{ for(let j=this.enemies.length-1;j>=0;j--){ const e=this.enemies[j]; const rr=(e.radius+4); if((b.x-e.x)*(b.x-e.x)+(b.y-e.y)*(b.y-e.y) < rr*rr){ e.hp -= b.dmg; this.bullets.splice(i,1); if(e.hp<=0){ this.killEnemy(e,j); } break; } } } }
    // enemies
    for(const e of this.enemies){ const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x); e.x += Math.cos(ang)*e.speed*dt; e.y += Math.sin(ang)*e.speed*dt; if((e.x-this.player.x)*(e.x-this.player.x)+(e.y-this.player.y)*(e.y-this.player.y) < (e.radius+this.player.radius||20)*(e.radius+this.player.radius||20)){ this.player.hp -= e.speed*dt*0.02; if(this.player.hp<=0){ this.player.alive=false; this.gameOver(); } } }
    // gems
    for(let i=this.gems.length-1;i>=0;i--){ const g=this.gems[i]; const d2=(g.x-this.player.x)*(g.x-this.player.x)+(g.y-this.player.y)*(g.y-this.player.y); if(d2 < 30*30){ this.grantXP(g.value); this.gems.splice(i,1); } else if(d2 < 200*200){ const a=Math.atan2(this.player.y-g.y,this.player.x-g.x); g.vx += Math.cos(a)*dt*200; g.vy += Math.sin(a)*dt*200; g.x += g.vx*dt; g.y += g.vy*dt; } }
    // spawn wave
    if(this.enemies.length < 2) this.spawnWave();
  }
  killEnemy(e, idx){ this.score += 10; for(let i=0;i<10;i++) this.particles.push({x:e.x,y:e.y,vx:(Math.random()-0.5)*220,vy:(Math.random()-0.5)*220,life:0.6}); this.gems.push({x:e.x,y:e.y,vx:0,vy:0,value:2}); this.enemies.splice(idx,1); this.assets.audio.boom(); }
  grantXP(v){ this.player.xp += v; while(this.player.xp >= this.player.xpNext){ this.player.xp -= this.player.xpNext; this.player.lvl++; this.player.xpNext = Math.floor(this.player.xpNext*1.25 + 4); this.openLevelUp(); } document.getElementById('xpFill').style.width = Math.max(0,Math.min(100,(this.player.xp/this.player.xpNext)*100))+'%'; }
  openLevelUp(){ this.state='levelup'; const row=document.getElementById('cardRow'); row.innerHTML=''; const choices = this.pickUpgrades(3); for(const u of choices){ const div=document.createElement('div'); div.className='card'; div.innerHTML = '<div style="font-weight:800;color:#fff">'+u.name+'</div><div style="color:#9fdcff;margin:6px 0">'+(u.desc||'')+'</div>'; div.addEventListener('click', ()=>{ u.apply(this.player); document.getElementById('levelup').style.display='none'; this.state='playing'; }); row.appendChild(div); } document.getElementById('levelup').style.display='flex'; }
  pickUpgrades(n){ const pool = Upgrades.slice(); const out=[]; for(let i=0;i<n;i++){ if(pool.length===0) break; const idx=Math.floor(Math.random()*pool.length); out.push(pool[idx]); pool.splice(idx,1); } return out; }
  gameOver(){ this.state='gameover'; document.getElementById('gameoverScreen').style.display='flex'; document.getElementById('gameoverStats').innerHTML = 'Score: <b>'+this.score+'</b><br>Wave: <b>'+this.wave+'</b><br>Level: <b>'+this.player.lvl+'</b>'; }
}
