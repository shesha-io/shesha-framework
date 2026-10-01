import { isNonEmptyArray } from "@/utils/array";
import { IValidationCollector, OnValidationResultsChanged, ValidationCollectorSubscription } from "./interfaces";
import { isDefined } from "@/utils/nullables";
import { ReactNode } from "react";
import { FieldValidationError } from "../..";

export class ValidationCollector implements IValidationCollector {
  validationResults: FieldValidationError[];

  onValidationResultsChanged?: OnValidationResultsChanged;

  private notifySubscribers = (): void => {
    this.onValidationResultsChanged?.(this.validationResults);
    this.subscriptions.forEach((callback) => callback(this));
  };

  private subscriptions: Set<ValidationCollectorSubscription>;

  constructor() {
    this.validationResults = [];
    this.subscriptions = new Set<ValidationCollectorSubscription>();
  }

  subscribe = (callback: ValidationCollectorSubscription): () => void => {
    this.subscriptions.add(callback);
    return () => this.subscriptions.delete(callback);
  };

  clear = (predicate?: (item: FieldValidationError) => boolean): void => {
    if (isDefined(predicate)) {
      this.validationResults = this.validationResults.filter((item) => !predicate(item));
    } else
      this.validationResults = [];
    this.notifySubscribers();
  };

  clearValidationResults = (itemType: string, itemId: string): void => {
    this.validationResults = this.validationResults.filter((item) => !(isNonEmptyArray(item.path) && item.path[0].kind === itemType && item.path[0].id === itemId));
    this.notifySubscribers();
  };

  updateValidationResults = (itemType: string, itemId: string, _displayName: string | ReactNode, results: FieldValidationError[]): void => {
    this.clearValidationResults(itemType, itemId);
    if (isNonEmptyArray(results)) {
      results.forEach((result) => this.validationResults.push({
        propertyName: result.propertyName,
        propertyLabel: result.propertyLabel,
        severity: result.severity,
        path: result.path,
        code: result.code,
        message: result.message,
      }));
    }
    this.notifySubscribers();
  };
}
