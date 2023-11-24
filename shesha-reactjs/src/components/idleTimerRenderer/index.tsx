import { Modal, Progress } from 'antd';
import React, { FC, PropsWithChildren, useState } from 'react';
import { IdleTimerComponent } from 'react-idle-timer';
import { useInterval } from 'react-use';
import { useAuth } from '@/providers/auth';
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { getPercentage, getStatus, getTimeFormat, MIN_TIME, ONE_SECOND, SIXTY } from './util';

export interface IIdleTimerRendererProps {}

interface IIdleTimerState {
  readonly isIdle: boolean;
  readonly remainingTime: number;
}

const INIT_STATE: IIdleTimerState = {
  isIdle: false,
  remainingTime: SIXTY,
};

const autoLogoffTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security.AutoLogoffTimeout', module: 'Shesha' };

export const IdleTimerRenderer: FC<PropsWithChildren<IIdleTimerRendererProps>> = ({ children }) => {
  const { value: autoLogoffTimeout } = useSettingValue<number>(autoLogoffTimeoutSettingId);
  const timeoutSeconds = autoLogoffTimeout ?? 0;

  const { logoutUser, loginInfo } = useAuth();

  const [state, setState] = useState<IIdleTimerState>(INIT_STATE);
  const { isIdle, remainingTime: rt } = state;

  const isTimeoutSet = timeoutSeconds >= MIN_TIME && !!loginInfo;
  const timeout = getTimeFormat(timeoutSeconds);
  const visible = isIdle && isTimeoutSet;

  useInterval(() => {
    if (isIdle) {
      doCountdown();
    }
  }, ONE_SECOND);

  const onAction = (_event: Event) => {
    /*nop*/
  };

  const onActive = (_event: Event) => {
    /*nop*/
  };

  const onIdle = (_event: Event) => setState(s => ({ ...s, isIdle: true }));

  const logout = () => logoutUser().then(() => setState(INIT_STATE));

  const doCountdown = () => {
    if (!rt) {
      logout();
    } else {
      setState(({ remainingTime: r, ...s }) => ({ ...s, remainingTime: r - 1 }));
    }
  };

  const onOk = () => logout();

  const onCancel = () => setState(s => ({ ...s, isIdle: false, remainingTime: SIXTY }));

  if (!isTimeoutSet) {
    return <>{children}</>;
  }

  return (
    <div className="sha-idle-timer-renderer">
      <IdleTimerComponent onAction={onAction} onActive={onActive} onIdle={onIdle} timeout={timeout}>
        {children}
        <Modal
          title="You have been idle"
          open={visible}
          cancelText="Keep me signed in"
          okText="Logoff"
          onOk={onOk}
          onCancel={onCancel}
        >
          <div className="idle-timer-content">
            <span className="idle-timer-content-top-hint">
              You have not been using the application for sometime. Please click on the
              <strong>Keep me signed in</strong> button, else you'll be automatically signed out in
            </span>
            <Progress type="circle" percent={getPercentage(rt)} status={getStatus(rt)} format={() => <>{rt}</>} />
            <span className="idle-timer-content-bottom-hint">
              <strong>seconds</strong>
            </span>
          </div>
        </Modal>
      </IdleTimerComponent>
    </div>
  );
};

export default IdleTimerRenderer;
