import { IFormSettings } from "@/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";

export const migrateGqlCustomEndpoint = (prev: IFormSettings): IFormSettings => {
  const { dataLoadersSettings, ...restProps } = prev;
  const { gql } = dataLoadersSettings ?? {};

  const typedGql = gql as GqlSubmitterSettings;

  const staticEndpoint = typedGql?.staticEndpoint;
  if (!staticEndpoint || typeof (staticEndpoint) !== 'string')
    return prev;

  const result = {
    ...restProps,
    dataLoadersSettings: {
      ...dataLoadersSettings,
      gql: {
        ...typedGql,
        staticEndpoint: {
          url: staticEndpoint,
          httpVerb: 'get',
        },
      },
    },
  };
  return result;
};
