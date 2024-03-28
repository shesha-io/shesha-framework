export const globalStateApiDefinition = `export interface GlobalStateType {
    [name: string]: any;
  }
  
  export interface ISetStatePayload {
    data?: any;
    key?: string;
  }
  
  export type SetGlobalStateType = (payload: ISetStatePayload) => void;
`;
