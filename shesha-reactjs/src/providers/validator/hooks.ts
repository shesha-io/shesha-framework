import { useContext, useEffect, useState } from "react";
import { ValidationCollectorContext } from "./contexts";
import { IValidationCollector } from "./interfaces";
import { throwError } from "@/utils/errors";
import { FieldValidationError } from "../..";

const useValidationCollectorOrUndefined = (): IValidationCollector | undefined => useContext(ValidationCollectorContext);

const useValidationCollector = (): IValidationCollector => useValidationCollectorOrUndefined() ?? throwError("useValidationCollector must be used within a ValidationCollectorProvider");

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
