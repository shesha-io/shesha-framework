import { useMemo } from 'react';
import { IModelMetadata } from '@/interfaces/metadata';
import { getSettingsApiProperties } from '../publicApi/settings/metadata';
import { getUserApiProperties } from '../publicApi/currentUser/metadata';
import { useHttpClient } from './http/hooks';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import { getEntitiesApiProperties } from './entities/metadata';

/**
 * Generate and return context metadata for the application.
 *
 * @return {Promise<IModelMetadata>} Promise representing the context metadata for the application.
 */
export const useApplicationContextMetadata = () => {
  const httpClient = useHttpClient();
  const metadataBuilderFactory = useMetadataBuilderFactory();

  const contextMetadata = useMemo<Promise<IModelMetadata>>(() => {
    const builder = metadataBuilderFactory(SheshaCommonContexts.ApplicationContext);
    builder
      .addObject("user", "Current User", getUserApiProperties)
      .addObject("settings", "Settings", m => getSettingsApiProperties(m, httpClient))
      .addObject("entities", "Entities", m => getEntitiesApiProperties(m, httpClient))
      ;
    const meta = builder.build();

    /*
    allow injecting of application metadata to extend application
    */

    return Promise.resolve(meta);
  }, [httpClient]);

  return contextMetadata;
};