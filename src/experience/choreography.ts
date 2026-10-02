import type { ExportExperience } from '../export/projection';
import type { ExperienceStrategy, RecipientScene } from '../engines/scenes';
import { publicCoreMessage, composeScenes } from '../engines/scenes';
import { escapeHtml as e } from './text';

// Maintained presentation only. Authored words remain escaped public data.
export function renderChallengerScene(
  scene: RecipientScene,
  experience: ExportExperience,
  strategy: ExperienceStrategy,
  renderBlocks: (blocks: ExportExperience['blocks']) => string,
): string {
  const name =
    experience.blocks.find((b) => b.type === 'intro')?.data.name ?? '';
  const content = renderBlocks(scene.blocks);
  const core = publicCoreMessage(experience);
  const playful = strategy.archetype === 'playful';
  const cinema = strategy.archetype === 'cinematic';
  switch (scene.id) {
    case 'opening':
      return `<p class="time-welcome"><span id="time-greeting">Willkommen</span><time id="live-clock" aria-label="Aktuelle Uhrzeit"></time></p><div class="opening-art" aria-hidden="true"><span>${playful ? '✳' : cinema ? '✦' : '♡'}</span></div><header class="intro"><p class="eyebrow">${playful ? 'Der Alltag hat kurz Pause' : cinema ? 'Ein kleiner Film. Ein großer Anlass.' : 'Ein Geschenk, das sich Zeit nimmt'}</p><h1>${name ? e(name) : 'Für dich'}<em>${playful ? 'Heute gibt’s Konfetti.' : cinema ? 'Dieser Moment gehört dir.' : 'Manche Worte brauchen einen eigenen Moment.'}</em></h1></header><p class="scene-lead">${strategy.respectful ? 'Ein persönlicher Geburtstagsgruß. In deinem Tempo.' : playful ? 'Keine Aufgaben. Keine richtige Antwort. Nur ein Geschenk zum Entdecken.' : cinema ? 'Nicht vorspulen. Entdecken. Du führst durch diesen Moment.' : 'Erst ein kleiner Anfang. Die persönlichen Worte warten noch.'}</p>`;
    case 'curiosity':
      return `<div class="discovery-orbit" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span></div><details class="discovery-note"><summary>${playful ? 'Den Alltag kurz wegklappen' : cinema ? 'Ein Licht im Dunkeln öffnen' : 'Einen Moment auspacken'}</summary><div class="discovered"><p class="large-copy">${playful ? 'To-do für heute:<br>Ein Geschenk entdecken.<br>Alles andere: später.' : cinema ? 'Ein Name auf der Leinwand.<br>Ein neuer Anfang.<br>Und du mittendrin.' : 'Kein großer Plan.<br>Nur ein bisschen Raum<br>für das, was dir gut tut.'}</p><p>Die persönlichen Worte kommen noch. Hier darfst du erst einmal ankommen.</p></div></details>`;
    case 'choice': {
      const ids = composeScenes(experience).map((s) => s.id);
      const options = [
        {
          route: 'letter',
          key: 'warm',
          symbol: '♡',
          label: 'Die persönlichen Worte',
          echo: 'Du hast den Worten Raum gegeben.',
        },
        {
          route: ids.includes('moments') ? 'moments' : 'curiosity',
          key: 'joy',
          symbol: '✳',
          label: ids.includes('moments')
            ? 'Die Bilder entdecken'
            : 'Ein kleines Lächeln',
          echo: 'Du hast dir einen Moment zum Entdecken genommen.',
        },
        {
          route: 'surprise',
          key: 'wonder',
          symbol: '✦',
          label: 'Den Wunsch auspacken',
          echo: 'Du hast einen Wunsch mitgenommen.',
        },
      ].filter(
        (option) =>
          ids.indexOf(option.route as RecipientScene['id']) >
          ids.indexOf('choice'),
      );
      return `<p class="scene-lead">${playful ? 'Du wählst die erste Tür. Dahinter steckt ein anderer Moment.' : cinema ? 'Deine Entscheidung bestimmt die nächste Szene.' : 'Was möchtest du zuerst entdecken? Der Rest bleibt für dich da.'}</p><div class="recipient-choices">${options.map((o) => `<button data-choice="${o.key}" data-route="${o.route}" data-echo="${o.echo}" aria-pressed="false"><span aria-hidden="true">${o.symbol}</span>${o.label}</button>`).join('')}</div><p id="choice-response" role="status" class="scene-lead">Mit deiner Wahl kommt dieser Moment als Nächstes.</p>`;
    }
    case 'moments':
      return `<p id="moment-intro" class="scene-lead">${playful ? 'Ein paar Bilder. Platz für ein Lächeln.' : cinema ? 'Große Bilder brauchen keine großen Worte.' : 'Ein Foto hält nicht die Zeit an. Aber manchmal einen schönen Moment.'}</p><div class="photo-deck">${scene.blocks.map((block, index) => `<div data-photo="${index}">${renderBlocks([block])}</div>`).join('')}</div>${scene.blocks.length > 1 ? `<div class="photo-select" aria-label="Fotos erkunden">${scene.blocks.map((_, index) => `<button data-photo-select="${index}" aria-pressed="${index === 0}">Bild ${index + 1}</button>`).join('')}</div>` : ''}`;
    case 'letter':
      return `<div class="letter-seal" aria-hidden="true">${playful ? '✉' : '♡'}</div><p class="scene-lead">${playful ? 'Zwischen all dem Konfetti: etwas, das bleibt.' : cinema ? 'Die Kamera wird still. Jetzt zählen die Worte.' : 'Nicht zwischen Tür und Angel. Diese Worte bekommen ihren eigenen Platz.'}</p><details class="letter-reveal"><summary>${strategy.respectful ? 'Den persönlichen Gruß lesen' : 'Deine persönlichen Worte öffnen'}</summary>${content}</details>`;
    case 'surprise':
      return `<div class="wish-ribbon" aria-hidden="true">✦</div><p class="scene-lead">${playful ? 'Noch kein Abspann. Da steckt noch etwas drin.' : cinema ? 'Was du jetzt öffnest, gehört zu deinem neuen Kapitel.' : 'Ein Wunsch passt in einen Satz. Und manchmal in ein ganzes Jahr.'}</p>${content}`;
    case 'encore':
      return `<div class="false-ending"><span class="end-mark" aria-hidden="true">FIN</span><p>Das war dein kleiner Geburtstagsmoment.</p><details class="encore-reveal"><summary>Oder war das erst der Anfang?</summary><p class="large-copy">Ein letzter Moment.<br>Der gehört ganz dir.</p><p>Öffne jetzt den Abschluss – die Bühne wartet.</p></details></div>`;
    case 'finale': {
      const first =
        strategy.finale === 'keepsake'
          ? 'Ein Moment wird still.'
          : strategy.finale === 'celebration'
            ? 'Ein Wunsch braucht eine Bühne.'
            : 'Das Licht geht noch einmal an.';
      const last = `Alles Gute<br>zum Geburtstag${name ? `,<br><em>${e(name)}</em>` : ''}.`;
      return `<div class="cinematic-finale"><div class="finale-orbit" aria-hidden="true"></div><div class="finale-message"><p class="eyebrow">${strategy.finale === 'keepsake' ? 'Zum Behalten' : 'Der große Moment'}</p><h2>${first}</h2><p class="choice-echo">${playful ? 'Heute darf es leicht sein.' : 'In deinem Tempo. Nur für dich.'}</p></div><div class="finale-message"><p class="eyebrow">Die Worte, die bleiben</p><blockquote class="core-message"><p>„${e(core)}“</p></blockquote></div><div class="finale-message"><p class="eyebrow">${playful ? 'Auf dein neues Lebensjahr' : 'Ein neuer Anfang'}</p><h1>${last}</h1></div></div><div class="finale-controls"><button id="skip-finale" class="subtle-button">Direkt zum Abschluss</button>${strategy.finale !== 'keepsake' && !strategy.respectful ? '<button id="fireworks-again" class="subtle-button">Noch einmal leuchten lassen</button>' : ''}<span id="finale-status" role="status">Ein besonderer Moment – jederzeit überspringbar.</span></div>`;
    }
    case 'closing':
      return `<div class="closing-copy">${content}<p class="eyebrow">Dein Geschenk bleibt hier</p><p class="large-copy">${playful ? 'Das Konfetti vergeht.<br>Die guten Wünsche bleiben.' : cinema ? 'Der Abspann endet.<br>Dein neues Kapitel beginnt.' : 'Nicht alles muss groß sein.<br>Nur echt gemeint.'}</p><button id="replay" class="subtle-button">Noch einmal erleben</button></div>`;
  }
}

export const CHOREOGRAPHY_CSS = `
.stage-nav #stage-next{flex:1 1 0;min-width:44px;white-space:normal;overflow-wrap:anywhere}.stage-nav #stage-back{flex:0 0 auto}.stage-nav{align-items:center}.keepsake-photo{display:block;max-height:200px;width:auto;max-width:100%;aspect-ratio:auto;margin:18px auto;object-fit:contain;border-radius:14px}body[data-variant="challenger"] .scene-heading{margin:0 0 18px}body[data-variant="challenger"] .scene-heading h2{font:500 .85rem/1.5 system-ui,sans-serif;letter-spacing:.02em}body[data-variant="challenger"] .intro h1{font-size:clamp(3.4rem,10vw,6.5rem);letter-spacing:-.045em}body[data-variant="challenger"] .intro h1 em{display:block;font-size:clamp(1.35rem,4vw,2.1rem);line-height:1.4;letter-spacing:0;max-width:650px;margin:24px auto}body[data-variant="challenger"] .stage-nav{backdrop-filter:none}.opening-art{display:grid;place-items:center;height:110px}.opening-art span{font:5rem/1 Georgia,serif;color:var(--gold);filter:drop-shadow(0 12px 24px #d4ac7360);animation:gold-breathe 6s ease-in-out infinite}.letter-seal{font:3rem/1.5 Georgia,serif;text-align:center;color:var(--gold);margin:10px auto}.discovery-orbit{display:flex;align-items:center;justify-content:center;gap:28px;margin:40px auto;font-size:3rem;color:var(--gold)}.discovery-orbit span:nth-child(2){font-size:5rem}.discovery-note{max-width:660px;margin:20px auto;text-align:center;border-block:1px solid #b8996355;padding:20px}.discovery-note summary{list-style:none}.discovered{padding:18px}.wish-ribbon{font-size:4rem;text-align:center;color:var(--gold)}.false-ending{text-align:center;padding:30px 0}.end-mark{font:clamp(4rem,15vw,8rem)/1.2 Georgia,serif;letter-spacing:.22em;color:var(--gold)}.encore-reveal{margin:38px 0;border-block:1px solid #b8996355;padding:16px}.core-message{font:clamp(1.5rem,5vw,2.7rem)/1.45 Georgia,serif;margin:16px 0;max-width:680px}.core-message p{margin:0}.photo-select{display:none;gap:10px;justify-content:center;flex-wrap:wrap}.enhanced .photo-select{display:flex}.photo-select button{padding:10px 16px;border:1px solid var(--gold);border-radius:30px;background:var(--card);color:var(--ink)}.photo-select button[aria-pressed="true"]{background:var(--gold);color:white}body[data-variant="challenger"] .photo-card{border:0;padding:0;border-radius:0;background:transparent;box-shadow:none}.photo-deck figcaption{text-align:center;padding:16px}.photo-deck .photo-description{text-align:center}.photo-deck .photo-image{aspect-ratio:4/3;max-height:58svh}.photo-deck .photo-view{text-align:center}body[data-archetype="playful"][data-variant="challenger"]{--bg:#fff2e8;--ink:#302139;--gold:#76295e;--gold-light:#f1b18d;--card:#fffdf9;background:radial-gradient(circle at 80% 10%,#f9d58870,transparent 35%),radial-gradient(circle at 10% 70%,#bce8df80,transparent 40%),var(--bg);font-family:system-ui,sans-serif}body[data-archetype="playful"][data-variant="challenger"] h1,body[data-archetype="playful"][data-variant="challenger"] h2{font-family:system-ui,sans-serif;font-weight:650}body[data-archetype="playful"] .recipient-choices button{border-radius:30px 30px 8px 30px;border:2px solid #76295e30;background:#fffdf9}body[data-archetype="playful"] .photo-deck .photo-card{max-width:600px;margin:30px auto;padding:14px 14px 0;background:white;box-shadow:0 18px 40px #48233c20;transform:rotate(-2deg)}body[data-archetype="playful"] .photo-deck .photo-image{border-radius:2px}body[data-archetype="playful"] .letter-reveal{background:#fff8fb;border-color:#76295e30}body[data-archetype="cinematic"][data-variant="challenger"]{--bg:#191d28;--ink:#fff6df;--gold:#edcb80;--gold-light:#ffe6ac;--card:#242b38;background:radial-gradient(ellipse at 50% 0,#394451,transparent 65%),var(--bg)}body[data-archetype="cinematic"][data-variant="challenger"] .stage-nav{background:#242b38;border-color:#edcb8055}body[data-archetype="cinematic"][data-variant="challenger"] .stage-nav #stage-next{color:#191d28}body[data-archetype="cinematic"][data-variant="challenger"] .card,body[data-archetype="cinematic"][data-variant="challenger"] .letter-reveal,body[data-archetype="cinematic"][data-variant="challenger"] .recipient-choices button{background:#242b38;color:var(--ink);border-color:#edcb8055}body[data-archetype="cinematic"][data-variant="challenger"] .recipient-choices button[aria-pressed="true"]{background:#3c414d}body[data-archetype="cinematic"][data-variant="challenger"] .letter-reveal>.card{background:none}body[data-archetype="cinematic"][data-variant="challenger"] .subtle-button{background:#242b38;color:var(--ink);border-color:var(--gold)}body[data-archetype="cinematic"][data-variant="challenger"] .photo-deck .photo-image{aspect-ratio:16/9;border-radius:0}body[data-archetype="cinematic"][data-variant="challenger"] .light-reflection{background:radial-gradient(ellipse at 15% 10%,#edcb8020,transparent 45%),radial-gradient(ellipse at 85% 80%,#b7924818,transparent 50%)}body[data-finale-style="keepsake"] .finale-orbit{background:radial-gradient(ellipse,#e7cc7f30,transparent 70%);animation:none}body[data-variant="challenger"] .gift-scene[data-scene="opening"]{animation:opening-arrive 900ms ease-out both}body[data-archetype="playful"] .gift-scene{animation-name:playful-arrive}body[data-archetype="cinematic"] .gift-scene{animation-name:cinema-arrive}@keyframes opening-arrive{from{transform:translateY(12px)}to{transform:none}}@keyframes playful-arrive{from{transform:translateY(8px) rotate(-.35deg)}to{transform:none}}@keyframes cinema-arrive{from{filter:brightness(.75);transform:translateY(6px)}to{filter:none;transform:none}}@media(max-width:640px){.enhanced .stage-header{display:grid;grid-template-columns:1fr auto;padding:8px 18px;gap:2px 14px}.stage-header .motion-control{grid-column:1/-1;padding:4px 8px}.gift-scene[data-scene="opening"]{padding-bottom:12px}body[data-variant="challenger"] .gift-stage{padding-top:8px}.opening-art{height:82px}.opening-art span{font-size:4rem}body[data-variant="challenger"] .intro h1{font-size:clamp(3rem,14vw,4.5rem)}.photo-deck .photo-image{max-height:52svh}.core-message{font-size:1.55rem}.end-mark{font-size:4rem}.cinematic-finale{min-height:320px}}body:not(.enhanced) *{animation:none!important;transition:none!important}body[data-paused="true"] *{animation:none!important}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

export const AI_STAGE_CSS = `
body[data-generated-animation] .gift-scene{position:relative;max-width:760px;width:100%;margin:0 auto;padding:28px;border:1px solid #ba96574d;border-radius:30px;background:var(--card);box-shadow:0 20px 80px #6b4b2520,inset 0 1px #ffffffa0;overflow:hidden}
body[data-generated-animation] .gift-scene:before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,#e6c98722 48%,transparent 66%);pointer-events:none;animation:stage-light 12s ease-in-out infinite}
body[data-generated-animation] .scene-heading .eyebrow{font-size:.65rem}body[data-generated-animation] .gift-stage{gap:12px;padding-top:12px}body[data-generated-animation][data-scene="finale"] .gift-scene{background:transparent;border:0;box-shadow:none;overflow:visible}body[data-generated-animation][data-scene="finale"] .scene-heading{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}body[data-generated-animation][data-scene="finale"] .cinematic-finale{min-height:52svh}body[data-generated-animation] .letter-reveal[open] .card p{animation:letter-unfold 700ms ease-out both}body[data-generated-animation] .letter-reveal[open] .card p:nth-of-type(2){animation-delay:220ms}body[data-generated-animation] .letter-reveal[open] .card p:nth-of-type(n+3){animation-delay:440ms}
@keyframes stage-light{0%,100%{transform:translateX(-75%);opacity:.3}50%{transform:translateX(75%);opacity:.8}}@keyframes letter-unfold{from{transform:translateY(14px)}to{transform:none}}@media(max-width:640px){body[data-generated-animation] .gift-scene{padding:16px;border-radius:22px}body[data-generated-animation] .opening-art{height:48px}body[data-generated-animation] .intro h1 em{margin:14px auto;font-size:1.1rem}body[data-generated-animation] .scene-heading{margin-bottom:12px}body[data-generated-animation] .scene-lead{margin:12px auto}}body[data-paused="true"] *{animation:none!important;transition:none!important}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
