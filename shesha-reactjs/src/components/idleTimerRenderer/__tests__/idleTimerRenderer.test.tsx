import { render, act, screen } from '@testing-library/react';
import { createMocks } from 'react-idle-timer';
import { IdleTimerRenderer, ISecuritySettings } from '../index';
import { WARNING_DURATION } from '../util';

const logoutUser = vi.fn(() => Promise.resolve());
const post = vi.fn();

vi.mock('@/providers/auth', () => ({
  useAuth: () => ({
    logoutUser,
    loginInfo: { id: 1, userName: 'admin' },
    updateTokenExpiration: vi.fn(),
    refreshAuthHeaders: vi.fn(),
  }),
}));
vi.mock('@/providers', () => ({ useHttpClient: () => ({ post }) }));
vi.mock('@/providers/dynamicModal', () => ({ useDynamicModalsOrUndefined: () => undefined }));
vi.mock('../styles/styles', () => ({ useStyles: () => ({ styles: {} }) }));
vi.mock('antd', () => ({
  Modal: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) => (
    open ? <div role="dialog"><h1>{title}</h1>{children}</div> : null
  ),
  Progress: ({ format }: { format?: () => React.ReactNode }) => <span>{format?.()}</span>,
}));

const TIMEOUT = 80;
const PROMPT_AT = TIMEOUT - WARNING_DURATION;

const settings = (over: Partial<ISecuritySettings> = {}): ISecuritySettings => ({
  autoLogoffTimeout: TIMEOUT,
  useAutoLogoff: true,
  defaultEndpointAccess: 0,
  mobileLoginPinLifetime: 60,
  resetPasswordEmailLinkLifetime: 60,
  resetPasswordSmsOtpLifetime: 60,
  resetPasswordViaSecurityQuestionsNumQuestionsAllowed: 3,
  useResetPasswordViaEmailLink: true,
  useResetPasswordViaSecurityQuestions: true,
  useResetPasswordViaSmsOtp: true,
  ...over,
});

const advanceSeconds = async (seconds: number): Promise<void> => {
  // advance in 1s steps so that cross-tab messages (MessageChannel/BroadcastChannel) get delivered in between
  for (let i = 0; i < seconds; i++) {
    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
    });
  }
};

const dialogText = (): string | undefined => screen.queryByRole('dialog')?.textContent ?? undefined;

describe('IdleTimerRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // react-idle-timer binds window timers at import time, createMocks() makes it use the (fake) globals
    createMocks();
    logoutUser.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the warning 60s before the timeout and logs out when it elapses', async () => {
    render(<IdleTimerRenderer securitySettings={settings()}>content</IdleTimerRenderer>);

    await advanceSeconds(PROMPT_AT - 1);
    expect(dialogText()).toBeUndefined();

    await advanceSeconds(2);
    expect(dialogText()).toContain('Session Expiring');
    expect(logoutUser).not.toHaveBeenCalled();

    await advanceSeconds(WARNING_DURATION + 1);
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it('applies security settings that arrive after mount (settings are loaded asynchronously)', async () => {
    const { rerender } = render(<IdleTimerRenderer securitySettings={undefined}>content</IdleTimerRenderer>);
    await advanceSeconds(1);

    rerender(<IdleTimerRenderer securitySettings={settings()}>content</IdleTimerRenderer>);

    await advanceSeconds(PROMPT_AT + 1);
    expect(dialogText()).toContain('Session Expiring');

    await advanceSeconds(WARNING_DURATION + 1);
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it('does nothing when auto-logoff is disabled', async () => {
    render(<IdleTimerRenderer securitySettings={settings({ useAutoLogoff: false })}>content</IdleTimerRenderer>);

    await advanceSeconds(TIMEOUT + 5);
    expect(dialogText()).toBeUndefined();
    expect(logoutUser).not.toHaveBeenCalled();
  });

  it('stops the countdown when auto-logoff gets disabled at runtime', async () => {
    const { rerender } = render(<IdleTimerRenderer securitySettings={settings()}>content</IdleTimerRenderer>);
    await advanceSeconds(PROMPT_AT + 1);
    expect(dialogText()).toContain('Session Expiring');

    rerender(<IdleTimerRenderer securitySettings={settings({ useAutoLogoff: false })}>content</IdleTimerRenderer>);
    expect(dialogText()).toBeUndefined();

    await advanceSeconds(WARNING_DURATION + 5);
    expect(logoutUser).not.toHaveBeenCalled();
  });

  it('works with several instances sharing the cross-tab channel (all idle -> logout)', async () => {
    render(
      <>
        <IdleTimerRenderer securitySettings={settings()}>a</IdleTimerRenderer>
        <IdleTimerRenderer securitySettings={settings()}>b</IdleTimerRenderer>
      </>,
    );

    await advanceSeconds(PROMPT_AT + 2);
    expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0);

    await advanceSeconds(WARNING_DURATION + 2);
    expect(logoutUser).toHaveBeenCalled();
  });
});
