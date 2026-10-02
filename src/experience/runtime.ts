// Trusted static runtime. Never interpolate recipient, imported or AI data here.
export const RECIPIENT_RUNTIME = String.raw`(() => {
'use strict';
const scenes = [...document.querySelectorAll('.gift-scene')];
const next = document.getElementById('stage-next');
const back = document.getElementById('stage-back');
const progress = document.getElementById('stage-progress');
const counter = document.getElementById('stage-counter');
const motionOff = document.getElementById('motion-off');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const intensity = Math.min(3, Math.max(0, Number(document.body.dataset.intensity) || 0));
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const messages = [...document.querySelectorAll('.finale-message')];
const labels = ['Geschenk öffnen', 'Ich bin bereit', 'Meinen Moment entdecken', 'Zu deinen persönlichen Worten', 'Eine kleine Überraschung', 'Okay … eine allerletzte Sache', 'Zum Abschluss'];
let current = 0;
let frame = 0;
let timers = [];
let clockTimer = 0;
const moving = () => intensity > 0 && !reduce.matches && !motionOff.checked && !document.hidden;
const clearFinale = () => { timers.forEach(clearTimeout); timers = []; };
const stopConfetti = () => { cancelAnimationFrame(frame); frame = 0; if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); };
function burst(strong = false) {
  stopConfetti();
  if (!moving() || !ctx) return;
  canvas.width = innerWidth; canvas.height = innerHeight;
  const cap = innerWidth < 640 ? 24 : 64;
  const count = Math.min(cap, Math.ceil((strong ? 64 : 40) * intensity / 3));
  const pieces = Array.from({length: count}, (_, i) => ({x: ((i * 73 + 19) % 101) / 100, y: ((i * 31) % 53) / 100, turn: i % 7}));
  const started = performance.now();
  function draw(now) {
    if (!moving()) { stopConfetti(); return; }
    const t = (now - started) / 1600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (t >= 1) { frame = 0; return; }
    pieces.forEach((p, i) => {
      ctx.save(); ctx.globalAlpha = 1 - t;
      ctx.translate(p.x * canvas.width + Math.sin(t * 5 + i) * 26, (p.y + t * .85) * canvas.height);
      ctx.rotate(t * (p.turn + 1));
      ctx.fillStyle = i % 3 === 0 ? '#fff5d9' : i % 3 === 1 ? '#bd954c' : '#8e6833';
      ctx.fillRect(-3, -5, 6, 10); ctx.restore();
    });
    frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
}
function finishFinale() {
  clearFinale(); messages.forEach(message => message.classList.add('active'));
  next.disabled = false; document.body.dataset.finaleComplete = 'true'; document.getElementById('finale-status').textContent = 'Dein Abschluss ist bereit.';
}
function startFinale() {
  document.body.dataset.finaleComplete = 'false';
  messages.forEach(message => message.classList.remove('active'));
  if (!moving()) { finishFinale(); return; }
  next.disabled = true; messages[0].classList.add('active'); burst(true);
  const phase = index => { messages.forEach((message, i) => message.classList.toggle('active', i === index)); if (index === 2) burst(true); };
  timers = [setTimeout(() => phase(1), 4500), setTimeout(() => phase(2), 9000), setTimeout(() => { next.disabled = false; document.body.dataset.finaleComplete = 'true'; document.getElementById('finale-status').textContent = 'Dein Abschluss ist bereit.'; }, 13500)];
}
function updateClock() {
  clearInterval(clockTimer);
  const tick = () => {
    const now = new Date(); const hour = now.getHours();
    document.getElementById('time-greeting').textContent = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Einen schönen Tag' : 'Guten Abend';
    document.getElementById('live-clock').textContent = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  };
  tick(); if (current === 0 && !document.hidden) clockTimer = setInterval(tick, 1000);
}
function show(index, focus = true) {
  if (!Number.isInteger(index) || index < 0 || index >= scenes.length) return;
  clearFinale(); stopConfetti(); current = index;
  scenes.forEach((scene, i) => { scene.hidden = i !== index; });
  counter.textContent = index === 7 ? 'Dein Abschluss' : 'Station ' + (index + 1) + ' von 7';
  progress.value = Math.min(index + 1, 7);
  back.disabled = index === 0; next.hidden = index === 7; next.disabled = false;
  next.textContent = labels[index] || 'Zum Abschluss';
  document.body.dataset.scene = scenes[index].dataset.scene;
  if (focus) { const heading = scenes[index].querySelector('[data-scene-heading]'); if (heading) heading.focus(); scrollTo(0, 0); }
  updateClock();
  if (index === 6) startFinale(); else if (index > 0 && index < 7) burst();
}
function motionChanged() {
  document.body.dataset.paused = moving() ? 'false' : 'true';
  motionOff.disabled = reduce.matches || intensity === 0;
  if (!moving()) { stopConfetti(); if (current === 6) finishFinale(); }
}
// Activate a deliberate touch once using its actual target/coordinates. Some
// mobile opaque-frame paths misplace the compatibility mouse click. Keep native
// keyboard/mouse click support, reject scroll/cancel and deduplicate that click.
let touchActivationAt = -Infinity;
document.addEventListener('pointerdown', () => { touchActivationAt = -Infinity; }, true);
document.addEventListener('click', event => {
  if (event.detail > 0 && performance.now() - touchActivationAt < 800) {
    event.preventDefault(); event.stopImmediatePropagation();
  }
}, true);
function activate(control, action) {
  let contact = null;
  const run = event => { if (control.disabled || control.hidden) return; action(event); };
  control.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && event.isPrimary) contact = {id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now()};
  });
  control.addEventListener('pointercancel', () => { contact = null; });
  control.addEventListener('pointerup', event => {
    const start = contact; contact = null;
    if (event.pointerType !== 'touch' || !start || start.id !== event.pointerId ||
        Math.hypot(event.clientX - start.x,event.clientY - start.y) > 8 || performance.now() - start.at > 800) return;
    touchActivationAt = performance.now(); event.preventDefault(); run(event);
  });
  control.addEventListener('click', event => {
    run(event);
  });
}
activate(next, () => show(current + 1));
activate(back, () => show(current - 1));
document.querySelectorAll('[data-choice]').forEach(button => activate(button, () => {
  const choices = {warm: 'Dann nehmen wir uns Zeit für einen warmen Moment.', joy: 'Dann darf ein Lächeln den Anfang machen.', wonder: 'Dann wartet ein kleines Staunen auf dich.'};
  const choice = button.dataset.choice; if (!Object.hasOwn(choices, choice)) return;
  document.querySelectorAll('[data-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('choice-response').textContent = choices[choice];
  document.getElementById('moment-intro').textContent = choices[choice]; burst();
}));
activate(document.getElementById('skip-finale'), () => { finishFinale(); show(7); });
activate(document.getElementById('replay'), () => { document.querySelectorAll('details[open]').forEach(item => item.open = false); show(0); });
document.querySelectorAll('summary').forEach(summary => activate(summary, event => { event.preventDefault(); const details = summary.parentElement; details.open = !details.open; }));
motionOff.addEventListener('change', motionChanged);
reduce.addEventListener('change', motionChanged);
document.addEventListener('visibilitychange', () => { updateClock(); motionChanged(); });
window.addEventListener('pagehide', () => { clearFinale(); stopConfetti(); clearInterval(clockTimer); });
document.body.classList.add('enhanced'); motionChanged();
const previewIndex = scenes.findIndex(scene => scene.dataset.scene === document.body.dataset.previewScene);
show(previewIndex >= 0 ? previewIndex : 0, false);
if (previewIndex >= 0 && scenes[previewIndex].dataset.scene === 'letter') document.querySelector('.letter-reveal').open = true;
})();`;
// Regenerate deliberately after runtime edits; the module test pins the exact bytes.
export const RECIPIENT_RUNTIME_HASH =
  'h94OCbjkmRLSc8jEwh/yuKfda1GNycik2Im88PC5vP8=';
