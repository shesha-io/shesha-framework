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

  it('does not cache failed requests', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    get.mockRejectedValueOnce(new Error('network'));
    const { client } = renderAll();
    await waitFor(() => expect(stateText()).toBe('failed'));

    get.mockResolvedValueOnce(ok({ useAutoLogoff: true }));
    act(() => {
      client().invalidateSetting(SETTING_ID);
    });

    await waitFor(() => expect(valueText()).toBe('true'));
    expect(get).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
