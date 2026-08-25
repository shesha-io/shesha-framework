import { IFormSettings } from "@/interfaces";
import { GqlLoaderSettings, isGqlLoaderSettings } from "@/providers/form/loaders/interfaces";
import { isNullOrWhiteSpace } from "@/utils/nullables";

/**
 * Repairs form settings that were saved with a `static` loader endpoint but no endpoint url.
 *
 * The lifecycle migration used to assign `endpointType: 'static'` when the legacy `getUrl` was
 * empty (the condition was inverted), so forms migrated in that period were persisted as
 * `Custom: static` with an undefined `staticEndpoint`. Such a form has no read endpoint at all,
 * and a valid static configuration always carries a url, so it's safe to restore the default.
 */
export const migrateEmptyStaticLoaderEndpoint = (prev: IFormSettings): IFormSettings => {
  const { dataLoadersSettings, ...restProps } = prev;
  const gql = dataLoadersSettings?.['gql'];
  if (!isGqlLoaderSettings(gql))
    return prev;

  const isBroken = gql.endpointType === 'static' && isNullOrWhiteSpace(gql.staticEndpoint?.url);
  if (!isBroken)
    return prev;

  const gqlLoaderSettings: GqlLoaderSettings = {
    ...gql,
    endpointType: 'default',
    staticEndpoint: undefined,
  };

  return {
    ...restProps,
    dataLoadersSettings: {
      ...dataLoadersSettings,
      gql: gqlLoaderSettings,
    },
  };
};
