export interface GlobalStateType {
  [name: string]: unknown;
}

export interface ISetStatePayload {
  data?: unknown;
  key?: string;
}

export type SetGlobalStateType = (payload: ISetStatePayload) => void;
