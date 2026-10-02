export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );
}
export function paragraphs(value: string): string {
  return value
    .split(/\n\s*\n/)
    .filter((part) => part.trim())
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
