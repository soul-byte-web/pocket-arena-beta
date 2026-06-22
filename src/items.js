// src/items.js
// Simple item/weapon framework for Phase 1: weapons are functions that spawn bullets
export const Weapons = {
  pistol: {
    name:'Pistol', fireRate:3.2, fire(ctx, player, target){ const a=Math.atan2(target.y-player.y, target.x-player.x); ctx.spawnBullet(player.x, player.y, Math.cos(a)*720, Math.sin(a)*720, player.damage); }
  },
  shotgun: {
    name:'Shotgun', fireRate:1.2, fire(ctx, player, target){ const a=Math.atan2(target.y-player.y, target.x-player.x); const count=5; for(let i=0;i<count;i++){ const t=(i/(count-1)-0.5)*0.32; const ang=a+t; ctx.spawnBullet(player.x, player.y, Math.cos(ang)*620, Math.sin(ang)*620, player.damage*0.9); } }
  }
};

export const Upgrades = [ {key:'dmg',name:'Power Cells', apply:p=>p.damage*=1.12}, {key:'firerate',name:'Rapid Fire', apply:p=>p.fireRate*=1.15}, {key:'hp',name:'Vital Core', apply:p=>{p.maxHp+=20; p.hp+=20;}} ];
