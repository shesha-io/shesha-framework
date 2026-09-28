import { NativeRegistry } from '../gateway/native';
import { modelConfigurationHandlers } from './behaviours/modelConfigurations';
import { configurationHandlers } from './configuration';
import { configurationStudioHandlers } from './configurationStudio';
import { dynamicCrudDispatch } from './dynamicCrud';
import { formConfigurationHandlers } from './formConfiguration';
import { appServiceDispatch } from './resourceRouter';
import { sessionHandlers } from './session';
import { settingsHandlers } from './settings';
import { tokenAuthHandlers } from './tokenAuth';

/**
 * Registers all native (bootstrap/core) handlers. These serve as the built-in
 * fallback so the gateway works out-of-the-box, and as living examples of the
 * DTO shapes any external backend must produce (via `adapter` mappings).
 */
export const registerBootstrapHandlers = (registry: NativeRegistry): void => {
  registry.registerAll(tokenAuthHandlers);
  registry.registerAll(sessionHandlers);
  registry.registerAll(configurationHandlers);
  registry.registerAll(settingsHandlers);
  registry.registerAll(formConfigurationHandlers);
  registry.registerAll(configurationStudioHandlers);
  registry.registerAll(modelConfigurationHandlers);
};

/**
 * Registers the two generic routes — the "single endpoint" half of the gateway.
 *
 * Every wildcard operation in `operations.json` points at one of these two handlers:
 * `appService.dispatch` serves anything `config/resources.json` describes, and `dynamic.crud`
 * serves any entity under `/api/dynamic/{module}/{entity}/Crud/{action}`. Both fall back to the
 * upstream for anything they do not recognise, so adding a service is a config edit, never a deploy.
 */
export const registerGenericRoutes = (registry: NativeRegistry): void => {
  registry.register('appService.dispatch', appServiceDispatch);
  registry.register('dynamic.crud', dynamicCrudDispatch);
};
