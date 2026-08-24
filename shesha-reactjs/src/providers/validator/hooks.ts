import { useContext, useEffect, useState } from "react";
import { ValidationCollectorContext } from "./contexts";
import { ItemValidationResult, IValidationCollector, ValidationResult } from "./interfaces";
import { throwError } from "@/utils/errors";

export const useValidationCollectorOrUndefined = (): IValidationCollector | undefined => useContext(ValidationCollectorContext);

export const useValidationCollector = (): IValidationCollector => useValidationCollectorOrUndefined() ?? throwError("useValidationCollector must be used within a ValidationCollectorProvider");

const getValidationResults = (collector: IValidationCollector, componentId: string): ValidationResult[] => collector.validationResults.filter((x) => x.itemType === "component" && x.itemId === componentId);

export const useComponentValidationResults = (componentId: string): ValidationResult[] => {
  const collector = useValidationCollector();

  const [results, setResults] = useState<ValidationResult[]>(() => {
    return getValidationResults(collector, componentId);
  });

  useEffect(() => {
    return collector.subscribe((collector) => {
      setResults(getValidationResults(collector, componentId));
    });
  }, [collector, componentId]);

  return results;
};

export const useAllValidationResults = (): ItemValidationResult[] => {
  const collector = useValidationCollector();

  const [results, setResults] = useState<ItemValidationResult[]>(() => {
    return collector.validationResults;
  });

  useEffect(() => {
    return collector.subscribe((collector) => {
      setResults(collector.validationResults);
    });
  }, [collector]);

  return results;
};
