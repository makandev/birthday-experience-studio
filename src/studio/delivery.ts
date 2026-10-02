// A local presentation hint, never authentication or a security decision.
export function isIosDevice(
  device: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>,
): boolean {
  return (
    /iPhone|iPad|iPod/.test(device.userAgent) ||
    (device.platform === 'MacIntel' && device.maxTouchPoints > 1)
  );
}
