import { isEmptyString } from "@/utils/string";
import { GetResultTypeFunc } from "../interfaces";
import { useCallback } from "react";
import { IMetadata, useMetadataBuilderFactory } from "@/utils";
import { executeScript } from '@/providers/form/utils';
import { useFormData, useShaFormInstanceOrUndefined } from '@/providers';

export interface UseResultTypeEvaluatorArgs {
  resultTypeExpression?: string | GetResultTypeFunc;
}

export type ResultTypeEvaluator = () => Promise<IMetadata>;

export const useResultTypeEvaluator = (model: UseResultTypeEvaluatorArgs): ResultTypeEvaluator => {
  const metadataBuilderFactory = useMetadataBuilderFactory();
  const { data: formData } = useFormData();
  const shaFormInstance = useShaFormInstanceOrUndefined();

  const resultTypeExpression = Boolean(model.resultTypeExpression) && !isEmptyString(model.resultTypeExpression)
    ? model.resultTypeExpression
    : undefined;

  const resultTypeEvaluator = useCallback((): Promise<IMetadata> => {
    if (!resultTypeExpression)
      return undefined;

    const metadataBuilder = metadataBuilderFactory();

    const getResultTypeArgs = {
      data: formData,
      metadataBuilder,
      form: shaFormInstance,
    };
    return typeof (resultTypeExpression) === 'string'
      ? executeScript<IMetadata>(resultTypeExpression, getResultTypeArgs)
      : resultTypeExpression(getResultTypeArgs);
  }, [resultTypeExpression, metadataBuilderFactory, formData, shaFormInstance]);

  return resultTypeExpression ? resultTypeEvaluator : undefined;
};
