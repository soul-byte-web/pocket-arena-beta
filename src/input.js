// src/input.js
export function createInput(canvas){
  const state = { mx:0, my:0, mouseDown:false, touch:false, gamepad:null };
  window.addEventListener('mousemove', e=>{ state.mx = e.clientX; state.my = e.clientY; });
  window.addEventListener('mousedown', e=>{ state.mouseDown=true; }); window.addEventListener('mouseup', e=>{ state.mouseDown=false; });
  window.addEventListener('touchstart', e=>{ state.touch=true; const t=e.touches[0]; state.mx=t.clientX; state.my=t.clientY; }, {passive:false});
  window.addEventListener('touchmove', e=>{ const t=e.touches[0]; state.mx=t.clientX; state.my=t.clientY; }, {passive:false});
  window.addEventListener('touchend', e=>{ state.touch=false; });
  return state;
}
