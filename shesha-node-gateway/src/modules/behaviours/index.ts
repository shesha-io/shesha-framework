import { configurationStudioHandlers } from '../configurationStudio';
import { configurationHandlers } from '../configuration';
import { formConfigurationHandlers } from '../formConfiguration';
import { settingsHandlers } from '../settings';
import * as audit from './audit';
import * as entities from './entities';
import * as metadata from './metadata';
import * as modelConfigurations from './modelConfigurations';
import * as otp from './otp';
import * as permissions from './permissions';
import * as referenceLists from './referenceLists';
import * as sms from './sms';
import * as studio from './studio';
import * as users from './users';
import { BehaviourRegistry } from './types';

/**
 * The behaviour registry — everything a resource can name in `config/resources.json`.
 *
 * Keys follow the same `service.action` convention as the native handler registry, so a resource
 * entry reads like the route it serves (`"GetAllTree": "permissionedObject.getAllTree"`).
 *
 * The bootstrap handler maps are merged in as well: they are already `service.action` keyed and a
 * `NativeHandler` is a valid `BehaviourHandler` (it simply ignores the resource argument). That
 * keeps one registry to consult and means a service can be moved from an explicit operation entry
 * onto the generic wildcard without its handler changing.
 */
export const behaviours: BehaviourRegistry = {
  ...configurationHandlers,
  ...configurationStudioHandlers,
  ...formConfigurationHandlers,
  ...settingsHandlers,

  // Reference lists: the list is a `reference-list` config item, the items live inside it.
  'referenceList.getByName': referenceLists.getByName,
  'referenceList.delete': referenceLists.deleteList,
  'referenceListItem.create': referenceLists.createItem,
  'referenceListItem.update': referenceLists.updateItem,
  'referenceListItem.delete': referenceLists.deleteItem,

  // Permissioned objects are rows; permissions are `permission-definition` config items, so the
  // whole Permission surface is bespoke (its `id` is the name and `GetAll` returns a bare array).
  'permissionedObject.getAllTree': permissions.permissionedObjectGetAllTree,
  'permission.get': permissions.permissionGet,
  'permission.getAll': permissions.permissionGetAll,
  'permission.getAllTree': permissions.permissionGetAllTree,
  'permission.autocomplete': permissions.permissionAutocomplete,
  'permission.create': permissions.permissionCreate,
  'permission.update': permissions.permissionUpdate,
  'permission.updateParent': permissions.permissionUpdateParent,
  'permission.deleteByName': permissions.permissionDeleteByName,

  // One-time pins — shared by `Otp/*` and the user password-reset flows.
  'otp.sendPin': otp.sendPin,
  'otp.resendPin': otp.resendPin,
  'otp.verifyPin': otp.verifyPin,

  // Accounts.
  'user.getUserPasswordResetOptions': users.getUserPasswordResetOptions,
  'user.getSecurityQuestions': users.getSecurityQuestions,
  'user.sendEmailLink': users.sendEmailLink,
  'user.sendSmsOtp': users.sendSmsOtp,
  'user.sendSmsOTP': users.sendSmsOtp,
  'user.resetPasswordSendOtp': users.resetPasswordSendOtp,
  'user.validateResetCode': users.validateResetCode,
  'user.resetPasswordVerifyOtp': users.resetPasswordVerifyOtp,
  'user.validateSecurityQuestions': users.validateSecurityQuestions,
  'user.resetPasswordUsingToken': users.resetPasswordUsingToken,
  'user.changePassword': users.changePassword,
  'user.resetPassword': users.resetPassword,
  'user.activate': users.activateUser,
  'user.inactivate': users.inactivateUser,
  'userManagement.create': users.userManagementCreate,

  // Audit trail, designer metadata, exposing items, SMS gateways, entity designer.
  'entityHistory.getAuditTrail': audit.getAuditTrail,
  'entities.get': entities.get,
  'entities.getAll': entities.getAll,
  'entities.create': entities.create,
  'entities.update': entities.update,
  'entities.delete': entities.remove,
  'entities.specifications': entities.specifications,
  'metadata.entityTypeAutocomplete': metadata.entityTypeAutocomplete,
  'metadata.typeAutocomplete': metadata.typeAutocomplete,
  'metadata.getNonFrameworkRelatedProperties': metadata.getNonFrameworkRelatedProperties,
  'configurationItemToExpose.getAll': studio.configurationItemToExposeGetAll,
  'configurationStudio.expose': studio.configurationStudioExpose,
  'sms.gateways': sms.gateways,
  'modelConfigurations.getByName': modelConfigurations.getByName,
  'modelConfigurations.getById': modelConfigurations.getById,
  'modelConfigurations.getAll': modelConfigurations.getAll,
  'modelConfigurations.create': modelConfigurations.create,
  'modelConfigurations.update': modelConfigurations.update,
  'modelConfigurations.merge': modelConfigurations.merge,
};

export { audit, entities, metadata, modelConfigurations, otp, permissions, referenceLists, sms, studio, users };
export type { BehaviourHandler, BehaviourRegistry } from './types';
