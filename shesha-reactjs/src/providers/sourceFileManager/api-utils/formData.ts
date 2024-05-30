
export const formDataApiDefinition = `export interface FormDataType {
    [name: string]: any;
  }
  
  export interface ISetFormDataPayload {
    values: any;
    mergeValues: boolean;
  }
  
  export type SetFormDataType = (payload: ISetFormDataPayload) => void;
`;
