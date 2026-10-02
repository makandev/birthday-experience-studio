// Hints only. Every decision re-reads the canonical transactional workspace.
const NOTICE_KEY = 'bes.workspace-notice';
export class WorkspaceNotifications {
  private channel?: BroadcastChannel;
  private storageListener: (event: StorageEvent) => void;
  private focusListener: () => void;
  constructor(private changed: () => void) {
    try {
      this.channel = new BroadcastChannel('bes-workspace');
      this.channel.onmessage = () => changed();
    } catch {
      /* storage/focus remain available */
    }
    this.storageListener = (event) => {
      if (event.key === NOTICE_KEY) changed();
    };
    this.focusListener = () => changed();
    window.addEventListener('storage', this.storageListener);
    window.addEventListener('focus', this.focusListener);
    document.addEventListener('visibilitychange', this.focusListener);
  }
  publish(): void {
    try {
      this.channel?.postMessage('changed');
    } catch {
      /* optional hint */
    }
    try {
      localStorage.setItem(NOTICE_KEY, crypto.randomUUID());
    } catch {
      /* IDB remains authoritative */
    }
  }
  close(): void {
    this.channel?.close();
    window.removeEventListener('storage', this.storageListener);
    window.removeEventListener('focus', this.focusListener);
    document.removeEventListener('visibilitychange', this.focusListener);
  }
}
