import { useMemo } from 'react';
import { IModelMetadata } from '@/interfaces/metadata';
import { MetadataBuilder } from '@/utils/metadata/metadataBuilder';
import { getSettingsApiProperties } from '../publicApi/settings/metadata';
import { getUserApiProperties } from '../publicApi/currentUser/metadata';
import { useHttpClient } from './http/hooks';

/**
 * Generate and return context metadata for the application.
 *
 * @return {Promise<IModelMetadata>} Promise representing the context metadata for the application.
 */
export const useApplicationContextMetadata = () => {
    const httpClient = useHttpClient();
  
    const contextMetadata = useMemo<Promise<IModelMetadata>>(() => {
      const builder = new MetadataBuilder();
      builder
        .addObject("user", "Current User", getUserApiProperties)
        .addObject("settings", "Settings", m => getSettingsApiProperties(m, httpClient));
      const meta = builder.build();
  
      return Promise.resolve(meta);
    }, [httpClient]);

    return contextMetadata;
};