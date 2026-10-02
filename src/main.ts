import './studio/styles.css';
import { mountStudio } from './studio/app';
import { mountRecipientViewer } from './experience/viewer';
const root = document.querySelector<HTMLDivElement>('#app')!;
const recipientMode = location.hash === '#gift';
if (recipientMode) mountRecipientViewer(root);
else void mountStudio(root);

// Hash-only navigation must also switch mode in Safari. A reload tears down all
// old Studio listeners and storage activity before mounting recipient-only UI.
window.addEventListener('hashchange', () => {
  if ((location.hash === '#gift') !== recipientMode) location.reload();
});
