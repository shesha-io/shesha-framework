import { createNamedContext } from '@/utils/react';
import { IConfigurationLoader } from './configurationLoader';

export const ConfigurationItemsLoaderActionsContext = createNamedContext<IConfigurationLoader | undefined>(undefined, "ConfigurationItemsLoaderActionsContext");

