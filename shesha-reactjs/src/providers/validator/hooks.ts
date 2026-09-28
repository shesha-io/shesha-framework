import { useContext, useEffect, useState } from "react";
import { ValidationCollectorContext } from "./contexts";
import { IValidationCollector } from "./interfaces";
import { throwError } from "@/utils/errors";
import { FieldValidationError } from "../..";
import { isNonEmptyArray } from "@/utils/array";

export const useValidationCollectorOrUndefined = (): IValidationCollector | undefined => useContext(ValidationCollectorContext);

export const useValidationCollector = (): IValidationCollector => useValidationCollectorOrUndefined() ?? throwError("useValidationCollector must be used within a ValidationCollectorProvider");

// const getValidationResults = (collector: IValidationCollector, componentId: string): FieldValidationError[] => collector.validationResults.filter((x) => x.itemType === "component" && x.itemId === componentId);
const getValidationResults = (collector: IValidationCollector, componentId: string): FieldValidationError[] => collector.validationResults.filter((x) => isNonEmptyArray(x.path) && x.path[0].kind === "component" && x.path[0].id === componentId);

export const useComponentValidationResults = (componentId: string): FieldValidationError[] => {
  const collector = useValidationCollector();

  const [results, setResults] = useState<FieldValidationError[]>(() => {
    return getValidationResults(collector, componentId);
  });

  useEffect(() => {
    return collector.subscribe((collector) => {
      setResults(getValidationResults(collector, componentId));
    });
  }, [collector, componentId]);

  return results;
};

const sortValidationResults = (results: FieldValidationError[]): FieldValidationError[] => results.sort((a, b) => a.propertyName.localeCompare(b.propertyName));

export const useAllValidationResults = (): FieldValidationError[] => {
  const collector = useValidationCollector();

  const [results, setResults] = useState<FieldValidationError[]>(() => {
    return sortValidationResults(collector.validationResults);
  });

  useEffect(() => {
    return collector.subscribe((collector) => {
      setResults(sortValidationResults(collector.validationResults));
    });
  }, [collector]);

  return results;
};
