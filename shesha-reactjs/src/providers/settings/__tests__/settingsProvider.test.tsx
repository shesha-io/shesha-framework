import { act, render, screen, waitFor } from '@testing-library/react';
import { FC, useEffect } from 'react';
import { SettingsProvider, useSettingValue, useSettings, SETTINGS_INVALIDATION_STORAGE_KEY } from '../index';
import { ISettingsClientContext } from '../contexts';

const get = vi.fn();
const post = vi.fn();

vi.mock('../../sheshaApplication/publicApi', () => ({
  useHttpClient: () => ({ get, post }),
}));

const SETTING_ID = { module: 'Shesha', name: 'Shesha.Security' };

function ok<T>(result: T): { data: { success: true; result: T } } {
  return { data: { success: true, result } };
}

const SettingValueView: FC = () => {
  const { value, loadingState } = useSettingValue<{ useAutoLogoff: boolean }>(SETTING_ID);
  return (
    <div>
      <span data-testid="state">{loadingState}</span>
      <span data-testid="value">{value ? String(value.useAutoLogoff) : 'none'}</span>
    </div>
  );
};

const ClientCapture: FC<{ onClient: (client: ISettingsClientContext) => void }> = ({ onClient }) => {
  const settings = useSettings();
  useEffect(() => {
    onClient(settings);
  }, [settings, onClient]);
  return null;
};

const stateText = (): string => screen.getByTestId('state').textContent;
const valueText = (): string => screen.getByTestId('value').textContent;

const renderAll = (): { client: () => ISettingsClientContext } => {
  let captured: ISettingsClientContext | undefined;
  render(
    <SettingsProvider>
      <ClientCapture onClient={(c) => {
        captured = c;
      }}
      />
      <SettingValueView />
    </SettingsProvider>,
  );
  return {
    client: () => {
      if (!captured) throw new Error('settings client is not captured');
      return captured;
    },
  };
};

describe('SettingsProvider / useSettingValue', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    localStorage.clear();
  });

  it('loads the value once and serves it from cache', async () => {
    get.mockResolvedValue(ok({ useAutoLogoff: false }));
    renderAll();

    await waitFor(() => expect(stateText()).toBe('ready'));
    expect(valueText()).toBe('false');
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('re-fetches the value after the setting is invalidated in the same tab', async () => {
    get.mockResolvedValueOnce(ok({ useAutoLogoff: false }));
    const { client } = renderAll();
    await waitFor(() => expect(valueText()).toBe('false'));

    get.mockResolvedValueOnce(ok({ useAutoLogoff: true }));
    act(() => {
      client().invalidateSetting(SETTING_ID);
    });

    await waitFor(() => expect(valueText()).toBe('true'));
    expect(stateText()).toBe('ready');
    expect(get).toHaveBeenCalledTimes(2);
    // invalidation is broadcast to other tabs
    expect(localStorage.getItem(SETTINGS_INVALIDATION_STORAGE_KEY)).toContain('Shesha.Security');
  });

  it('re-fetches the value after setSetting', async () => {
    get.mockResolvedValueOnce(ok({ useAutoLogoff: false }));
    post.mockResolvedValue(ok(undefined));
    const { client } = renderAll();
    await waitFor(() => expect(valueText()).toBe('false'));

    get.mockResolvedValueOnce(ok({ useAutoLogoff: true }));
    await act(async () => {
      await client().setSetting(SETTING_ID, { useAutoLogoff: true });
    });

    await waitFor(() => expect(valueText()).toBe('true'));
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('re-fetches the value when another tab invalidates the setting (storage event)', async () => {
    get.mockResolvedValueOnce(ok({ useAutoLogoff: false }));
    renderAll();
    await waitFor(() => expect(valueText()).toBe('false'));

    get.mockResolvedValueOnce(ok({ useAutoLogoff: true }));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: SETTINGS_INVALIDATION_STORAGE_KEY,
        newValue: `${SETTING_ID.module}/${SETTING_ID.name}/${Date.now()}`,
      }));
    });

    await waitFor(() => expect(valueText()).toBe('true'));
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('does not cache failed requests, so a retry performs a new request without invalidation', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    get.mockRejectedValueOnce(new Error('network'));
    const { client } = renderAll();
    await waitFor(() => expect(stateText()).toBe('failed'));
    expect(get).toHaveBeenCalledTimes(1);

    get.mockResolvedValueOnce(ok({ useAutoLogoff: true }));
    const retried = await client().getSetting<{ useAutoLogoff: boolean }>(SETTING_ID);

    expect(retried).toEqual({ useAutoLogoff: true });
    expect(get).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it('invalidates module-less settings (empty module) locally and across tabs', async () => {
    get.mockResolvedValue(ok({ useAutoLogoff: false }));
    const { client } = renderAll();
    await waitFor(() => expect(stateText()).toBe('ready'));

    const moduleLessId = { module: '', name: 'ModuleLessSetting' };
    const listener = vi.fn();
    client().subscribe(moduleLessId, listener);

    act(() => {
      client().invalidateSetting(moduleLessId);
    });
    expect(listener).toHaveBeenCalledTimes(1);

    // the broadcast message written by this tab must be decodable by another tab
    const broadcast = localStorage.getItem(SETTINGS_INVALIDATION_STORAGE_KEY);
    expect(broadcast).not.toBeNull();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: SETTINGS_INVALIDATION_STORAGE_KEY,
        newValue: broadcast,
      }));
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('writes a distinct broadcast value for repeated invalidations within the same millisecond', async () => {
    get.mockResolvedValue(ok({ useAutoLogoff: false }));
    const { client } = renderAll();
    await waitFor(() => expect(stateText()).toBe('ready'));

    vi.useFakeTimers();
    try {
      act(() => {
        client().invalidateSetting(SETTING_ID);
      });
      const first = localStorage.getItem(SETTINGS_INVALIDATION_STORAGE_KEY);
      act(() => {
        client().invalidateSetting(SETTING_ID);
      });
      const second = localStorage.getItem(SETTINGS_INVALIDATION_STORAGE_KEY);

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second).not.toBe(first);
    } finally {
      vi.useRealTimers();
    }
  });
});
