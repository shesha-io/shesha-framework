import { isEmptyString } from "@/utils/string";
import { GetAvailableConstantsArgs, GetAvailableConstantsFunc } from "../interfaces";
import { useCallback } from "react";
import { isDefined, useMetadataBuilderFactory } from "@/utils";
import { executeScript } from '@/providers/form/utils';
import { useFormData, useShaFormInstanceOrUndefined } from '@/providers';
import { IObjectMetadata } from "@/interfaces";

export interface UseResultTypeEvaluatorArgs {
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
  makeComponentsNullable?: boolean;
}

export type ConstantsEvaluator = () => Promise<IObjectMetadata>;

export const useConstantsEvaluator = (model: UseResultTypeEvaluatorArgs): ConstantsEvaluator | undefined => {
  const metadataBuilderFactory = useMetadataBuilderFactory(model.makeComponentsNullable);
  const { data: formData } = useFormData();
  const shaFormInstance = useShaFormInstanceOrUndefined();

  const availableConstantsExpression = isDefined(model.availableConstantsExpression) && !isEmptyString(model.availableConstantsExpression)
    ? model.availableConstantsExpression
    : undefined;

  const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
    if (!isDefined(availableConstantsExpression))
      return Promise.reject("AvailableConstantsExpression is mandatory");

    const metadataBuilder = metadataBuilderFactory();
    const getConstantsArgs: GetAvailableConstantsArgs = {
      data: formData as Record<string, unknown>,
      metadataBuilder,
      form: shaFormInstance,
    };
    return typeof (availableConstantsExpression) === 'string'
      ? executeScript<IObjectMetadata>(availableConstantsExpression, getConstantsArgs)
      : availableConstantsExpression(getConstantsArgs);
  }, [availableConstantsExpression, metadataBuilderFactory, formData, shaFormInstance]);

  return isDefined(availableConstantsExpression)
    ? constantsAccessor
    : undefined;
};
