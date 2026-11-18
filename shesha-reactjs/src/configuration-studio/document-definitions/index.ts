import { EntityDocumentDefinition } from './entity';
import { FormDocumentDefinition } from './form';
import { NotificationDocumentDefinition } from './notification';
import { NotificationChannelDocumentDefinition } from './notification-channel';
import { OtpConfigDocumentDefinition } from './otp-config';
import { PermissionDocumentDefinition } from './permission-definition';
import { ReferenceListDocumentDefinition } from './reference-list';
import { RoleDocumentDefinition } from './role';
import { SettingDocumentDefinition } from './setting';
import { HomeDocumentDefinition } from './special-home';
import { SettingsDocumentDefinition } from './special-settings';

export const SheshaDocumentDefinitions = [
  // special docs
  HomeDocumentDefinition,
  SettingsDocumentDefinition,

  // configuration items
  EntityDocumentDefinition,
  FormDocumentDefinition,
  NotificationDocumentDefinition,
  NotificationChannelDocumentDefinition,
  OtpConfigDocumentDefinition,
  PermissionDocumentDefinition,
  ReferenceListDocumentDefinition,
  RoleDocumentDefinition,
  SettingDocumentDefinition,
];
