# Comprehensive Endpoint Catalog — Shesha Framework

> Generated: 2026-03-15
> Source: Full-stack analysis of `shesha-reactjs/`, `shesha-core/`, and 258 form configurations from the running backend database.

---

## Table of Contents

1. [Methodology](#methodology)
2. [Section A — Endpoints Referenced by Coded Frontend Pages](#section-a--endpoints-referenced-by-coded-frontend-pages)
3. [Section B — Endpoints Referenced by Form Configurations (Database)](#section-b--endpoints-referenced-by-form-configurations-database)
4. [Section C — Entity Bindings (Implicit CRUD Endpoints via Forms)](#section-c--entity-bindings-implicit-crud-endpoints-via-forms)
5. [Section D — Embedded JavaScript API Calls in Form Configs](#section-d--embedded-javascript-api-calls-in-form-configs)
6. [Section E — Data-Source Components in Form Configs](#section-e--data-source-components-in-form-configs)
7. [Section F — Full Backend API Surface (Controllers + AppServices)](#section-f--full-backend-api-surface-controllers--appservices)
8. [Section G — Cross-Reference Matrix](#section-g--cross-reference-matrix)

---

## Methodology

Three sources were analyzed:

| Source | Method | Count |
|--------|--------|-------|
| **Coded frontend** (`shesha-reactjs/src/`) | Static analysis of all `.ts`/`.tsx` files: `apis/`, `providers/`, `hooks/`, `components/`, `designer-components/`, `generic-pages/`, `app/` | 53 files with API references |
| **Form configurations** (database) | Queried `GET /api/services/Shesha/FormConfiguration/GetAll` (258 forms), parsed all JSON markup recursively | 258 forms analyzed |
| **Backend controllers** (`shesha-core/src/`) | Scanned all `[HttpGet]`/`[HttpPost]`/`[Route]` attributes, AppService classes, and ABP auto-generated endpoints | 120+ service classes |

Reference types:
- **coded-frontend** — Hard-coded in TypeScript/React source files
- **form-config-value** — Configured as a URL property in a form component (e.g., `getUrl`, `apiUrl`, `deleteUrl`)
- **embedded-javascript** — Inside a JavaScript snippet in a form config (`expression`, `actionScript`, `customJsCode`)
- **entity-binding** — Implicit via form `modelType` (auto-resolves to entity CRUD endpoints)
- **autocomplete-datasource** — URL set on an autocomplete/entityPicker component
- **data-source-component** — `datatableContext`, `entityPicker`, or `subForm` component referencing an entity type

---

## Section A — Endpoints Referenced by Coded Frontend Pages

These endpoints are hard-coded in the React/TypeScript source of `shesha-reactjs/src/`.

### Authentication & Session

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/TokenAuth/Authenticate` | POST | `apis/tokenAuth.ts`, `providers/auth/` | User login |
| `/api/TokenAuth/RefreshToken` | POST | `apis/tokenAuth.ts` | Token refresh |
| `/api/TokenAuth/SignOff` | POST | `apis/tokenAuth.ts` | Logout |
| `/api/services/app/Session/GetCurrentLoginInfo` | GET | `apis/session.ts`, `providers/auth/` | Current user session |

### Form Configuration

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/Shesha/FormConfiguration/Get` | GET | `apis/formConfiguration.ts`, `providers/form/api.ts` | Get form by ID |
| `/api/services/Shesha/FormConfiguration/GetByName` | GET | `apis/formConfiguration.ts`, `providers/formManager/` | Get form by module/name |
| `/api/services/Shesha/FormConfiguration/UpdateMarkup` | PUT | `apis/formConfiguration.ts` | Save form designer changes |
| `/api/services/Shesha/FormConfiguration/Create` | POST | `apis/formConfiguration.ts` | Create new form |
| `/api/services/Shesha/FormConfiguration/CheckPermissions` | POST | `apis/formConfiguration.ts` | Batch permission check |
| `/api/services/Shesha/FormConfiguration/GetJson` | GET | `apis/formConfiguration.ts` | Export form as JSON |
| `/api/services/Shesha/FormConfiguration/ImportJson` | POST | `apis/formConfiguration.ts` | Import form from JSON |

### Configurable Components

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/Shesha/ConfigurableComponent/GetByName` | GET | `apis/configurableComponent.ts` | Get component config |
| `/api/services/Shesha/ConfigurableComponent/UpdateSettings` | PUT | `apis/configurableComponent.ts` | Save component settings |

### Generic Entity CRUD (Dynamic)

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Entities/Get` | GET | `apis/entities.ts`, `providers/sheshaApplication/publicApi/entities/` | Get entity by type+ID |
| `/api/services/app/Entities/GetAll` | GET | `apis/entities.ts` | List entities with filtering |
| `/api/services/app/Entities/ExportToExcel` | POST | `apis/entities.ts` | Export to Excel |

### Metadata

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Metadata/Get` | GET | `apis/metadata.ts`, `providers/metadataDispatcher/` | Entity metadata |
| `/api/services/app/Metadata/EntityTypeAutocomplete` | GET | `apis/metadata.ts` | Entity type search |
| `/api/services/app/Metadata/TypeAutocomplete` | GET | `apis/metadata.ts` | Type search |
| `/api/services/app/Metadata/Specifications` | GET | `apis/metadata.ts` | Entity specifications |

### Entity Configuration

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/EntityConfig/GetEntityConfigForm` | GET | `apis/entityConfig.ts` | Get entity form ref |
| `/api/services/app/EntityConfig/GetMainDataList` | GET | `apis/entityConfig.ts` | List entity configs |
| `/api/services/app/EntityConfig/GetClientApiConfigurations` | GET | `apis/entityConfig.ts` | Client API config |
| `/api/services/app/EntityConfig/SyncClientApi` | POST | `apis/entityConfig.ts` | Sync client API |
| `/api/services/app/EntityConfig/Delete` | DELETE | `apis/entityConfig.ts` | Delete entity config |

### Model Configurations

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/ModelConfigurations` | GET | `apis/modelConfigurations.ts` | Get by name |
| `/api/ModelConfigurations/{id}` | GET | `apis/modelConfigurations.ts` | Get by ID |
| `/api/ModelConfigurations` | POST | `apis/modelConfigurations.ts` | Create |
| `/api/ModelConfigurations` | PUT | `apis/modelConfigurations.ts` | Update |
| `/api/ModelConfigurations/merge` | POST | `apis/modelConfigurations.ts` | Merge configs |

### Permissions

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Permission/GetAllTree` | GET | `apis/permission.ts` | Permission tree |
| `/api/services/app/Permission/UpdateParent` | PUT | `apis/permission.ts` | Move permission |
| `/api/services/app/Permission/Delete` | DELETE | `apis/permission.ts` | Delete permission |
| `/api/services/app/Permission/IsPermissionGranted` | GET | `apis/permission.ts` | Check permission |
| `/api/services/app/permission/autocomplete` | GET | `apis/permission.ts` | Permission autocomplete |
| `/api/services/app/PermissionedObject/GetAllTree` | GET | `apis/permissionedObject.ts` | Protected objects tree |

### Reference Lists

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/ReferenceList/GetByName` | GET | `apis/referenceList.ts`, `providers/refList/` | Get ref list by name |

### Notes

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Note/GetList` | GET | `apis/note.ts`, `providers/notes/` | List notes |
| `/api/services/app/Note/Create` | POST | `apis/note.ts` | Create note |
| `/api/services/app/Note/Update` | PUT | `apis/note.ts` | Update note |
| `/api/services/app/Note/Delete` | DELETE | `apis/note.ts` | Delete note |

### Settings

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Settings/GetValue` | GET | `apis/settings.ts`, `providers/sheshaApplication/publicApi/settings/` | Get setting |
| `/api/services/app/Settings/UpdateValue` | POST | `apis/settings.ts` | Update setting |
| `/api/services/app/Settings/GetUserValue` | POST | `apis/settings.ts` | Get user setting |
| `/api/services/app/Settings/UpdateUserValue` | POST | `apis/settings.ts` | Update user setting |
| `/api/services/app/Settings/GetConfigurations` | GET | `apis/settings.ts` | List all settings |

### File Storage

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/StoredFile` | GET | `apis/storedFile.ts`, `providers/storedFile/` | Get file metadata |
| `/api/StoredFile/Download` | GET | `apis/storedFile.ts` | Download file |
| `/api/StoredFile/Base64String` | GET | `apis/storedFile.ts` | File as Base64 |
| `/api/StoredFile/Upload` | POST | `apis/storedFile.ts` | Upload file |
| `/api/StoredFile/UploadNewVersion` | POST | `apis/storedFile.ts` | Upload new version |
| `/api/StoredFile/Delete` | DELETE | `apis/storedFile.ts` | Delete file |
| `/api/StoredFile/DownloadZip` | GET | `apis/storedFile.ts` | Download as ZIP |
| `/api/StoredFile/FilesList` | GET | `apis/storedFile.ts` | List files for entity |
| `/api/StoredFile/EntityProperty` | GET | `apis/storedFile.ts` | File as entity property |
| `/api/StoredFile/StoredFile/{fileId}/Versions` | GET | `apis/storedFile.ts` | File versions |
| `/api/StoredFile` | PUT | `apis/storedFile.ts` | Update/replace file |

### User Management

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/User/ResetPasswordSendOtp` | POST | `apis/user.ts` | Password reset OTP |
| `/api/services/app/User/ResetPasswordVerifyOtp` | POST | `apis/user.ts` | Verify OTP |
| `/api/services/app/User/ResetPasswordUsingToken` | POST | `apis/user.ts` | Reset password |

### Configuration Items (Versioning)

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/ConfigurationItem/ExportPackage` | POST | `components/configurationFramework/itemsExport/` | Export package |
| `/api/services/app/ConfigurationItem/AnalyzePackage` | POST | `components/configurationFramework/itemsImport/` | Analyze import |
| `/api/services/app/ConfigurationItem/ImportPackage` | POST | `components/configurationFramework/itemsImport/` | Import package |
| `/api/services/app/ConfigurationItem/CreateNewVersion` | POST | `utils/configurationFramework/actions.tsx` | New version |
| `/api/services/app/ConfigurationItem/UpdateStatus` | POST | `utils/configurationFramework/actions.tsx` | Status change |
| `/api/services/app/ConfigurationItem/CancelVersion` | POST | `utils/configurationFramework/actions.tsx` | Cancel version |
| `/api/services/app/ConfigurationItem/Delete` | POST | `utils/configurationFramework/actions.tsx` | Delete item |
| `/api/services/app/ConfigurationItem/ClearClientSideCache` | POST | `utils/configurationFramework/actions.tsx` | Cache clear |
| `/api/services/app/ConfigurationItem/GetExportFlatTree` | GET | `components/configurationFramework/itemsExport/` | Export tree |

### API Discovery

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/Api/Endpoints` | GET | `apis/api.ts` | Endpoint autocomplete |

### Process Monitoring

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/ProcessMonitor/GetProcessState` | GET | `providers/processMonitor/` | Background process state |
| `/api/services/app/ProcessMonitor/DownloadLogFile` | GET | `providers/processMonitor/` | Download process log |

### Miscellaneous (Components)

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|
| `/api/services/app/EntityHistory/GetAuditTrail` | GET | `designer-components/` | Audit trail |
| `/api/services/app/Entities/Reorder` | POST | `components/kanban/utils.ts` | Kanban reorder |

---

## Section B — Endpoints Referenced by Form Configurations (Database)

These are endpoints explicitly configured as URL properties (e.g., `getUrl`, `apiUrl`, `deleteUrl`, `actionUrl`) in the 258 form configurations stored in the database.

### Form CRUD Endpoints (referenced from form designer forms)

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/Shesha/FormConfiguration/Get` | GET | `form-details`, `form-template-details` | component_getUrl |
| `/api/services/Shesha/FormConfiguration/Create` | POST | `form-details`, `form-create`, `forms` | form_config_value |
| `/api/services/Shesha/FormConfiguration/Update` | PUT | `form-details` | form_config_value |
| `/api/services/Shesha/FormConfiguration/Copy` | POST | `form-copy` | form_config_value |
| `/api/services/Shesha/FormConfiguration/ImportJson` | POST | `form-import-json` | form_config_value |
| `/api/services/Shesha/FormConfiguration/MoveToModule` | POST | `form-details` | form_config_value |
| `/api/services/Shesha/FormConfiguration/PublishAll` | POST | `forms` | form_config_value |

### User & Role Management

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/UserManagement/Create` | POST | `registration`, `user-create`, `user-management-create` | embedded_javascript |
| `/api/services/app/UserManagement/Update` | PUT | `user-management-details` | form_config_value |
| `/api/services/app/User/Get` | GET | `update-password-reset-methods`, `user-details`, `user-management-details` | component_getUrl, embedded_javascript |
| `/api/services/app/User/InactivateUser` | POST | `user-details`, `user-management-details` | embedded_javascript |
| `/api/services/app/User/ActivateUser` | POST | `user-details`, `user-management-details` | embedded_javascript |
| `/api/services/app/User/ChangePassword` | POST | `change-password` | embedded_javascript |
| `/api/services/app/User/ResetPasswordUsingToken` | POST | `reset-password` | embedded_javascript |
| `/api/services/app/User/ResetPassword` | POST | `user-reset-password`, `user-management-reset-password` | form_config_value |
| `/api/services/app/User/ValidateResetCode` | POST | `otp-verification-page`, `email-link-verification` | embedded_javascript |
| `/api/services/app/User/GetUserPasswordResetOptions` | GET | `forgot-password`, `select-reset-method` | embedded_javascript |
| `/api/services/app/User/SendEmailLink` | POST | `select-reset-method` | embedded_javascript |
| `/api/services/app/User/SendSMSOTP` | POST | `select-reset-method` | embedded_javascript |
| `/api/services/app/User/Update` | PUT | `update-password-reset-methods` | form_config_value |
| `/api/services/app/User/ValidateSecurityQuestions` | POST | `security-questions` | form_config_value |
| `/api/services/app/ShaRole/Get` | GET | `role-details` | component_getUrl |
| `/api/services/app/ShaRole/Update` | PUT | `role-details` | form_config_value |
| `/api/services/app/ShaRole/Delete` | DELETE | `roles`, `role-details` | form_config_value |
| `/api/services/app/ShaRoleAppointedPerson/Get` | GET | `assign-user-role` | component_getUrl |
| `/api/services/app/ShaRoleAppointedPerson/Create` | POST | `assign-user-role` | form_config_value |
| `/api/services/app/ShaRoleAppointedPerson/Update` | PUT | `assign-user-role` | form_config_value |
| `/api/services/app/ShaRoleAppointedPerson/Delete` | DELETE | `assign-user-role`, `role-details` | embedded_javascript, form_config_value |

### OTP (One-Time Pin)

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/Otp/SendPin` | POST | `otp-verification` | embedded_javascript |
| `/api/services/app/Otp/ResendPin` | POST | `otp-verification` | embedded_javascript |
| `/api/services/app/Otp/VerifyPin` | POST | `otp-verification` | embedded_javascript |
| `/api/services/app/Otp/GetSettings` | GET | `otp-settings` | component_getUrl |

### Notifications

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/Notification/Get` | GET | `notification-details`, `notifications-create` | component_getUrl |
| `/api/services/app/Notification/GetAll` | GET | `notifications` | component_getUrl |
| `/api/services/app/Notification/Delete` | DELETE | `notifications` | form_config_value |

### Notification Type Configuration

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/dynamic/Shesha/NotificationTypeConfig/Crud/Create` | POST | `notification-type-config-create`, `notification-type-config-details` | form_config_value |
| `/api/dynamic/Shesha/NotificationTypeConfig/Crud/Update` | PUT | `notification-type-config-create`, `notification-type-config-details` | form_config_value |
| `/api/dynamic/Shesha/NotificationTypeConfig/Crud/Delete` | DELETE | `notification-type-configs` | form_config_value |
| `/api/dynamic/Shesha/NotificationTemplate/Crud/Delete` | DELETE | `notification-type-config-details` | form_config_value |

### Reference Lists

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/ReferenceList/Get` | GET | `reference-list-details` | component_getUrl |
| `/api/services/app/ReferenceListItem/Delete` | DELETE | `reference-list-details` | form_config_value |
| `/api/services/app/ReferenceListItem/Get` | GET | `reference-list-item-details-view` | component_getUrl |

### Permission Management

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/Permission/Get` | GET | `permission-configurator` | component_getUrl |
| `/api/services/app/PermissionedObject/Get` | GET | `permissioned-objects` | component_getUrl |
| `/api/services/app/PermissionedObject/Update` | PUT | `permissioned-objects` | form_config_value |

### Scheduler

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/Scheduler/ScheduledJob/StartJob` | POST | `scheduled-job-details` | embedded_javascript |
| `/api/services/Scheduler/ScheduledJobExecution/Get` | GET | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobExecution/Create` | POST | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobExecution/Update` | PUT | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobExecution/Delete` | DELETE | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobTrigger/GetAll` | GET | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobTrigger/Create` | POST | `scheduled-job-details` | form_config_value |
| `/api/services/Scheduler/ScheduledJobTrigger/Delete` | DELETE | `scheduled-job-details` | form_config_value |

### Settings

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/AuthorizationSettings/GetSettings` | GET | `settings-security` | component_getUrl |
| `/api/services/app/AuthorizationSettings/UpdateSettings` | PUT | `settings-security` | form_config_value |
| `/api/v2/Sms/Settings` | GET | `settings-sms` | component_getUrl |
| `/api/Sms/Gateways` | GET | `sms-settings`, `sms-settings-gateway`, `settings-sms` | autocomplete_datasource |

### Front-End Applications

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/dynamic/Shesha/FrontEndApp/Crud/Delete` | DELETE | `front-end-applications` | form_config_value |
| `/api/dynamic/Shesha/FrontEndApp/Crud/GetAll` | GET | `user-details`, `user-management-details` | embedded_javascript |
| `/api/dynamic/Shesha/FrontEndApp/Delete` | DELETE | `front-end-applications` | form_config_value |

### Entity History

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/EntityHistory/GetAuditTrail` | GET | `entity-change-audit-log` | form_config_value |

### Home URL Routes (Enterprise)

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/Enterprise/HomeUrlRoute/Get` | GET | `home-url-route-details`, `home-url-route-create` | component_getUrl |
| `/api/services/Enterprise/HomeUrlRoute/Create` | POST | `home-url-route-create`, `home-url-route-details` | form_config_value |
| `/api/services/Enterprise/HomeUrlRoute/Update` | PUT | `home-url-route-create`, `home-url-route-details` | form_config_value |
| `/api/services/Enterprise/HomeUrlRoute/Delete` | DELETE | `home-url-routes`, `home-url-route-create`, `home-url-route-details` | form_config_value |

### Dynamic Entity CRUD (from forms)

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/dynamic/Shesha/SecurityQuestion/Crud/Delete` | DELETE | `security-questions` | form_config_value |
| `/api/dynamic/Shesha/SecurityQuestion/Delete` | DELETE | `security-questions-view` | form_config_value |
| `/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete` | DELETE | `user-details`, `user-management-details`, `role-details` | form_config_value |
| `/api/dynamic/Shesha/ShaRoleAppointedPerson/Delete` | DELETE | `user-details` | form_config_value |

### Metadata (from forms)

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|
| `/api/services/app/Metadata/EntityTypeAutocomplete` | GET | `form-details`, `form-create` | autocomplete_datasource |

---

## Section C — Entity Bindings (Implicit CRUD Endpoints via Forms)

When a form has a `modelType`, the framework auto-resolves CRUD API endpoints from entity metadata. This means each entity binding implicitly references `Get`, `GetAll`, `Create`, `Update`, `Delete` endpoints for that entity.

| Entity Type | Bound Form(s) | Implied CRUD Endpoint Pattern |
|-------------|---------------|-------------------------------|
| `Abp.Auditing.AuditLog` | `logon-audit` | `/api/services/app/AuditLogCrud/*` |
| `Abp.Authorization.Users.UserLogin` | `login`, `login-public-portal`, `otp-verification`, `registration` | `/api/services/app/UserLoginCrud/*` |
| `Abp.Notifications.NotificationInfo` | `notification-message` | `/api/services/app/NotificationInfoCrud/*` |
| `Core.PersonRelationship` | _(entityPicker in assign-user-role)_ | `/api/services/app/PersonRelationshipCrud/*` |
| `His.HisPractitioner` | `user-management-reset-password`, `user-reset-password` | `/api/dynamic/His/HisPractitioner/Crud/*` |
| `Shesha.Core.Address` | _(entityPicker in person-details, site-details, etc.)_ | `/api/dynamic/Shesha/Address/Crud/*` |
| `Shesha.Core.FormConfiguration` | `forms`, `form-templates`, `form-details` | `/api/services/Shesha/FormConfiguration/*` |
| `Shesha.Core.MessageTemplate` | `notification-templates` | `/api/dynamic/Shesha/MessageTemplate/Crud/*` |
| `Shesha.Core.NotificationTemplate` | `notification-template-create`, `notification-type-config-details` | `/api/dynamic/Shesha/NotificationTemplate/Crud/*` |
| `Shesha.Core.Organisation` | `accounts-table`, `organisations-table`, `sites-table`, `organisation-details` | `/api/dynamic/Shesha/Organisation/Crud/*` |
| `Shesha.Core.Person` | `persons-table`, `person-details`, `person-create`, `account-details`, `site-details`, `organisation-details`, `user-management-table`, `users` | `/api/dynamic/Shesha/Person/Crud/*` |
| `Shesha.Core.SecurityQuestion` | `security-questions`, `security-questions-view`, `security-question-create`, `security-question-details` | `/api/dynamic/Shesha/SecurityQuestion/Crud/*` |
| `Shesha.Core.ShaRole` | `roles`, `role-assign-user`, `role-create` | `/api/services/app/ShaRole/*` |
| `Shesha.Core.ShaRoleAppointedPerson` | `role-details`, `user-details`, `user-management-details` | `/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/*` |
| `Shesha.Domain.Account` | `accounts-table`, `account-details`, `account-create` | `/api/dynamic/Shesha/Account/Crud/*` |
| `Shesha.Domain.ConfigurationItems.Module` | `modules` | `/api/dynamic/Shesha/Module/Crud/*` |
| `Shesha.Domain.EntityChangeAuditLog` | `entity-change-audit-log`, `entity-change-audit-log-datalist` | `/api/dynamic/Shesha/EntityChangeAuditLog/Crud/*` |
| `Shesha.Domain.FrontEndApp` | `front-end-applications`, `front-end-application-create`, `front-end-application-details` | `/api/dynamic/Shesha/FrontEndApp/Crud/*` |
| `Shesha.Domain.Notification` | `notifications`, `notification-create`, `notifications-create` | `/api/services/app/Notification/*` |
| `Shesha.Domain.NotificationChannelConfig` | `notification-channel-configs`, `notification-settings`, `notification-type-override-channel-create` | `/api/dynamic/Shesha/NotificationChannelConfig/Crud/*` |
| `Shesha.Domain.NotificationMessage` | `notifications-audit` | `/api/dynamic/Shesha/NotificationMessage/Crud/*` |
| `Shesha.Domain.NotificationTypeConfig` | `notification-type-configs`, `notification-template-details`, `notification-template-create` | `/api/dynamic/Shesha/NotificationTypeConfig/Crud/*` |
| `Shesha.Domain.OrganisationBase` | `account-create`, `organisation-create`, `site-create` | `/api/dynamic/Shesha/OrganisationBase/Crud/*` |
| `Shesha.Domain.OtpAuditItem` | `otp-audit` | `/api/dynamic/Shesha/OtpAuditItem/Crud/*` |
| `Shesha.Domain.ShaUserLoginAttempt` | `logon-attempt`, `logon-audit` | `/api/dynamic/Shesha/ShaUserLoginAttempt/Crud/*` |
| `Shesha.Domain.Site` | `sites-table`, `site-details`, `site-create` | `/api/dynamic/Shesha/Site/Crud/*` |
| `Shesha.Enterprise.HomeUrlRoute` | `home-url-routes`, `home-url-route-create`, `home-url-route-details` | `/api/services/Enterprise/HomeUrlRoute/*` |
| `Shesha.Framework.ReferenceList` | `reference-lists`, `reference-list-create`, `reference-list-details` | `/api/services/app/ReferenceList/*` |
| `Shesha.Framework.ReferenceListItem` | `reference-list-details`, `reference-list-item-create`, `reference-list-item-edit`, `reference-list-item-details-view` | `/api/services/app/ReferenceListItem/*` |
| `Shesha.Scheduler.ScheduledJob` | `scheduled-job`, `scheduled-jobs` | `/api/services/Scheduler/ScheduledJob/*` |
| `Shesha.Scheduler.ScheduledJobExecution` | `scheduled-job-execution`, `scheduled-job-details` | `/api/services/Scheduler/ScheduledJobExecution/*` |
| `Shesha.Scheduler.Domain.ScheduledJobTrigger` | `scheduled-job-trigger-create`, `scheduled-job-trigger-details`, `scheduled-job-details` | `/api/services/Scheduler/ScheduledJobTrigger/*` |

### DTO-Bound Forms (Settings/Config forms that submit to custom endpoints)

| DTO Type | Form(s) | Actual Endpoint |
|----------|---------|-----------------|
| `Shesha.Authorization.Settings.Dto.AuthorizationSettingsDto` | `settings-security` | `/api/services/app/AuthorizationSettings/UpdateSettings` |
| `Shesha.Email.SmtpSettingsDto` | _(email settings)_ | `/api/services/app/EmailSender/UpdateSmtpSettings` |
| `Shesha.Otp.Configuration.OtpSettingsDto` | `otp-settings` | `/api/services/app/Otp/UpdateSettings` |
| `Shesha.Sms.Dtos.SmsSettingsDto` | _(sms settings)_ | `/api/v2/Sms/Settings` |

---

## Section D — Embedded JavaScript API Calls in Form Configs

These are API endpoints called from JavaScript code embedded inside form configuration `expression`, `actionScript`, or `customJsCode` fields.

| Endpoint | HTTP Method | Form(s) | JS Pattern |
|----------|------------|---------|------------|
| `/api/services/app/UserManagement/Create` | POST | `registration`, `user-create`, `user-management-create` | `http.post("/api/services/app/UserManagement/Create", {...form.data})` |
| `/api/services/app/User/InactivateUser` | POST | `user-details`, `user-management-details` | `http.post("/api/services/app/User/InactivateUser?userId=${data?.user?.id}")` |
| `/api/services/app/User/ActivateUser` | POST | `user-details`, `user-management-details` | `http.post("/api/services/app/User/ActivateUser?userId=${data?.user?.id}")` |
| `/api/services/app/User/ChangePassword` | POST | `change-password` | `http.post(PATH, {currentPassword, newPassword})` |
| `/api/services/app/User/GetUserPasswordResetOptions` | GET | `forgot-password`, `select-reset-method` | `const PATH = "/api/services/app/User/GetUserPasswordResetOptions?username=${username}"` |
| `/api/services/app/User/SendEmailLink` | POST | `select-reset-method` | `http.post(PATH, {username, ...})` |
| `/api/services/app/User/SendSMSOTP` | POST | `select-reset-method` | `http.post(PATH, {username, ...})` |
| `/api/services/app/User/ValidateResetCode` | POST | `otp-verification-page`, `email-link-verification` | `http.post(PATH, {username, resetCode})` |
| `/api/services/app/User/ResetPasswordUsingToken` | POST | `reset-password` | `http.post(PATH, {id, username, token, newPassword})` |
| `/api/services/app/User/ValidateSecurityQuestions` | POST | `security-questions` | `http.post(PATH, {username, submittedAnswers})` |
| `/api/services/app/Otp/SendPin` | POST | `otp-verification` | `http.post(PATH, {sendType, sendTo})` |
| `/api/services/app/Otp/ResendPin` | POST | `otp-verification` | `http.post(PATH, {operationId})` |
| `/api/services/app/Otp/VerifyPin` | POST | `otp-verification` | `http.post(PATH, {operationId, pin})` |
| `/api/services/app/ShaRoleAppointedPerson/Delete` | POST | `role-details` | `http.post("/api/services/app/ShaRoleAppointedPerson/Delete")` |
| `/api/services/Scheduler/ScheduledJob/StartJob` | POST | `scheduled-job-details` | `http.post("/api/services/Scheduler/ScheduledJob/StartJob?id=${id}")` |
| `/api/dynamic/Shesha/FrontEndApp/Crud/GetAll` | GET | `user-details`, `user-management-details` | `http.get("/api/dynamic/Shesha/FrontEndApp/Crud/GetAll")` |
| `https://mpdoh-his-be-test.azurewebsites.net/api/services/app/AuthorizationSettings/UpdateSettings` | PUT | `settings-security` | Hard-coded external URL (commented out, but present in code) |

---

## Section E — Data-Source Components in Form Configs

These are form components (`datatableContext`, `entityPicker`, `autocomplete`) that bind to entities or URLs for data fetching.

### datatableContext Components (data tables bound to entities)

| Entity Type | Form(s) |
|-------------|---------|
| `Shesha.Core.FormConfiguration` | `forms`, `form-templates`, `form-details` |
| `Shesha.Core.NotificationTemplate` | `notification-type-config-details`, `notification-details` |
| `Shesha.Core.Organisation` | `organisations-table`, `organisation-details` |
| `Shesha.Core.Person` | `user-management-table`, `user-management-new`, `users`, `persons-table` |
| `Shesha.Core.SecurityQuestion` | `security-questions`, `security-questions-view` |
| `Shesha.Core.ShaRole` | `roles` |
| `Shesha.Core.ShaRoleAppointedPerson` | `role-details`, `user-details`, `user-management-details` |
| `Shesha.Domain.Account` | `account-details` |
| `Shesha.Domain.ConfigurationItems.Module` | `modules` |
| `Shesha.Domain.FrontEndApp` | `front-end-applications` |
| `Shesha.Domain.Notification` | `notifications` |
| `Shesha.Domain.NotificationChannelConfig` | `notification-channel-configs` |
| `Shesha.Domain.NotificationMessage` | `notifications-audit` |
| `Shesha.Domain.NotificationTypeConfig` | `notification-type-configs` |
| `Shesha.Domain.OtpAuditItem` | `otp-audit` |
| `Shesha.Domain.ShaUserLoginAttempt` | `logon-audit` |
| `Shesha.Domain.Site` | `site-details`, `sites-table` |
| `Shesha.Enterprise.Domain.HomeUrlRoutes.HomeUrlRoute` | `home-url-routes` |
| `Shesha.Framework.ReferenceList` | `reference-lists` |
| `Shesha.Framework.ReferenceListItem` | `reference-list-details` |
| `Shesha.Scheduler.Domain.ScheduledJobTrigger` | `scheduled-job-details` |
| `Shesha.Scheduler.ScheduledJob` | `scheduled-job`, `scheduled-jobs` |
| `Shesha.Scheduler.ScheduledJobExecution` | `scheduled-job-details` |
| `{{modelType}}` (dynamic) | `table-view` |

### entityPicker Components

| Entity Type | Form(s) |
|-------------|---------|
| `Shesha.Core.Address` | `person-create`, `person-details`, `site-details`, `organisation-create`, `organisation-details`, `account-create` |
| `Shesha.Core.Organisation` | `site-details`, `account-create`, `organisation-create` |
| `Shesha.Core.Person` | `site-details`, `site-create`, `account-details`, `organisation-create`, `organisation-details` |
| `Shesha.Domain.Account` | `account-details` |
| `Shesha.Domain.NotificationChannelConfig` | `notification-type-override-channel-create`, `notification-settings` |
| `Shesha.Domain.NotificationTypeConfig` | `notification-template-details`, `notification-template-create` |
| `Shesha.Domain.Site` | `site-details`, `site-create`, `account-details` |
| `Core.PersonRelationship` | `assign-user-role` |

### autocomplete Components (with explicit URLs)

| URL | Form(s) |
|-----|---------|
| `/api/services/app/Metadata/EntityTypeAutocomplete` | `form-details`, `form-create` |
| `/api/Sms/Gateways` | `sms-settings`, `sms-settings-gateway`, `settings-sms` |

---

## Section F — Full Backend API Surface (Controllers + AppServices)

### Manual Controllers

| Controller | Route Base | Key Endpoints |
|-----------|-----------|---------------|
| `TokenAuthController` | `/api/TokenAuth/` | `Authenticate`, `RefreshToken`, `SignOff`, `OtpAuthenticateSendPin`, `OtpAuthenticate`, `GetExternalAuthenticationProviders`, `ExternalAuthenticate` |
| `StoredFileController` | `/api/StoredFile/` | `Download`, `Upload`, `UploadNewVersion`, `Delete`, `DownloadZip`, `FilesList`, `Base64String`, `EntityProperty`, `DownloadThumbnail`, `HasDownloaded`, `StoredFile/{fileId}/Versions` |
| `FrameworkController` | `/api/Framework/` | `BootstrapReferenceLists`, `BootstrapSettings`, `Assemblies`, `CurrentRamUsage`, `TestException`, `DynamicAssemblies`, `BootstrapEntityConfigs` |
| `AntiForgeryController` | `/api/AntiForgery/` | `GetToken` |
| `HomeController` | `/` | `Index` (redirects to swagger), `TestNotification` |

### Application Services (ABP auto-generated: `/api/services/app/{ServiceName}/{Method}`)

| Service | Key Endpoints | Referenced by Frontend? |
|---------|--------------|-------------|
| `Session` | `GetCurrentLoginInfo`, `GetGrantedShaRoles`, `ClearPermissionsCache` | Yes (coded) |
| `User` | `Get`, `InactivateUser`, `ActivateUser`, `ChangePassword`, `ResetPassword`, `ResetPasswordUsingToken`, `ResetPasswordSendOtp`, `ResetPasswordVerifyOtp`, `GetUserPasswordResetOptions`, `SendEmailLink`, `SendSMSOTP`, `ValidateResetCode`, `ValidateSecurityQuestions` | Yes (coded + JS) |
| `UserManagement` | `Create`, `Update` | Yes (JS + form) |
| `Permission` | `Get`, `GetAll`, `GetAllTree`, `Create`, `Update`, `UpdateParent`, `Delete`, `Autocomplete`, `IsPermissionGranted` | Yes (coded + form) |
| `PermissionedObject` | `GetAllFlat`, `GetAllTree`, `GetByObjectName`, `SetPermissions`, `Get`, `Update` | Yes (coded + form) |
| `ShaRole` | `Get`, `Create`, `Update`, `Delete` | Yes (form) |
| `ShaRoleAppointedPerson` | `Get`, `Create`, `Update`, `Delete` | Yes (form + JS) |
| `Metadata` | `Get`, `EntityTypeAutocomplete`, `TypeAutocomplete`, `PropertyAutocomplete`, `Specifications` | Yes (coded + form) |
| `EntityConfig` | `GetEntityConfigForm`, `GetMainDataList`, `GetClientApiConfigurations`, `SyncClientApi`, `Delete`, `EntityConfigAutocomplete` | Yes (coded) |
| `ConfigurationItem` | `ExportPackage`, `AnalyzePackage`, `ImportPackage`, `CreateNewVersion`, `UpdateStatus`, `CancelVersion`, `Delete`, `ClearClientSideCache`, `GetExportFlatTree`, `Copy`, `MoveToModule` | Yes (coded) |
| `ReferenceList` | `Get`, `GetByName`, `GetItems`, `ClearCacheFull` | Yes (coded + form) |
| `ReferenceListItem` | `Get`, `Create`, `Update`, `Delete` | Yes (form) |
| `Note` | `GetList`, `Create`, `Update`, `Delete` | Yes (coded) |
| `Notification` | `Get`, `GetAll`, `Delete`, `Publish` | Yes (form) |
| `NotificationMessage` | `MarkAsRead` | No |
| `Otp` | `SendPin`, `ResendPin`, `VerifyPin`, `GetSettings`, `UpdateSettings` | Yes (JS + form) |
| `Settings` | `GetValue`, `UpdateValue`, `GetUserValue`, `UpdateUserValue`, `GetConfigurations` | Yes (coded) |
| `AuthorizationSettings` | `GetSettings`, `UpdateSettings` | Yes (form) |
| `EmailSender` | `GetSmtpSettings`, `UpdateSmtpSettings`, `SendEmail` | No |
| `EntityHistory` | `GetAuditTrail` | Yes (form) |
| `Entities` | `Get`, `GetAll`, `ExportToExcel`, `Reorder` | Yes (coded) |
| `Api` | `Endpoints` | Yes (coded) |
| `ProcessMonitor` | `GetProcessState`, `GetStatus`, `DownloadLogFile` | Yes (coded) |
| `ModelConfigurations` | `Get`, `GetById`, `Create`, `Update`, `Merge` | Yes (coded) |

### Shesha-Namespaced Services (`/api/services/Shesha/{ServiceName}/{Method}`)

| Service | Key Endpoints | Referenced? |
|---------|--------------|-------------|
| `FormConfiguration` | `Get`, `GetByName`, `Create`, `UpdateMarkup`, `UpdateStatus`, `PublishAll`, `CreateNewVersion`, `CancelVersion`, `GetJson`, `ImportJson`, `Update`, `Delete`, `MoveToModule`, `Copy`, `Autocomplete`, `GetAll`, `GetAnonymousForms`, `CheckPermissions`, `GetFormsWithNotImplemented`, `ExportAll` | Yes (coded + form) |
| `ConfigurableComponent` | `GetByName`, `UpdateSettings` | Yes (coded) |

### Scheduler Services (`/api/services/Scheduler/{ServiceName}/{Method}`)

| Service | Key Endpoints | Referenced? |
|---------|--------------|-------------|
| `ScheduledJob` | `StartJob`, CRUD ops | Yes (form + JS) |
| `ScheduledJobExecution` | CRUD ops | Yes (form) |
| `ScheduledJobTrigger` | CRUD ops, `Delete` | Yes (form) |

### Enterprise Services (`/api/services/Enterprise/{ServiceName}/{Method}`)

| Service | Key Endpoints | Referenced? |
|---------|--------------|-------------|
| `HomeUrlRoute` | `Get`, `Create`, `Update`, `Delete` | Yes (form) |

### SMS Services

| Service | Route | Referenced? |
|---------|-------|-------------|
| `SmsGateways` | `/api/Sms/Gateways` (GET/POST/PUT/DELETE) | Yes (form autocomplete) |
| `Clickatell` | `/api/Clickatell/Settings` (GET/PUT) | No |

### Dynamic Entity CRUD (`/api/dynamic/{Module}/{Entity}/Crud/{Action}`)

Auto-generated for all registered entities. Explicitly referenced from forms:
- `Shesha/FrontEndApp`, `Shesha/NotificationTypeConfig`, `Shesha/NotificationTemplate`, `Shesha/SecurityQuestion`, `Shesha/ShaRoleAppointedPerson`

---

## Section G — Cross-Reference Matrix

Summary of **all unique endpoints actually referenced**, the source of the reference, and the pages/forms that reference them.

| # | Endpoint | Coded Frontend | Form Config | Embedded JS | Entity Binding |
|---|----------|---------------|-------------|-------------|----------------|
| 1 | `/api/TokenAuth/Authenticate` | Yes | -- | -- | -- |
| 2 | `/api/TokenAuth/RefreshToken` | Yes | -- | -- | -- |
| 3 | `/api/TokenAuth/SignOff` | Yes | -- | -- | -- |
| 4 | `/api/services/app/Session/GetCurrentLoginInfo` | Yes | -- | -- | -- |
| 5 | `/api/services/Shesha/FormConfiguration/Get` | Yes | form-details | -- | -- |
| 6 | `/api/services/Shesha/FormConfiguration/GetByName` | Yes | -- | -- | -- |
| 7 | `/api/services/Shesha/FormConfiguration/Create` | Yes | forms, form-create | -- | -- |
| 8 | `/api/services/Shesha/FormConfiguration/UpdateMarkup` | Yes | -- | -- | -- |
| 9 | `/api/services/Shesha/FormConfiguration/CheckPermissions` | Yes | -- | -- | -- |
| 10 | `/api/services/Shesha/FormConfiguration/GetJson` | Yes | -- | -- | -- |
| 11 | `/api/services/Shesha/FormConfiguration/ImportJson` | Yes | form-import-json | -- | -- |
| 12 | `/api/services/Shesha/FormConfiguration/Update` | -- | form-details | -- | -- |
| 13 | `/api/services/Shesha/FormConfiguration/Copy` | -- | form-copy | -- | -- |
| 14 | `/api/services/Shesha/FormConfiguration/MoveToModule` | -- | form-details | -- | -- |
| 15 | `/api/services/Shesha/FormConfiguration/PublishAll` | -- | forms | -- | -- |
| 16 | `/api/services/Shesha/ConfigurableComponent/GetByName` | Yes | -- | -- | -- |
| 17 | `/api/services/Shesha/ConfigurableComponent/UpdateSettings` | Yes | -- | -- | -- |
| 18 | `/api/services/app/Entities/Get` | Yes | -- | -- | -- |
| 19 | `/api/services/app/Entities/GetAll` | Yes | -- | -- | -- |
| 20 | `/api/services/app/Entities/ExportToExcel` | Yes | -- | -- | -- |
| 21 | `/api/services/app/Entities/Reorder` | Yes | -- | -- | -- |
| 22 | `/api/services/app/Metadata/Get` | Yes | -- | -- | -- |
| 23 | `/api/services/app/Metadata/EntityTypeAutocomplete` | Yes | form-details, form-create | -- | -- |
| 24 | `/api/services/app/Metadata/TypeAutocomplete` | Yes | -- | -- | -- |
| 25 | `/api/services/app/Metadata/Specifications` | Yes | -- | -- | -- |
| 26 | `/api/services/app/EntityConfig/*` (6 endpoints) | Yes | -- | -- | -- |
| 27 | `/api/ModelConfigurations/*` (5 endpoints) | Yes | -- | -- | -- |
| 28 | `/api/services/app/Permission/GetAllTree` | Yes | -- | -- | -- |
| 29 | `/api/services/app/Permission/Get` | -- | permission-configurator | -- | -- |
| 30 | `/api/services/app/Permission/UpdateParent` | Yes | -- | -- | -- |
| 31 | `/api/services/app/Permission/Delete` | Yes | -- | -- | -- |
| 32 | `/api/services/app/Permission/IsPermissionGranted` | Yes | -- | -- | -- |
| 33 | `/api/services/app/PermissionedObject/GetAllTree` | Yes | -- | -- | -- |
| 34 | `/api/services/app/PermissionedObject/Get` | -- | permissioned-objects | -- | -- |
| 35 | `/api/services/app/PermissionedObject/Update` | -- | permissioned-objects | -- | -- |
| 36 | `/api/services/app/ReferenceList/GetByName` | Yes | -- | -- | -- |
| 37 | `/api/services/app/ReferenceList/Get` | -- | reference-list-details | -- | -- |
| 38 | `/api/services/app/ReferenceListItem/Get` | -- | reference-list-item-details-view | -- | -- |
| 39 | `/api/services/app/ReferenceListItem/Delete` | -- | reference-list-details | -- | -- |
| 40 | `/api/services/app/Note/*` (4 endpoints) | Yes | -- | -- | -- |
| 41 | `/api/services/app/Settings/*` (5 endpoints) | Yes | -- | -- | -- |
| 42 | `/api/StoredFile/*` (11 endpoints) | Yes | -- | -- | -- |
| 43 | `/api/services/app/User/ResetPasswordSendOtp` | Yes | -- | -- | -- |
| 44 | `/api/services/app/User/ResetPasswordVerifyOtp` | Yes | -- | -- | -- |
| 45 | `/api/services/app/User/ResetPasswordUsingToken` | Yes | -- | Yes (reset-password) | -- |
| 46 | `/api/services/app/User/Get` | -- | user-details, update-password-reset-methods | Yes | -- |
| 47 | `/api/services/app/User/InactivateUser` | -- | -- | Yes (user-details, user-management-details) | -- |
| 48 | `/api/services/app/User/ActivateUser` | -- | -- | Yes (user-details, user-management-details) | -- |
| 49 | `/api/services/app/User/ChangePassword` | -- | -- | Yes (change-password) | -- |
| 50 | `/api/services/app/User/GetUserPasswordResetOptions` | -- | -- | Yes (forgot-password, select-reset-method) | -- |
| 51 | `/api/services/app/User/SendEmailLink` | -- | -- | Yes (select-reset-method) | -- |
| 52 | `/api/services/app/User/SendSMSOTP` | -- | -- | Yes (select-reset-method) | -- |
| 53 | `/api/services/app/User/ValidateResetCode` | -- | -- | Yes (otp-verification-page) | -- |
| 54 | `/api/services/app/User/ValidateSecurityQuestions` | -- | security-questions | -- | -- |
| 55 | `/api/services/app/User/ResetPassword` | -- | user-reset-password, user-management-reset-password | -- | -- |
| 56 | `/api/services/app/User/Update` | -- | update-password-reset-methods | -- | -- |
| 57 | `/api/services/app/UserManagement/Create` | -- | -- | Yes (registration, user-create, user-management-create) | -- |
| 58 | `/api/services/app/UserManagement/Update` | -- | user-management-details | -- | -- |
| 59 | `/api/services/app/ShaRole/*` | -- | role-details, roles | -- | Shesha.Core.ShaRole |
| 60 | `/api/services/app/ShaRoleAppointedPerson/*` | -- | assign-user-role, role-details | Yes (role-details) | -- |
| 61 | `/api/services/app/Otp/SendPin` | -- | -- | Yes (otp-verification) | -- |
| 62 | `/api/services/app/Otp/ResendPin` | -- | -- | Yes (otp-verification) | -- |
| 63 | `/api/services/app/Otp/VerifyPin` | -- | -- | Yes (otp-verification) | -- |
| 64 | `/api/services/app/Otp/GetSettings` | -- | otp-settings | -- | -- |
| 65 | `/api/services/app/Notification/*` | -- | notifications, notification-details, notifications-create | -- | Shesha.Domain.Notification |
| 66 | `/api/services/app/AuthorizationSettings/*` | -- | settings-security | -- | -- |
| 67 | `/api/services/app/EntityHistory/GetAuditTrail` | Yes | entity-change-audit-log | -- | -- |
| 68 | `/api/services/app/ConfigurationItem/*` (9 endpoints) | Yes | -- | -- | -- |
| 69 | `/api/services/app/Api/Endpoints` | Yes | -- | -- | -- |
| 70 | `/api/services/app/ProcessMonitor/*` | Yes | -- | -- | -- |
| 71 | `/api/Sms/Gateways` | -- | sms-settings, settings-sms | -- | -- |
| 72 | `/api/v2/Sms/Settings` | -- | settings-sms | -- | -- |
| 73 | `/api/services/Scheduler/ScheduledJob/StartJob` | -- | -- | Yes (scheduled-job-details) | -- |
| 74 | `/api/services/Scheduler/ScheduledJobExecution/*` | -- | scheduled-job-details | -- | Shesha.Scheduler.ScheduledJobExecution |
| 75 | `/api/services/Scheduler/ScheduledJobTrigger/*` | -- | scheduled-job-details | -- | Shesha.Scheduler.Domain.ScheduledJobTrigger |
| 76 | `/api/services/Enterprise/HomeUrlRoute/*` | -- | home-url-route-* | -- | Shesha.Enterprise.HomeUrlRoute |
| 77 | `/api/dynamic/Shesha/FrontEndApp/Crud/*` | -- | front-end-applications | Yes (user-details) | Shesha.Domain.FrontEndApp |
| 78 | `/api/dynamic/Shesha/NotificationTypeConfig/Crud/*` | -- | notification-type-config-* | -- | Shesha.Domain.NotificationTypeConfig |
| 79 | `/api/dynamic/Shesha/NotificationTemplate/Crud/*` | -- | notification-type-config-details | -- | Shesha.Core.NotificationTemplate |
| 80 | `/api/dynamic/Shesha/SecurityQuestion/Crud/*` | -- | security-questions | -- | Shesha.Core.SecurityQuestion |
| 81 | `/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/*` | -- | role-details, user-details | -- | Shesha.Core.ShaRoleAppointedPerson |
| 82 | `/api/dynamic/Shesha/Person/Crud/*` | -- | -- | -- | Shesha.Core.Person (8 forms) |
| 83 | `/api/dynamic/Shesha/Organisation/Crud/*` | -- | -- | -- | Shesha.Core.Organisation (4 forms) |
| 84 | `/api/dynamic/Shesha/Address/Crud/*` | -- | -- | -- | Shesha.Core.Address (6 forms via entityPicker) |
| 85 | `/api/dynamic/Shesha/Account/Crud/*` | -- | -- | -- | Shesha.Domain.Account (3 forms) |
| 86 | `/api/dynamic/Shesha/Site/Crud/*` | -- | -- | -- | Shesha.Domain.Site (3 forms) |
| 87 | `/api/dynamic/Shesha/Module/Crud/*` | -- | -- | -- | Shesha.Domain.ConfigurationItems.Module |
| 88 | `/api/dynamic/Shesha/NotificationChannelConfig/Crud/*` | -- | -- | -- | Shesha.Domain.NotificationChannelConfig |
| 89 | `/api/dynamic/Shesha/NotificationMessage/Crud/*` | -- | -- | -- | Shesha.Domain.NotificationMessage |
| 90 | `/api/dynamic/Shesha/OtpAuditItem/Crud/*` | -- | -- | -- | Shesha.Domain.OtpAuditItem |
| 91 | `/api/dynamic/Shesha/ShaUserLoginAttempt/Crud/*` | -- | -- | -- | Shesha.Domain.ShaUserLoginAttempt |
| 92 | `/api/dynamic/Shesha/EntityChangeAuditLog/Crud/*` | -- | -- | -- | Shesha.Domain.EntityChangeAuditLog |

### Notes on External URLs Found in Form Configs

| URL | Form | Context |
|-----|------|---------|
| `https://mpdoh-his-be-test.azurewebsites.net/api/services/app/AuthorizationSettings/UpdateSettings` | `settings-security` | Commented-out JS -- should be removed |
| `https://houghtonh-his-adminportal-test.azurewebsites.net/images/app-logo.png` | login forms | Hard-coded logo URL -- should use relative path |
| `https://starter-adminportal-test.shesha.dev/images/app-logo.png` | login forms | Hard-coded logo URL -- should use relative path |
| `https://uploads-ssl.webflow.com/.../Boxfusion_logo.png` | footer | External brand asset |

---

### Key Statistics

| Metric | Count |
|--------|-------|
| Total form configurations analyzed | 258 |
| Forms with entity bindings (modelType) | 101 |
| Unique entity types bound to forms | 28+ |
| Unique API endpoints from coded frontend | ~60 |
| Unique API endpoints from form configs | ~92 |
| JavaScript snippets with API calls in forms | 54 |
| Total unique endpoints referenced (all sources) | ~92 |
| Backend services available (not all referenced) | 120+ |
