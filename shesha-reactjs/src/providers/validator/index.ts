import { isNonEmptyArray } from "@/utils/array";
import { ItemValidationResult, IValidationCollector, OnValidationResultsChanged, ValidationCollectorSubscription, ValidationResult } from "./interfaces";
import { isDefined } from "@/utils/nullables";
import { ReactNode } from "react";

export class ValidationCollector implements IValidationCollector {
  validationResults: ItemValidationResult[];

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

  clear = (predicate?: (item: ItemValidationResult) => boolean): void => {
    if (isDefined(predicate)) {
      this.validationResults = this.validationResults.filter((item) => !predicate(item));
    } else
      this.validationResults = [];
    this.notifySubscribers();
  };

  clearValidationResults = (itemType: string, itemId: string): void => {
    this.validationResults = this.validationResults.filter((item) => !(item.itemType === itemType && item.itemId === itemId));
    this.notifySubscribers();
  };

  updateValidationResults = (itemType: string, itemId: string, displayName: string | ReactNode, results: ValidationResult[]): void => {
    this.clearValidationResults(itemType, itemId);
    if (isNonEmptyArray(results)) {
      results.forEach((result, index) => this.validationResults.push({
        key: `${itemType}-${itemId}-${index}`,
        itemType: itemType,
        itemId: itemId,
        itemName: "",
        displayName: displayName,
        propertyName: result.propertyName,
        propertyLabel: result.propertyLabel,
        ...result,
      }));
    }
    this.notifySubscribers();
  };
}
