import { IFormSettings } from "@/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";

export const migrateDefaultApiEndpoints = (prev: IFormSettings): IFormSettings => {
  const { dataSubmittersSettings, ...restProps } = prev;
  const { gql } = dataSubmittersSettings ?? {};
  if (!gql)
    return prev;

  const oldName = 'form.defaultEndpoints';
  const newName = 'form.defaultApiEndpoints';

  const typedGql = gql as GqlSubmitterSettings;
  if (!typedGql.dynamicEndpoint || !typedGql.dynamicEndpoint.includes(oldName))
    return prev;

  const newDynamicEndpoint = typedGql.dynamicEndpoint.replaceAll(oldName, newName);

  const result = {
    ...restProps,
    dataSubmittersSettings: {
      ...dataSubmittersSettings,
      gql: {
        ...typedGql,
        dynamicEndpoint: newDynamicEndpoint,
      },
    },
  };
  return result;
};
