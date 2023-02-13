export interface IDesktopNotificationResult {
  readonly options: {
    readonly title: string;
    readonly body: any;
    readonly data: any;
  };
  readonly payload: {
    readonly id: string;
    readonly target: string;
  };
}
