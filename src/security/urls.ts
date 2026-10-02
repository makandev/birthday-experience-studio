export function safeExternalUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Bitte verwende eine öffentliche HTTPS-Adresse.');
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host) ||
    /\.(localhost|local|internal|test|invalid)$/.test(host)
  ) {
    throw new Error(
      'Diese Medienadresse ist nicht erlaubt. Verwende HTTPS ohne Zugangsdaten, Abfragen oder lokale Adressen.',
    );
  }
  return url;
}
