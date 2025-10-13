import { IReferenceList } from '@/interfaces/referenceList';
import { PromisedValue } from '@/utils/promises';

export interface IReferenceListDictionary {
  [key: string]: PromisedValue<IReferenceList>;
}

export interface ILoadingState<TData> {
  data: TData | undefined;
  error?: unknown;
  loading: boolean;
}

export const extractErrorMessage = (error: unknown): string | undefined => {
  return error instanceof Error
    ? error.message
    : undefined;
};
