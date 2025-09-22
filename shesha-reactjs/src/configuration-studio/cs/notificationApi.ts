import { App } from "antd";
import { useRef } from "react";
import { NotificationInstance } from "antd/lib/notification/interface";

export interface ArgsProps {
  message: React.ReactNode;
  description?: React.ReactNode;
  /*
    actions?: React.ReactNode;
    key?: React.Key;
    onClose?: () => void;
    duration?: number | null;
    showProgress?: boolean;
    pauseOnHover?: boolean;
    icon?: React.ReactNode;
    placement?: NotificationPlacement;
    style?: React.CSSProperties;
    className?: string;
    readonly type?: IconType;
    onClick?: () => void;
    closeIcon?: React.ReactNode;
    closable?: ClosableType;
    props?: DivProps;
    role?: 'alert' | 'status';
    */
}
type NotificationFn = (args: ArgsProps) => void;

export interface INotificationApi {
  success: NotificationFn;
  error: NotificationFn;
  info: NotificationFn;
  warning: NotificationFn;
};

type NotificationApiArguments = {
  antdApi: NotificationInstance;
};

export class NotificationApi implements INotificationApi {
  private _antdApi: NotificationInstance;

  constructor(args: NotificationApiArguments) {
    this._antdApi = args.antdApi;
  }

  success = (args: ArgsProps): void => this._antdApi.success(args);

  error = (args: ArgsProps): void => this._antdApi.error(args);

  info = (args: ArgsProps): void => this._antdApi.info(args);

  warning = (args: ArgsProps): void => this._antdApi.warning(args);
}

export const useNotificationApi = (): INotificationApi => {
  const { notification } = App.useApp();

  const apiRef = useRef<INotificationApi>();
  if (!apiRef.current) {
    const instance = new NotificationApi({
      antdApi: notification,
    });
    apiRef.current = instance;
  }

  return apiRef.current;
};
