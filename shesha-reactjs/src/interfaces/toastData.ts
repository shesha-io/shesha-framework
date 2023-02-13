export interface IToastData {
  readonly message: string;
  readonly type: 'success' | 'error' | 'info' | 'warning' | 'warn' | 'loading';
}
