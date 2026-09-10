/** A Redux-style action: a `type` plus any payload fields. */
export interface DispatchableAction {
  type: string;
  [extra: string]: unknown;
}

/** The Redux `Dispatch` contract, declared here so the public type does not depend on the redux package. */
export type Dispatch<TAction extends DispatchableAction = DispatchableAction> = <T extends TAction>(action: T) => T;

export interface IDispatchable {
  readonly dispatch?: Dispatch;
}
