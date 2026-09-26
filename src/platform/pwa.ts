export interface PwaUpdate {
  apply(): void;
}

export async function registerPwa(onUpdate: (update: PwaUpdate) => void): Promise<() => void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return () => undefined;
  const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
  const notify = () => {
    if (!registration.waiting) return;
    onUpdate({
      apply: () => {
        const reload = () => window.location.reload();
        navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      },
    });
  };
  notify();
  const updateFound = () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) notify(); });
  };
  registration.addEventListener('updatefound', updateFound);
  return () => registration.removeEventListener('updatefound', updateFound);
}
