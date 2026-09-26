import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const runtime = vi.hoisted(() => ({ isTauri: vi.fn() }));
vi.mock('./runtime', () => runtime);

import { registerPwa } from './pwa';

describe('PWA registration', () => {
  const scope = new URL('./', window.location.href).href;
  let serviceWorker: { getRegistration: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let registration: {
    scope: string;
    unregister: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    waiting: null | { postMessage: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('PROD', true);
    runtime.isTauri.mockReturnValue(false);
    registration = {
      scope, unregister: vi.fn().mockResolvedValue(true),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), waiting: null,
    };
    serviceWorker = {
      getRegistration: vi.fn().mockResolvedValue(registration),
      register: vi.fn().mockResolvedValue(registration),
    };
    vi.stubGlobal('navigator', { serviceWorker });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it.each([true, false])('nativeではPROD=%sでも同じscopeの旧登録を解除し文書データを保持する', async prod => {
    vi.stubEnv('PROD', prod);
    runtime.isTauri.mockReturnValue(true);
    const deleteCache = vi.fn();
    vi.stubGlobal('caches', { delete: deleteCache });
    localStorage.setItem('shara:recovery:v2', 'retained recovery');
    const onUpdate = vi.fn();
    const dispose = await registerPwa(onUpdate);
    dispose();
    expect(serviceWorker.getRegistration).toHaveBeenCalledWith(scope);
    expect(registration.unregister).toHaveBeenCalledOnce();
    expect(serviceWorker.register).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(deleteCache).not.toHaveBeenCalled();
    expect(localStorage.getItem('shara:recovery:v2')).toBe('retained recovery');
  });

  it('nativeで旧登録がなくても新規登録しない', async () => {
    runtime.isTauri.mockReturnValue(true);
    serviceWorker.getRegistration.mockResolvedValue(undefined);
    const dispose = await registerPwa(vi.fn());
    expect(dispose).toBeTypeOf('function');
    expect(serviceWorker.register).not.toHaveBeenCalled();
  });

  it('nativeで取得した登録のscopeが異なる場合は解除しない', async () => {
    runtime.isTauri.mockReturnValue(true);
    registration.scope = new URL('./other/', window.location.href).href;
    await registerPwa(vi.fn());
    expect(registration.unregister).not.toHaveBeenCalled();
    expect(serviceWorker.register).not.toHaveBeenCalled();
  });

  it('nativeの登録解除に失敗した場合は呼出元へ通知しPWAを登録しない', async () => {
    runtime.isTauri.mockReturnValue(true);
    registration.unregister.mockRejectedValue(new Error('unregister failed'));
    await expect(registerPwa(vi.fn())).rejects.toThrow('unregister failed');
    expect(serviceWorker.register).not.toHaveBeenCalled();
  });

  it('Web本番では従来のscopeへ登録し更新通知と購読解除を維持する', async () => {
    registration.waiting = { postMessage: vi.fn() };
    const onUpdate = vi.fn();
    const dispose = await registerPwa(onUpdate);
    expect(serviceWorker.register).toHaveBeenCalledWith('./sw.js', { scope: './' });
    expect(serviceWorker.getRegistration).not.toHaveBeenCalled();
    expect(registration.unregister).not.toHaveBeenCalled();
    expect(onUpdate).toHaveBeenCalledWith({ apply: expect.any(Function) });
    const listener = registration.addEventListener.mock.calls[0][1];
    dispose();
    expect(registration.removeEventListener).toHaveBeenCalledWith('updatefound', listener);
  });

  it('Web開発環境では登録を操作しない', async () => {
    vi.stubEnv('PROD', false);
    await registerPwa(vi.fn());
    expect(serviceWorker.register).not.toHaveBeenCalled();
    expect(serviceWorker.getRegistration).not.toHaveBeenCalled();
  });

  it('Service Workerが利用できない環境では何もしない', async () => {
    vi.stubGlobal('navigator', {});
    const dispose = await registerPwa(vi.fn());
    expect(dispose).toBeTypeOf('function');
    expect(serviceWorker.register).not.toHaveBeenCalled();
  });
});
