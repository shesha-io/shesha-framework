import { ISheshaErrorTypes } from "@/utils/errors";

export type ValidationResult = {
  type: ISheshaErrorTypes;
  propertyName?: string | undefined;
  message: string;
  description: string | undefined;
  documentationUrl: string | undefined;
};

export type ItemValidationResult = ValidationResult & {
  itemType: string;
  itemId: string;
  itemName: string;
};

export type OnValidationResultsChanged = (newResults: ItemValidationResult[]) => void;

export type ValidationCollectorSubscription = (cs: IValidationCollector) => void;

export interface IValidationCollector {
  clear: (predicate?: (item: ItemValidationResult) => boolean) => void;
  validationResults: ItemValidationResult[];
  updateValidationResults: (itemType: string, itemId: string, results: ValidationResult[]) => void;
  subscribe: (callback: ValidationCollectorSubscription) => () => void;
}

export type ValidationPath = {
  componentId: string;
  propertyName: string;
  getKey: () => string;
};

export type ValidationContext = {
  validateChildren: boolean;
};

/**
 * Function that returns an array of validation results
 */
export type Validator<TSettings extends object, TContext extends ValidationContext> = (settings: TSettings, context: TContext) => ValidationResult[];
