export interface IPubSubState {
  /**
   * Unique state id
   */
  readonly id: string;

  /**
   * The state to be published
   */
  readonly state?: any;
}

export interface IPubSubPayload<T = any> {
  /**
   * Unique state id
   */
  readonly stateId: string;

  readonly state?: T;
}
