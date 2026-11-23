import { JsonLogicFilter } from '@/interfaces/jsonLogic';

/** Emitted on every committed edit. `logic` is the saved JsonLogic, or undefined for an empty query. */
export interface QueryChangeResult {
  logic: JsonLogicFilter | undefined;
  errors: string[];
}

export interface IQueryBuilderProps {
  /** The saved JsonLogic to display. Consumers feed `QueryChangeResult.logic` back in. */
  value?: JsonLogicFilter | null | undefined;
  onChange?: ((result: QueryChangeResult) => void) | undefined;
  readOnly?: boolean | undefined;
}
