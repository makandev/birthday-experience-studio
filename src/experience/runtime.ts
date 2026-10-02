// Trusted static runtime. Never interpolate recipient, imported or AI data here.
export const RECIPIENT_RUNTIME = String.raw`(() => {
'use strict';
const originalScenes = [...document.querySelectorAll('.gift-scene')];
let scenes = [...originalScenes];
const challenger = document.body.dataset.variant === 'challenger';
const phaseMs = Math.min(4500, Math.max(2000, Number(document.body.dataset.phaseMs) || 4500));
const finaleStyle = document.body.dataset.finaleStyle;
const originalChoiceResponse = document.getElementById('choice-response')?.textContent || '';
const originalMomentIntro = document.getElementById('moment-intro')?.textContent || '';
const gotoLabels = {choice:'Deinen Weg wählen',curiosity:'Einen Moment auspacken',moments:'Das Bild entdecken',letter:'Zu deinen persönlichen Worten',surprise:'Den Wunsch auspacken',encore:'Zum Abspann?',finale:'Diesen Moment feiern',closing:'Zum Mitnehmen'};
const originalEcho = document.querySelector('.choice-echo')?.textContent || '';
if (challenger && finaleStyle === 'keepsake') {
  const source = document.querySelector('.photo-deck .photo-image');
  if (source) {
    const photo = source.cloneNode(false); photo.classList.add('keepsake-photo'); photo.removeAttribute('loading'); photo.setAttribute('aria-hidden','true');
    document.querySelector('.finale-message')?.append(photo);
  }
}
const sceneIs = id => scenes[current]?.dataset.scene === id;
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
function fireworks() {
  stopConfetti();
  if (!moving() || !ctx || document.body.dataset.respectful === 'true') return;
  canvas.width = innerWidth; canvas.height = innerHeight;
  const count = Math.min(innerWidth < 640 ? 72 : 144, 48 * intensity);
  const started = performance.now();
  const colors = document.body.dataset.archetype === 'playful' ? ['#ef9a66','#b1dbbe','#dfb0da'] : ['#edcb80','#fff6df','#bf9754'];
  function draw(now) {
    if (!moving()) { stopConfetti(); return; }
    const t = (now - started) / 3200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (t >= 1) { frame = 0; return; }
    for (let i = 0; i < count; i++) {
      const group = i % 3; const age = Math.max(0, (t - group * .12) / .65);
      if (age <= 0 || age >= 1) continue;
      const angle = i * 2.39996; const radius = Math.min(canvas.width,canvas.height) * .32 * Math.sin(age * Math.PI / 2);
      const x = canvas.width * (.25 + group * .25) + Math.cos(angle) * radius;
      const y = canvas.height * (.24 + group * .07) + Math.sin(angle) * radius + age * age * 65;
      ctx.globalAlpha = (1 - age) * .85; ctx.fillStyle = colors[group];
      ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=colors[group];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(angle)*10*(1-age),y-Math.sin(angle)*10*(1-age));ctx.stroke();
    }
    ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
}
function finaleEffect() { if (!challenger) burst(true); else if (finaleStyle !== 'keepsake') fireworks(); }
function finishFinale() {
  clearFinale(); messages.forEach(message => message.classList.add('active'));
  next.disabled = false; document.body.dataset.finaleComplete = 'true'; document.getElementById('finale-status').textContent = 'Dein Abschluss ist bereit.';
}
function startFinale() {
  document.body.dataset.finaleComplete = 'false';
  messages.forEach(message => message.classList.remove('active'));
  if (!moving()) { finishFinale(); return; }
  next.disabled = true; messages[0].classList.add('active'); if (!challenger) burst(true);
  const phase = index => { messages.forEach((message, i) => message.classList.toggle('active', i === index)); if (index === 2) finaleEffect(); };
  timers = [setTimeout(() => phase(1), phaseMs), setTimeout(() => phase(2), phaseMs * 2), setTimeout(() => { next.disabled = false; document.body.dataset.finaleComplete = 'true'; document.getElementById('finale-status').textContent = 'Dein Abschluss ist bereit.'; }, phaseMs * 3)];
}
function updateClock() {
  clearInterval(clockTimer);
  const tick = () => {
    const now = new Date(); const hour = now.getHours();
    document.getElementById('time-greeting').textContent = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Einen schönen Tag' : 'Guten Abend';
    document.getElementById('live-clock').textContent = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  };
  tick(); if (sceneIs('opening') && !document.hidden) clockTimer = setInterval(tick, 1000);
}
function show(index, focus = true) {
  if (!Number.isInteger(index) || index < 0 || index >= scenes.length) return;
  clearFinale(); stopConfetti(); current = index;
  scenes.forEach((scene, i) => { scene.hidden = i !== index; });
  counter.textContent = sceneIs('closing') ? 'Dein Abschluss' : 'Station ' + (index + 1) + ' von ' + (scenes.length - 1);
  progress.max = scenes.length - 1; progress.value = Math.min(index + 1, scenes.length - 1);
  back.disabled = index === 0; next.hidden = sceneIs('closing'); next.disabled = false;
  next.textContent = challenger ? (sceneIs('opening') ? 'Geschenk öffnen' : gotoLabels[scenes[index + 1]?.dataset.scene] || 'Zum Mitnehmen') : scenes[index].dataset.nextLabel || 'Zum Abschluss';
  document.body.dataset.scene = scenes[index].dataset.scene;
  document.body.dataset.sceneOrder = scenes.map(scene => scene.dataset.scene).join(',');
  if (focus) { const heading = scenes[index].querySelector('[data-scene-heading]'); if (heading) heading.focus(); scrollTo(0, 0); }
  updateClock();
  if (sceneIs('finale')) startFinale(); else if (index > 0 && index < scenes.length - 1 && (!challenger || document.body.dataset.archetype === 'playful' && sceneIs('surprise'))) burst();
}
function motionChanged() {
  document.body.dataset.paused = moving() ? 'false' : 'true';
  motionOff.disabled = reduce.matches || intensity === 0;
  if (!moving()) { stopConfetti(); if (sceneIs('finale')) finishFinale(); }
}
// Activate a deliberate touch once using its actual target/coordinates. Some
// mobile opaque-frame paths misplace the compatibility mouse click. Keep native
// keyboard/mouse click support, reject scroll/cancel and deduplicate that click.
let touchActivationAt = -Infinity;
let pointerObserved = false;
const runtimeStarted = performance.now();
document.addEventListener('pointerdown', () => { pointerObserved = true; touchActivationAt = -Infinity; }, true);
document.addEventListener('click', event => {
  if (event.detail > 0 && ((!pointerObserved && performance.now() - runtimeStarted < 1200) || performance.now() - touchActivationAt < 800)) {
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
  const moment = document.getElementById('moment-intro'); if (moment) moment.textContent = choices[choice];
  if (challenger) {
    const route = button.dataset.route;
    const target = scenes.findIndex((scene, index) => index > current && scene.dataset.scene === route);
    if (target > current) {
      const [selected] = scenes.splice(target, 1); scenes.splice(current + 1, 0, selected);
      next.textContent = 'Jetzt: ' + button.textContent.trim();
      document.getElementById('choice-response').textContent = 'Deine Wahl kommt als Nächstes. Die anderen Momente bleiben für später.';
    }
    const echo = document.querySelector('.choice-echo'); if (echo) echo.textContent = button.dataset.echo || originalEcho;
  } else burst();
}));
activate(document.getElementById('skip-finale'), () => { finishFinale(); show(scenes.findIndex(scene => scene.dataset.scene === 'closing')); });
activate(document.getElementById('replay'), () => {
  scenes = [...originalScenes];
  document.querySelectorAll('[data-choice]').forEach(item => item.setAttribute('aria-pressed','false'));
  const echo = document.querySelector('.choice-echo'); if (echo) echo.textContent=originalEcho;
  const response = document.getElementById('choice-response'); if(response) response.textContent=originalChoiceResponse;
  const moment = document.getElementById('moment-intro'); if(moment) moment.textContent=originalMomentIntro;
  document.querySelectorAll('details[open]').forEach(item => item.open = false); selectPhoto(0); show(0);
});
const fireworksAgain = document.getElementById('fireworks-again'); if (fireworksAgain) activate(fireworksAgain, fireworks);
function selectPhoto(index) {
  const photos = [...document.querySelectorAll('[data-photo]')];
  if (!photos.length || !Number.isInteger(index) || index < 0 || index >= photos.length) return;
  photos.forEach((photo,i) => photo.hidden = i !== index);
  document.querySelectorAll('[data-photo-select]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.photoSelect) === index)));
}
document.querySelectorAll('[data-photo-select]').forEach(button => activate(button, () => selectPhoto(Number(button.dataset.photoSelect))));
selectPhoto(0);
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
  'Dl0arhHlFucR6jDKYEQkoLjjwCXPh94gIgsGWee1oHw=';
