import { useMemo } from 'react';
import { IModelMetadata } from '@/interfaces/metadata';
import { getSettingsApiProperties } from '../publicApi/settings/metadata';
import { getUserApiProperties } from '../publicApi/currentUser/metadata';
import { useHttpClient } from './http/hooks';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import { getEntitiesApiProperties } from './entities/metadata';
import { ApplicationPluginRegistration } from '../context/applicationContext';
import { getUtilsApiProperties } from './utils/metadata';
import { getFormsApiProperties } from './forms/metadata';
import { getNavigatorApiProperties } from './navigator/metadata';
import { IObjectMetadataBuilder } from '@/utils/metadata/metadataBuilder';


export interface UseApplicationContextMetadataProps {
  plugins: ApplicationPluginRegistration[];
}

/**
 * Generate and return context metadata for the application.
 *
 * @return {Promise<IModelMetadata>} Promise representing the context metadata for the application.
 */
export const useApplicationContextMetadata = (props: UseApplicationContextMetadataProps): Promise<IModelMetadata> => {
  const httpClient = useHttpClient();
  const metadataBuilderFactory = useMetadataBuilderFactory();

  const contextMetadata = useMemo<Promise<IModelMetadata>>(() => {
    const metadataBuilder = metadataBuilderFactory();
    const apiBuilder = metadataBuilder.object(SheshaCommonContexts.ApplicationContext) as IObjectMetadataBuilder;
    apiBuilder
      .addObject("user", "Current User", getUserApiProperties)
      .addObject("settings", "Settings", (m) => getSettingsApiProperties(m, httpClient))
      .addObject("entities", "Entities", (m) => getEntitiesApiProperties(m, httpClient))
      .addObject("forms", "Forms", (m) => getFormsApiProperties(m))
      .addObject("utils", "Utils", (m) => getUtilsApiProperties(m))
      .addObject("navigator", "Navigator", (m) => getNavigatorApiProperties(m))
    ;

    props.plugins.forEach((plugin) => {
      plugin.buildMetadata(apiBuilder, metadataBuilder);
    });

    const meta = apiBuilder.build();

    return Promise.resolve(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, props.plugins]);

  return contextMetadata;
};
