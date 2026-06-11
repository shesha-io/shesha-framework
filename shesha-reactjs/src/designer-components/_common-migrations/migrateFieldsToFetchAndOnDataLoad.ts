import { IFormSettings } from "@/interfaces";
import { GqlSubmitterSettings } from "@/providers/form/submitters/interfaces";
import { getStringPropertyOrUndefined } from "@/utils/object";

export const migrateFieldsToFetchAndOnDataLoad = (prev: IFormSettings): IFormSettings => {
  const { dataLoadersSettings, ...restProps } = prev;
  const fieldsToFetch = prev["fieldsToFetch"];
  const onDataLoad = getStringPropertyOrUndefined(prev, "onDataLoad");

  const { gql, custom } = dataLoadersSettings ?? {};

  const typedGql = gql as GqlSubmitterSettings;

  const result = {
    ...restProps,
    dataLoadersSettings: {
      ...dataLoadersSettings,
      gql: {
        ...typedGql,
        fieldsToFetch: fieldsToFetch,
      },
      custom: {
        ...custom,
        onDataLoad: onDataLoad,
      },
    },
  };
  return result;
};
