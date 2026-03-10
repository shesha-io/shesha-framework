import { isEmptyString } from "@/utils/string";
import { GetAvailableConstantsFunc } from "../interfaces";
import { useCallback } from "react";
import { useMetadataBuilderFactory } from "@/utils";
import { executeScript } from '@/providers/form/utils';
import { useFormData, useShaFormInstanceOrUndefined } from '@/providers';
import { IObjectMetadata } from "@/interfaces";

export interface UseResultTypeEvaluatorArgs {
  availableConstantsExpression?: string | GetAvailableConstantsFunc;
}

export type ConstantsEvaluator = () => Promise<IObjectMetadata>;

export const useConstantsEvaluator = (model: UseResultTypeEvaluatorArgs): ConstantsEvaluator => {
  const metadataBuilderFactory = useMetadataBuilderFactory();
  const { data: formData } = useFormData();
  const shaFormInstance = useShaFormInstanceOrUndefined();

  const availableConstantsExpression = Boolean(model.availableConstantsExpression) && !isEmptyString(model.availableConstantsExpression)
    ? model.availableConstantsExpression
    : undefined;

  const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
    if (!availableConstantsExpression)
      return Promise.reject("AvailableConstantsExpression is mandatory");

    const metadataBuilder = metadataBuilderFactory();
    const getConstantsArgs = {
      data: formData,
      metadataBuilder,
      form: shaFormInstance,
    };
    return typeof (availableConstantsExpression) === 'string'
      ? executeScript<IObjectMetadata>(availableConstantsExpression, getConstantsArgs)
      : availableConstantsExpression(getConstantsArgs);
  }, [availableConstantsExpression, metadataBuilderFactory, formData, shaFormInstance]);

  return availableConstantsExpression
    ? constantsAccessor
    : undefined;
};
