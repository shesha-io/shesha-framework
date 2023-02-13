import { IReferenceList } from "../../interfaces/referenceList";
import { PromisedValue } from "../../utils/promises";

export interface IReferenceListDictionary {
  [key: string]: PromisedValue<IReferenceList>;
}

export interface ILoadingState<TData> {
  data: TData | null;
  error?: any;
  loading: boolean;
}

export interface IReferenceListIdentifier {
  module?: string;
  name: string;
}