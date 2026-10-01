import { ReactNode } from "react";
import { FieldValidationError } from "../..";

export type OnValidationResultsChanged = (newResults: FieldValidationError[]) => void;

export type ValidationCollectorSubscription = (cs: IValidationCollector) => void;

export interface IValidationCollector {
  clear: (predicate?: (item: FieldValidationError) => boolean) => void;
  validationResults: FieldValidationError[];
  updateValidationResults: (itemType: string, itemId: string, displayName: string | ReactNode, results: FieldValidationError[]) => void;
  subscribe: (callback: ValidationCollectorSubscription) => () => void;
}
