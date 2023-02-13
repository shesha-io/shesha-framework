import { Dispatch } from 'redux';

export interface IDispatchable {
  readonly dispatch?: Dispatch;
}
