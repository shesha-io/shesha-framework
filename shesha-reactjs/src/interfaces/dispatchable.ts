import type { Dispatch } from 'react';

export interface IDispatchable {
  readonly dispatch?: Dispatch<unknown>;
}
