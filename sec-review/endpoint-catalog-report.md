# Endpoint Catalog -- Shesha Functional Tests

**Generated:** 2026-03-17
**Branch:** releases/0.43
**Backend URL:** http://localhost:21021
**DefaultEndpointAccess:** 5 (AllowAnonymous)
**Total endpoints:** 935

---

## Security Configuration Summary

### DefaultEndpointAccess
- **Value:** 5 (AllowAnonymous)
- **Impact:** ALL unconfigured non-CRUD app service endpoints default to **anonymous access**. This is the most permissive setting. Any endpoint without an explicit PermissionedObject record (or with Inherited access and non-CRUD method name) is publicly accessible without authentication.

### PermissionedObject Coverage

| Object Type | Total | Inherited | Authenticated | Permissioned | Anonymous | Disabled |
|------------|-------|-----------|---------------|--------------|-----------|----------|
| Shesha.WebApi | 315 | 206 | 52 | 33 | 24 | 0 |
| Shesha.WebApi.Action | 270 | 172 | 46 | 29 | 23 | 0 |
| Shesha.Entity | 5 | 5 | 0 | 0 | 0 | 0 |
| Shesha.Entity.Action | 4 | 4 | 0 | 0 | 0 | 0 |
| Shesha.WebCrudApi | 0 | 0 | 0 | 0 | 0 | 0 |
| Shesha.WebCrudApi.Action | 0 | 0 | 0 | 0 | 0 | 0 |
| Shesha.Form | 13 | 0 | 0 | 0 | 13 | 0 |

### Specification Coverage

| Entity | Global Specs | Available Specs | Notes |
|--------|-------------|-----------------|-------|
| Person | 0 (1 commented out) | 2 (Age18Plus, HasNoAccount) | Test specs only |
| All others | 0 | 0 | No specifications defined |

---

## 1. Authentication Endpoints

| HTTP | URL | Auth Level | Enforcement | Recommendation | Frontend Ref |
|------|-----|------------|-------------|----------------|-------------|
| POST | /api/TokenAuth/Authenticate | Anonymous (code override) | [AllowAnonymous] class | OK | **coded (apis/tokenAuth.ts)** |
| POST | /api/TokenAuth/ExternalAuthenticate | Anonymous (code override) | [AllowAnonymous] class | OK | -- |
| POST | /api/TokenAuth/GetExternalAuthenticationProviders | Anonymous (code override) | [AllowAnonymous] class | OK | -- |
| POST | /api/TokenAuth/OtpAuthenticate | Anonymous (code override) | [AllowAnonymous] class | OK | -- |
| POST | /api/TokenAuth/OtpAuthenticateSendPin | Anonymous (code override) | [AllowAnonymous] class | OK | -- |
| POST | /api/TokenAuth/RefreshToken | Anonymous (code override) | [AllowAnonymous] class | OK | **coded (apis/tokenAuth.ts)** |
| POST | /api/TokenAuth/SignOff | Anonymous (code override) | [AllowAnonymous] class | OK | **coded (apis/tokenAuth.ts)** |
| POST | /api/services/app/User/ResetPasswordSendOtp | Anonymous (code override) | [AbpAllowAnonymous] | OK | **coded (apis/user.ts)** |
| POST | /api/services/app/User/GetUserPasswordResetOptions | Anonymous (code override) | [AbpAllowAnonymous] | OK | **JS (forgot-password, select-reset-method)** |
| POST | /api/services/app/User/SendSmsOtp | Anonymous (code override) | [AbpAllowAnonymous] | OK | **JS (select-reset-method)** |
| POST | /api/services/app/User/GetSecurityQuestions | Anonymous (code override) | [AbpAllowAnonymous] | OK | **form-config+JS** |
| POST | /api/services/app/User/ValidateResetCode | Anonymous (code override) | [AbpAllowAnonymous] | OK | **JS (otp-verification-page, email-link-verification)** |
| POST | /api/services/app/User/ValidateSecurityQuestions | Anonymous (code override) | [AbpAllowAnonymous] | OK | **form-config (security-questions)** |
| POST | /api/services/app/User/SendEmailLink | Anonymous (code override) | [AbpAllowAnonymous] | OK | **JS (select-reset-method)** |
| POST | /api/services/app/User/ResetPasswordVerifyOtp | Anonymous (code override) | [AbpAllowAnonymous] | OK | **coded (apis/user.ts)** |
| POST | /api/services/app/User/ResetPasswordUsingToken | Anonymous (code override) | [AbpAllowAnonymous] | OK | **coded+JS (apis/user.ts, reset-password)** |
| POST | /api/services/app/User/ChangePassword | Anonymous (code override) | [AbpAllowAnonymous] | OK | **JS (change-password)** |
| GET | /api/services/app/Session/ClearPermissionsCache | Anonymous (default fallback) | Inherited + DEA=5 | OK | -- |
| GET | /api/services/app/Session/GetCurrentLoginInfo | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded (apis/session.ts)** |
| GET | /api/services/app/Session/GetCurrentLoginInformations | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded** |
| GET | /api/services/app/Session/GetGrantedShaRoles | Anonymous (default fallback) | Inherited + DEA=5 | OK | -- |

---

## 2. Framework & Admin Endpoints

| HTTP | URL | Auth Level | DB Record | Enforcement | Recommendation | Frontend Ref |
|------|-----|------------|-----------|-------------|----------------|-------------|
| -- | /api/dynamic/Shesha/StoredFile/Crud/Create | Authenticated (CRUD method bypass) | No | No DB record + CRUD name | MEDIUM | **entity-binding** |
| -- | /api/dynamic/Shesha/StoredFile/Crud/Delete | Authenticated (DB, configurable) | Yes | DB config | OK | **entity-binding** |
| -- | /api/dynamic/Shesha/StoredFile/Crud/Get | Authenticated (DB, configurable) | Yes | DB config | OK | **entity-binding** |
| -- | /api/dynamic/Shesha/StoredFile/Crud/GetAll | Authenticated (CRUD method bypass) | No | No DB record + CRUD name | MEDIUM | **entity-binding** |
| -- | /api/dynamic/Shesha/StoredFile/Crud/Update | Authenticated (CRUD method bypass) | No | No DB record + CRUD name | MEDIUM | **entity-binding** |
| -- | /api/Framework/Assemblies | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/BootstrapEntityConfigs | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/BootstrapReferenceLists | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/BootstrapSettings | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/CurrentRamUsage | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/DynamicAssemblies | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **CRITICAL**: Admin endpoint anonymous | -- |
| -- | /api/Framework/TestException | Anonymous (default fallback) | Yes | Inherited + DEA=5 | **HIGH**: Anonymous | -- |
| -- | /api/StoredFile/Base64String | Anonymous (default fallback) | No | No DB record + DEA=5 | **HIGH**: Anonymous | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/Delete | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/Download | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/DownloadThumbnail | Authenticated (DB, configurable) | Yes | DB config | OK | **coded** |
| -- | /api/StoredFile/DownloadZip | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/EntityProperty | Anonymous (default fallback) | No | No DB record + DEA=5 | **HIGH**: Anonymous | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/FilesList | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/HasDownloaded | Authenticated (DB, configurable) | Yes | DB config | OK | **coded** |
| -- | /api/StoredFile/StoredFile/{fileId}/Versions | Anonymous (default fallback) | No | No DB record + DEA=5 | **HIGH**: Anonymous | **coded** |
| -- | /api/StoredFile/Upload | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/UploadNewVersion | Authenticated (DB, configurable) | Yes | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/UploadStatic | Authenticated (DB, configurable) | Yes | DB config | OK | **coded** |

---

## 3. Security & Permission Management

| HTTP | URL | Auth Level | Required Permissions | Enforcement | Recommendation | Frontend Ref |
|------|-----|------------|---------------------|-------------|----------------|-------------|
| -- | /api/services/app/Permission/Autocomplete | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | /api/services/app/Permission/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/Permission/Delete | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | /api/services/app/Permission/Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permission-configurator)** |
| -- | /api/services/app/Permission/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/Permission/GetAllTree | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | /api/services/app/Permission/IsPermissionGranted | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | /api/services/app/Permission/Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/Permission/Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/Permission/Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/Permission/Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/Permission/UpdateParent | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | /api/dynamic/Shesha/PermissionedObject/Crud/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/PermissionedObject/Crud/Delete | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/PermissionedObject/Crud/Get | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/PermissionedObject/Crud/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/PermissionedObject/Crud/Update | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/PermissionedObject/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/PermissionedObject/Delete | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/PermissionedObject/Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permissioned-objects)** |
| -- | /api/services/app/PermissionedObject/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | /api/services/app/PermissionedObject/GetAllFlat | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | /api/services/app/PermissionedObject/GetAllTree | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permissionedObject.ts)** |
| -- | /api/services/app/PermissionedObject/GetApiPermissions | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | /api/services/app/PermissionedObject/GetByObjectName | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | /api/services/app/PermissionedObject/SetApiPermissions | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/PermissionedObject/SetPermissions | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/PermissionedObject/Update | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permissioned-objects)** |
| -- | /api/dynamic/Shesha/ShaRole/Crud/Create | Authenticated (DB, configurable) | -- | DB config | OK | **entity-binding (roles, role-assign-user, role-create)** |
| -- | /api/dynamic/Shesha/ShaRole/Crud/Delete | Authenticated (DB, configurable) | -- | DB config | OK | **entity-binding (roles, role-assign-user, role-create)** |
| -- | /api/dynamic/Shesha/ShaRole/Crud/Get | Authenticated (DB, configurable) | -- | DB config | OK | **entity-binding (roles, role-assign-user, role-create)** |
| -- | /api/dynamic/Shesha/ShaRole/Crud/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **entity-binding (roles, role-assign-user, role-create)** |
| -- | /api/dynamic/Shesha/ShaRole/Crud/Update | Authenticated (DB, configurable) | -- | DB config | OK | **entity-binding (roles, role-assign-user, role-create)** |
| -- | /api/services/app/ShaRole/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/ShaRole/Delete | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (roles, role-details)** |
| -- | /api/services/app/ShaRole/Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (role-details)** |
| -- | /api/services/app/ShaRole/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | /api/services/app/ShaRole/IsRoleGranted | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/ShaRole/Update | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (role-details)** |
| -- | /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | **entity-binding (role-details, user-details, user-management-details)** |
| -- | /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | **form-config+entity-binding (user-details, user-management-details, role-details)** |
| -- | /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Get | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | **entity-binding (role-details, user-details, user-management-details)** |
| -- | /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | **entity-binding (role-details, user-details, user-management-details)** |
| -- | /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Update | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | **entity-binding (role-details, user-details, user-management-details)** |
| -- | /api/dynamic/Shesha/Role/Crud/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/Role/Crud/Delete | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Role/Crud/Get | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Role/Crud/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/Role/Crud/Update | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/Role/Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/Role/Delete | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Role/Get | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Role/GetAll | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/services/app/Role/GetAllPermissions | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Role/GetRoleForEdit | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Role/GetRoles | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Role/Update | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | /api/dynamic/Shesha/Tenant/Crud/Create | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Tenant/Crud/Delete | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Tenant/Crud/Get | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Tenant/Crud/GetAll | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/dynamic/Shesha/Tenant/Crud/Update | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Tenant/Create | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Tenant/Delete | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Tenant/Get | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Tenant/GetAll | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | /api/services/app/Tenant/Update | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |

---

## 4. Configuration Management

| HTTP | URL | Auth Level | Enforcement | Recommendation | Frontend Ref |
|------|-----|------------|-------------|----------------|-------------|
| -- | /api/dynamic/Shesha/EntityConfig/Crud/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/EntityConfig/Crud/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/EntityConfig/Crud/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/EntityConfig/Crud/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/EntityConfig/Crud/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/app/EntityConfig/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/app/EntityConfig/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded (apis/entityConfig.ts)** |
| -- | /api/services/app/EntityConfig/EntityConfigAutocomplete | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/app/EntityConfig/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/app/EntityConfig/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/app/EntityConfig/GetClientApiConfigurations | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/entityConfig.ts)** |
| -- | /api/services/app/EntityConfig/GetEntityConfigForm | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/entityConfig.ts)** |
| -- | /api/services/app/EntityConfig/GetMainDataList | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/entityConfig.ts)** |
| -- | /api/services/app/EntityConfig/RemoveConfigurationsOfMissingClasses | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/services/app/EntityConfig/SyncClientApi | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/entityConfig.ts)** |
| -- | /api/services/app/EntityConfig/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/FormConfiguration/Crud/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **entity-binding (forms, form-templates, form-details)** |
| -- | /api/dynamic/Shesha/FormConfiguration/Crud/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **entity-binding (forms, form-templates, form-details)** |
| -- | /api/dynamic/Shesha/FormConfiguration/Crud/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **entity-binding (forms, form-templates, form-details)** |
| -- | /api/dynamic/Shesha/FormConfiguration/Crud/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **entity-binding (forms, form-templates, form-details)** |
| -- | /api/dynamic/Shesha/FormConfiguration/Crud/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **entity-binding (forms, form-templates, form-details)** |
| -- | /api/services/Shesha/FormConfiguration/Autocomplete | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/services/Shesha/FormConfiguration/CancelVersion | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/services/Shesha/FormConfiguration/CheckPermissions | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/Copy | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **form-config (form-copy)** |
| -- | /api/services/Shesha/FormConfiguration/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/CreateNewVersion | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/Shesha/FormConfiguration/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/Shesha/FormConfiguration/ExportAll | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/services/Shesha/FormConfiguration/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/Shesha/FormConfiguration/GetAnonymousForms | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/Shesha/FormConfiguration/GetByName | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/GetFormsWithNotImplemented | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/Shesha/FormConfiguration/GetJson | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/ImportJson | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/MoveToModule | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **form-config (form-details)** |
| -- | /api/services/Shesha/FormConfiguration/PublishAll | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **form-config (forms)** |
| -- | /api/services/Shesha/FormConfiguration/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **form-config (form-details)** |
| -- | /api/services/Shesha/FormConfiguration/UpdateMarkup | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/formConfiguration.ts)** |
| -- | /api/services/Shesha/FormConfiguration/UpdateStatus | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **form-config** |
| -- | /api/dynamic/Shesha/ConfigurableComponent/Crud/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurableComponent/Crud/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurableComponent/Crud/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurableComponent/Crud/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurableComponent/Crud/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/Shesha/ConfigurableComponent/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/Shesha/ConfigurableComponent/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/Shesha/ConfigurableComponent/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/Shesha/ConfigurableComponent/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/Shesha/ConfigurableComponent/GetByName | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/configurableComponent.ts)** |
| -- | /api/services/Shesha/ConfigurableComponent/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/Shesha/ConfigurableComponent/UpdateSettings | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/configurableComponent.ts)** |
| -- | /api/Clickatell/Settings | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/Clickatell/Settings | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | -- |
| -- | /api/services/app/Settings/GetConfigurations | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded (apis/settings.ts)** |
| -- | /api/services/app/Settings/GetUserValue | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/settings.ts)** |
| -- | /api/services/app/Settings/GetValue | Anonymous (code override) | Code: [AllowAnonymous] | OK | **coded (apis/settings.ts)** |
| -- | /api/services/app/Settings/GetValues | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/app/Settings/UpdateUserValue | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/settings.ts)** |
| -- | /api/services/app/Settings/UpdateValue | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/settings.ts)** |
| -- | /api/dynamic/Shesha/ConfigurationItem/Crud/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItem/Crud/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItem/Crud/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItem/Crud/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItem/Crud/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItemBase/Crud/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItemBase/Crud/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItemBase/Crud/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItemBase/Crud/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/dynamic/Shesha/ConfigurationItemBase/Crud/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/app/ConfigurationItem/AnalyzePackage | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (components/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/CancelVersion | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (utils/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/ClearClientSideCache | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (utils/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/Copy | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/app/ConfigurationItem/Create | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/app/ConfigurationItem/CreateNewVersion | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (utils/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/Delete | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded (utils/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/ExportPackage | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (components/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/Get | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/app/ConfigurationItem/GetAll | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | -- |
| -- | /api/services/app/ConfigurationItem/GetExportFlatTree | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (components/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/ImportPackage | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (components/configurationFramework/)** |
| -- | /api/services/app/ConfigurationItem/MoveToModule | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded** |
| -- | /api/services/app/ConfigurationItem/Update | Authenticated (CRUD bypass) | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | /api/services/app/ConfigurationItem/UpdateStatus | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (utils/configurationFramework/)** |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations/{id} | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations/merge | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH**: Config mgmt anonymous | **coded (apis/modelConfigurations.ts)** |

---

## 5. Dynamic Entity CRUD Endpoints

Auto-generated CRUD endpoints for 119 entities.

> **Note:** Entity CRUD with Inherited access = Authenticated (any logged-in user). NOT affected by DefaultEndpointAccess=5.

### 5.1 Module: app (36 entities)

| Entity | Get | GetAll | Create | Update | Delete | Auth Level | Frontend Ref |
|--------|-----|--------|--------|--------|--------|------------|-------------|
| AggregateRoot | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ApplicationLanguage | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ApplicationLanguageText | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| AuditLog | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| BackgroundJobInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DynamicEntityProperty | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DynamicEntityPropertyValue | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DynamicProperty | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DynamicPropertyValue | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Edition | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EditionFeatureSetting | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityChange | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityChangeSet | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityPropertyChange | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| NotificationInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| NotificationSubscriptionInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| OrganizationUnit | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| OrganizationUnitRole | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ReferencedError | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| RoleClaim | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| RolePermissionSetting | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Setting | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| TenantFeatureSetting | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| TenantNotificationInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserAccount | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserClaim | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserLogin | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserLoginAttempt | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserNotificationInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserOrganizationUnit | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserPermissionSetting | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserRole | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserToken | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| WebhookEvent | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| WebhookSendAttempt | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| WebhookSubscriptionInfo | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |

### 5.2 Module: Boxfusion.SheshaFunctionalTests.Common (12 entities)

| Entity | Get | GetAll | Create | Update | Delete | Auth Level | Frontend Ref |
|--------|-----|--------|--------|--------|--------|------------|-------------|
| Bank | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Book | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Bus | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Driver | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Employee | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EmployeeAccount | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Member | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| MembershipPayment | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| School | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Subject | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| TestAccount | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| TestClass | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |

### 5.3 Module: Shesha (71 entities)

| Entity | Get | GetAll | Create | Update | Delete | Auth Level | Frontend Ref |
|--------|-----|--------|--------|--------|--------|------------|-------------|
| Account | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| Address | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| ApplicationStartup | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ApplicationStartupAssembly | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Area | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| AreaHierarchyItem | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| AreaTreeItem | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ConfigurableComponent | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ConfigurationItem | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ConfigurationItemBase | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ConfigurationPackageImportResult | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DeviceForceUpdate | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| DeviceRegistration | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityChangeAuditLog | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (entity-change-audit-log)** |
| EntityConfig | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityHistoryEvent | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityHistoryItem | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityProperty | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityPropertyValue | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| EntityVisibility | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Facility | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| FormConfiguration | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| FrontEndApp | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| ImportResult | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| MobileDevice | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Module | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (modules)** |
| Note | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Notification | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| NotificationChannelConfig | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (notification-channel-configs, notification-settings)** |
| NotificationMessage | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (notifications-audit)** |
| NotificationMessageAttachment | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| NotificationTemplate | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (notification-template-create, notification-type-config-details)** |
| NotificationTopic | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| NotificationTypeConfig | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| Organisation | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (4 forms)** |
| OrganisationAddress | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| OrganisationBase | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| OrganisationPerson | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| OtpAuditItem | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (otp-audit)** |
| PermissionDefinition | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| PermissionedObject | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| PermissionedObjectFull | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Person | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (8 forms)** |
| PersonRelationship | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| QuestionAssignment | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ReferenceList | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| ReferenceListItem | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| Role | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ScheduledJob | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (scheduled-job, scheduled-jobs)** |
| ScheduledJobExecution | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (scheduled-job-execution, scheduled-job-details)** |
| ScheduledJobTrigger | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| SecurityQuestion | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (4 forms)** |
| SettingConfiguration | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| SettingValue | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ShaRole | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| ShaRoleAppointedPerson | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| ShaRoleAppointment | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ShaRoleAppointmentEntity | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ShaRolePermission | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| ShaUserLoginAttempt | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (logon-audit)** |
| ShaUserRegistration | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Site | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding (3 forms)** |
| StoredFile | Y | Y | Y | Y | Y | Authenticated (accidental) | **entity-binding** |
| StoredFileVersion | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| StoredFileVersionDownload | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| Tenant | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| User | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserNotificationPreference | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| UserTopicSubscription | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| VersionedField | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |
| VersionedFieldVersion | Y | Y | Y | Y | Y | Authenticated (accidental) | -- |

---

## 6. Application Services

### 6.1 Api (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Endpoints | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/api.ts)** |

### 6.2 Area (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Autocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | CascadeSelect | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetChildTreeItems | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | GetTreeItem | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | MoveArea | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.3 AuthorizationSettings (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config (settings-security)** |
| -- | UpdateSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config (settings-security)** |

### 6.4 ConfigurationItem (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | AnalyzePackage | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (components/configurationFramework/)** |
| -- | CancelVersion | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (utils/configurationFramework/)** |
| -- | ClearClientSideCache | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (utils/configurationFramework/)** |
| -- | Copy | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | CreateNewVersion | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (utils/configurationFramework/)** |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (utils/configurationFramework/)** |
| -- | ExportPackage | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (components/configurationFramework/)** |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetExportFlatTree | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (components/configurationFramework/)** |
| -- | ImportPackage | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (components/configurationFramework/)** |
| -- | MoveToModule | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | UpdateStatus | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (utils/configurationFramework/)** |

### 6.5 DeviceForceUpdate (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetForceUpdateByOSType | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.6 DeviceRegistration (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | -- |

### 6.7 EmailSender (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetSmtpSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | SendEmail | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | UpdateSmtpSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |

### 6.8 Entities (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | ExportToExcel | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/entities.ts)** |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/entities.ts)** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/entities.ts)** |
| -- | Reorder | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (components/kanban/)** |
| -- | Specifications | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.9 EntityConfig (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/entityConfig.ts)** |
| -- | EntityConfigAutocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetClientApiConfigurations | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/entityConfig.ts)** |
| -- | GetEntityConfigForm | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/entityConfig.ts)** |
| -- | GetMainDataList | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/entityConfig.ts)** |
| -- | RemoveConfigurationsOfMissingClasses | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | SyncClientApi | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/entityConfig.ts)** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.10 EntityHistory (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetAuditTrail | Authenticated (DB, configurable) | -- | DB config | OK | **coded+form-config (designer-components/, entity-change-audit-log)** |

### 6.11 EntityProperty (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.12 Metadata (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | EntityTypeAutocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded+form-autocomplete (apis/metadata.ts, form-details, form-create)** |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/metadata.ts)** |
| -- | GetProperties | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | PropertyAutocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | Specifications | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/metadata.ts)** |
| -- | TypeAutocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/metadata.ts)** |

### 6.13 MobileDevice (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetDeviceByEmei | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.14 Module (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.15 Note (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/note.ts)** |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/note.ts)** |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetList | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/note.ts)** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/note.ts)** |

### 6.16 Notification (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Publish | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |

### 6.17 NotificationMessage (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | MarkAsRead | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.18 Otp (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config (otp-settings)** |
| -- | ResendPin | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **JS (otp-verification)** |
| -- | SendPin | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **JS (otp-verification)** |
| -- | UpdateSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | VerifyPin | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **JS (otp-verification)** |

### 6.19 OtpAuditItem (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.20 Permission (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Autocomplete | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Delete | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permission-configurator)** |
| -- | GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | GetAllTree | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | IsPermissionGranted | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | UpdateParent | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permission.ts)** |

### 6.21 PermissionedObject (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Delete | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permissioned-objects)** |
| -- | GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **coded** |
| -- | GetAllFlat | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | GetAllTree | Authenticated (DB, configurable) | -- | DB config | OK | **coded (apis/permissionedObject.ts)** |
| -- | GetApiPermissions | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | GetByObjectName | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | SetApiPermissions | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | SetPermissions | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (permissioned-objects)** |

### 6.22 ProcessMonitor (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | DownloadLogFile | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | GetProcessState | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | GetStatus | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.23 QuestionAnswers (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.24 ReferenceList (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | ClearCache | Anonymous (default fallback) | -- | No DB record + DEA=5 | **CRITICAL** | -- |
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **form-config (reference-list-details)** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **form-config** |
| -- | GetByName | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/referenceList.ts)** |
| -- | GetItems | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **form-config** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |

### 6.25 ReferenceListItem (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (reference-list-details)** |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (reference-list-item-details-view)** |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config** |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.26 Role (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Delete | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | Get | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | GetAll | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | GetAllPermissions | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | GetRoleForEdit | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | GetRoles | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | -- |

### 6.27 Settings (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetConfigurations | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/settings.ts)** |
| -- | GetUserValue | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/settings.ts)** |
| -- | GetValue | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/settings.ts)** |
| -- | GetValues | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | UpdateUserValue | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (apis/settings.ts)** |
| -- | UpdateValue | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (apis/settings.ts)** |

### 6.28 ShaRole (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Delete | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (roles, role-details)** |
| -- | Get | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (role-details)** |
| -- | GetAll | Authenticated (DB, configurable) | -- | DB config | OK | **form-config** |
| -- | IsRoleGranted | Authenticated (DB, configurable) | -- | DB config | OK | -- |
| -- | Update | Authenticated (DB, configurable) | -- | DB config | OK | **form-config (role-details)** |

### 6.29 ShaRoleAppointedPersonActions (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | Delete | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | Get | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | GetAll | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |
| -- | Update | Permissioned (DB) | Pages.Roles | DB + ShaPermissionChecker | OK | -- |

### 6.30 ShaUserLoginAttempts (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.31 Tenant (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | Delete | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | Get | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | GetAll | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |
| -- | Update | Permissioned (DB) | Pages.Tenants | DB + ShaPermissionChecker | OK | -- |

### 6.32 User (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | ActivateUser | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **JS (user-details, user-management-details)** |
| -- | ChangeLanguage | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | -- |
| -- | ChangePassword | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **JS (change-password)** |
| -- | Create | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | -- |
| -- | Delete | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | -- |
| -- | Get | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config+JS (user-details, update-password-reset-methods, user-management-details)** |
| -- | GetAll | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config+JS** |
| -- | GetRoles | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config+JS** |
| -- | GetSecurityQuestions | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **form-config+JS** |
| -- | GetUserAuthConfig | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config+JS** |
| -- | GetUserPasswordResetOptions | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **JS (forgot-password, select-reset-method)** |
| -- | InactivateUser | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **JS (user-details, user-management-details)** |
| -- | ResetPassword | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config (user-reset-password, user-management-reset-password)** |
| -- | ResetPasswordSendOtp | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/user.ts)** |
| -- | ResetPasswordUsingToken | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded+JS (apis/user.ts, reset-password)** |
| -- | ResetPasswordVerifyOtp | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/user.ts)** |
| -- | SendEmailLink | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **JS (select-reset-method)** |
| -- | SendSmsOtp | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **JS (select-reset-method)** |
| -- | Update | Permissioned (DB) | Pages.Users | DB + ShaPermissionChecker | OK | **form-config (update-password-reset-methods)** |
| -- | ValidateResetCode | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **JS (otp-verification-page, email-link-verification)** |
| -- | ValidateSecurityQuestions | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **form-config (security-questions)** |

### 6.33 UserManagement (app)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | CompleteRegistration | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **form-config+JS (registration, user-create, user-management-create)** |

### 6.34 ScheduledJob (Scheduler)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | BootstrapScheduledJobs | Anonymous (default fallback) | -- | No DB record + DEA=5 | **CRITICAL** | -- |
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | EnqueueAll | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | RunTrigger | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | StartJob | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | **JS (scheduled-job-details)** |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.35 ScheduledJobExecution (Scheduler)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | DownloadLogFile | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config** |
| -- | GetEventLogItems | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | **form-config** |
| -- | GetExecutionStatistics | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | **form-config** |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |

### 6.36 ScheduledJobTrigger (Scheduler)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config** |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | **form-config (scheduled-job-details)** |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.37 ConfigurableComponent (Shesha)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | GetByName | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/configurableComponent.ts)** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | UpdateSettings | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (apis/configurableComponent.ts)** |

### 6.38 FormConfiguration (Shesha)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Autocomplete | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | CancelVersion | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | CheckPermissions | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/formConfiguration.ts)** |
| -- | Copy | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **form-config (form-copy)** |
| -- | Create | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/formConfiguration.ts)** |
| -- | CreateNewVersion | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded** |
| -- | Delete | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | -- |
| -- | ExportAll | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | Get | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded (apis/formConfiguration.ts)** |
| -- | GetAll | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **coded** |
| -- | GetAnonymousForms | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | GetByName | Anonymous (code override) | -- | Code: [AllowAnonymous] | OK | **coded (apis/formConfiguration.ts)** |
| -- | GetFormsWithNotImplemented | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded** |
| -- | GetJson | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | **coded (apis/formConfiguration.ts)** |
| -- | ImportJson | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (apis/formConfiguration.ts)** |
| -- | MoveToModule | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config (form-details)** |
| -- | PublishAll | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config (forms)** |
| -- | Update | Authenticated (CRUD bypass) | -- | CRUD name -> auth-only | MEDIUM | **form-config (form-details)** |
| -- | UpdateMarkup | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **coded (apis/formConfiguration.ts)** |
| -- | UpdateStatus | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | **form-config** |

### 6.39 NHibernate (Shesha)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | ExecuteHql | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | GetConventions | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | TestEntities | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | TestEntity | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.40 Clickatell (SheshaClickatell)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | TestSms | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.41 ActivateMembership (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | CreateMemberPayment | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | GetAllMembershipPayments | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | GetMemberPayments | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.42 BankMember (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | CreateBankWithMembers | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | GetAllBankWithMembers | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | GetBankWithMembers | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.43 Book (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | CreateBook | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |

### 6.44 DynamicColumnsTest (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | GetPersonDetails | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | GetPersonList | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.45 NotificationTest (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | BulkPublish | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | TestNotification | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.46 OrganisationTest (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetDefaultFiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | GetFiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | GetUnfiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Test | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.47 PersonTest (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | Create | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Delete | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | Get | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetAll | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |
| -- | GetDefaultFiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | GetFiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | GetUnfiltered | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Test | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | TestDto | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | TestPerson | Anonymous (default fallback) | -- | No DB record + DEA=5 | **HIGH** | -- |
| -- | Update | Authenticated (CRUD method bypass) | -- | No DB record + CRUD name | MEDIUM | -- |

### 6.48 Playground (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | TestAudit | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | TestFileVersionUrl | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | TestJsonWithGenericEntityReference | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | TestLinkState | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |

### 6.49 Schools (SheshaFunctionalTestsCommon)

| HTTP | Action | Auth Level | Permissions | Enforcement | Recommendation | Frontend Ref |
|------|--------|------------|-------------|-------------|----------------|-------------|
| -- | CreateSchoolCustom | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | CreateSubjectCustom | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | GetSchool | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | GetSchoolSubjects | Anonymous (default fallback) | -- | Inherited + DEA=5 | **HIGH** | -- |
| -- | UpdateSchoolCustom | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |
| -- | UpdateSubjectCustom | Anonymous (default fallback) | -- | Inherited + DEA=5 | **CRITICAL** | -- |

---

## 7. Controllers (non-service)

| HTTP | URL | Auth Level | Enforcement | Recommendation | Frontend Ref |
|------|-----|------------|-------------|----------------|-------------|
| -- | /api/Clickatell/Settings | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | -- |
| -- | /api/Clickatell/Settings | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/Assemblies | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/BootstrapEntityConfigs | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/BootstrapReferenceLists | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/BootstrapSettings | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/CurrentRamUsage | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/DynamicAssemblies | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/Framework/TestException | Anonymous (default fallback) | Inherited + DEA=5 | **HIGH** | -- |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations/{id} | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/modelConfigurations.ts)** |
| -- | /api/ModelConfigurations/merge | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/modelConfigurations.ts)** |
| -- | /api/Sms/Gateways | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **form-config+form-autocomplete (settings-sms, sms-settings)** |
| -- | /api/StoredFile | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/Base64String | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/Delete | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/Download | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/DownloadThumbnail | Authenticated (DB, configurable) | DB config | OK | **coded** |
| -- | /api/StoredFile/DownloadZip | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/EntityProperty | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/FilesList | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/HasDownloaded | Authenticated (DB, configurable) | DB config | OK | **coded** |
| -- | /api/StoredFile/StoredFile/{fileId}/Versions | Anonymous (default fallback) | No DB record + DEA=5 | **HIGH** | **coded** |
| -- | /api/StoredFile/Upload | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/UploadNewVersion | Authenticated (DB, configurable) | DB config | OK | **coded (apis/storedFile.ts)** |
| -- | /api/StoredFile/UploadStatic | Authenticated (DB, configurable) | DB config | OK | **coded** |

---

## Enforcement Caveats

1. **Code-level `[AllowAnonymous]` overrides DB config** -- If a method has `[AllowAnonymous]`, the PermissionedObject database settings are IGNORED. The `SheshaAuthorizationFilter` exits before checking the DB.

2. **Entity CRUD endpoints don't use DefaultEndpointAccess** -- `EntityCrudAuthorizationHelper` passes `replaceInherited=NULL`. Entity CRUD with Inherited access blocks anonymous but allows any authenticated user.

3. **Multiple permissions use OR logic** -- `requireAll` is hardcoded to `false`. Any one listed permission grants access.

4. **Unmapped CRUD methods bypass entity permissions** -- Methods not in CrudMethods dict (ExportToExcel, Reorder) are checked at service level, not entity level.

5. **CRUD-named methods on ALL app services bypass DefaultEndpointAccess** -- GetAll, Get, Create, Update, Delete are skipped by ApiAuthorizationHelper even on non-CRUD services.

6. **DefaultEndpointAccess=5 is ACTIVE** -- 111 non-CRUD inherited endpoints are effectively anonymous.

7. **Swagger not fetched** -- Swagger JSON was not verified for this catalog.

---

## Appendix A: Anonymous Endpoints via DefaultEndpointAccess=5

111 endpoints have Inherited access with non-CRUD method names, making them anonymous.

| PermissionedObject Name | Risk |
|------------------------|------|
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.ActivateMembershipAppService@ActivateMembership | HIGH |
| Shesha.ConfigurationItems.ConfigurationItemAppService@AnalyzePackage | HIGH |
| Shesha.Controllers.FrameworkController@Assemblies | HIGH |
| Shesha.Areas.AreaAppService@Autocomplete | HIGH |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@Autocomplete | HIGH |
| Shesha.Controllers.FrameworkController@BootstrapEntityConfigs | **CRITICAL** |
| Shesha.Controllers.FrameworkController@BootstrapReferenceLists | **CRITICAL** |
| Shesha.Controllers.FrameworkController@BootstrapSettings | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.NotificationTestAppService@BulkPublish | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@CancelVersion | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@CancelVersion | **CRITICAL** |
| Shesha.Areas.AreaAppService@CascadeSelect | HIGH |
| Shesha.ReferenceLists.ReferenceListAppService@ClearCacheFull | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@ClearClientSideCache | **CRITICAL** |
| Shesha.Sessions.SessionAppService@ClearPermissionsCache | **CRITICAL** |
| Shesha.UserManagements.UserManagementAppService@CompleteRegistration | HIGH |
| Shesha.ConfigurationItems.ConfigurationItemAppService@Copy | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@Copy | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.BankMemberAppService@CreateBankWithMembers | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.BookAppService@CreateBook | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.ActivateMembershipAppService@CreateMemberPayment | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@CreateNewVersion | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@CreateNewVersion | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@CreateSchoolCustom | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@CreateSubjectCustom | **CRITICAL** |
| Shesha.Controllers.FrameworkController@CurrentRamUsage | HIGH |
| Shesha.BackgroundProcesses.ProcessMonitorAppService@DownloadLogFile | HIGH |
| Shesha.Controllers.FrameworkController@DynamicAssemblies | HIGH |
| Shesha.Api.ApiAppService@Endpoints | HIGH |
| Shesha.DynamicEntities.EntityConfigAppService@EntityConfigAutocomplete | HIGH |
| Shesha.Metadata.MetadataAppService@EntityTypeAutocomplete | HIGH |
| Shesha.Services.NHibernateAppService@ExecuteHql | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@ExportAll | HIGH |
| Shesha.ConfigurationItems.ConfigurationItemAppService@ExportPackage | HIGH |
| Shesha.DynamicEntities.EntitiesAppService@ExportToExcel | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.BankMemberAppService@GetAllBankWithMembers | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.ActivateMembershipAppService@GetAllMembershipPayments | HIGH |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@GetAnonymousForms | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.BankMemberAppService@GetBankWithMembers | HIGH |
| Shesha.DynamicEntities.ModelConfigurationsAppService@GetById | HIGH |
| Shesha.ReferenceLists.ReferenceListAppService@GetByName | HIGH |
| Shesha.Web.FormsDesigner.Services.ConfigurableComponentAppService@GetByName | HIGH |
| Shesha.DynamicEntities.ModelConfigurationsAppService@GetByName | HIGH |
| Shesha.Areas.AreaAppService@GetChildTreeItems | HIGH |
| Shesha.DynamicEntities.EntityConfigAppService@GetClientApiConfigurations | HIGH |
| Shesha.Services.NHibernateAppService@GetConventions | HIGH |
| Shesha.DynamicEntities.EntityConfigAppService@GetEntityConfigForm | HIGH |
| Shesha.ConfigurationItems.ConfigurationItemAppService@GetExportFlatTree | HIGH |
| Shesha.DeviceForceUpdate.DeviceForceUpdateAppService@GetForceUpdateByOSType | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@GetFormsWithNotImplemented | HIGH |
| Shesha.Sessions.SessionAppService@GetGrantedShaRoles | HIGH |
| Shesha.ReferenceLists.ReferenceListAppService@GetItems | HIGH |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@GetJson | HIGH |
| Shesha.Notes.NoteAppService@GetList | HIGH |
| Shesha.DynamicEntities.EntityConfigAppService@GetMainDataList | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.ActivateMembershipAppService@GetMemberPayments | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.DynamicColumnsTest@GetPersonDetails | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.DynamicColumnsTest@GetPersonList | HIGH |
| Shesha.BackgroundProcesses.ProcessMonitorAppService@GetProcessState | HIGH |
| Shesha.Metadata.MetadataAppService@GetProperties | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@GetSchool | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@GetSchoolSubjects | HIGH |
| Shesha.Sms.Clickatell.ClickatellAppService@GetSettings | **CRITICAL** |
| Shesha.Authorization.Settings.AuthorizationSettingsAppService@GetSettings | **CRITICAL** |
| Shesha.Otp.OtpAppService@GetSettings | **CRITICAL** |
| Shesha.Email.EmailSenderAppService@GetSmtpSettings | **CRITICAL** |
| Shesha.BackgroundProcesses.ProcessMonitorAppService@GetStatus | HIGH |
| Shesha.Areas.AreaAppService@GetTreeItem | HIGH |
| Shesha.Settings.SettingsAppService@GetUserValue | HIGH |
| Shesha.Settings.SettingsAppService@GetValues | HIGH |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@ImportJson | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@ImportPackage | **CRITICAL** |
| Shesha.NotificationMessages.NotificationMessageAppService@MarkAsRead | HIGH |
| Shesha.DynamicEntities.ModelConfigurationsAppService@Merge | HIGH |
| Shesha.Areas.AreaAppService@MoveArea | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@MoveToModule | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@MoveToModule | **CRITICAL** |
| Shesha.Metadata.MetadataAppService@PropertyAutocomplete | HIGH |
| Shesha.Notifications.NotificationAppService@Publish | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@PublishAll | **CRITICAL** |
| Shesha.DynamicEntities.EntityConfigAppService@RemoveConfigurationsOfMissingClasses | HIGH |
| Shesha.DynamicEntities.EntitiesAppService@Reorder | HIGH |
| Shesha.Otp.OtpAppService@ResendPin | HIGH |
| Shesha.Email.EmailSenderAppService@SendEmail | HIGH |
| Shesha.Otp.OtpAppService@SendPin | HIGH |
| Shesha.DynamicEntities.EntitiesAppService@Specifications | HIGH |
| Shesha.Metadata.MetadataAppService@Specifications | HIGH |
| Shesha.DynamicEntities.EntityConfigAppService@SyncClientApi | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.PlaygroundAppService@TestAudit | HIGH |
| Shesha.Services.NHibernateAppService@TestEntities | HIGH |
| Shesha.Services.NHibernateAppService@TestEntity | HIGH |
| Shesha.Controllers.FrameworkController@TestException | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.PlaygroundAppService@TestFileVersionUrl | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.PlaygroundAppService@TestJsonWithGenericEntityReference | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.PlaygroundAppService@TestLinkState | HIGH |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.NotificationTestAppService@TestNotification | HIGH |
| Shesha.Sms.Clickatell.ClickatellAppService@TestSms | HIGH |
| Shesha.Metadata.MetadataAppService@TypeAutocomplete | HIGH |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@UpdateMarkup | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@UpdateSchoolCustom | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.ConfigurableComponentAppService@UpdateSettings | **CRITICAL** |
| Shesha.Otp.OtpAppService@UpdateSettings | **CRITICAL** |
| Shesha.Authorization.Settings.AuthorizationSettingsAppService@UpdateSettings | **CRITICAL** |
| Shesha.Sms.Clickatell.ClickatellAppService@UpdateSettings | **CRITICAL** |
| Shesha.Email.EmailSenderAppService@UpdateSmtpSettings | **CRITICAL** |
| Shesha.ConfigurationItems.ConfigurationItemAppService@UpdateStatus | **CRITICAL** |
| Shesha.Web.FormsDesigner.Services.FormConfigurationAppService@UpdateStatus | **CRITICAL** |
| Boxfusion.SheshaFunctionalTests.Common.Application.Services.SchoolsAppService@UpdateSubjectCustom | **CRITICAL** |
| Shesha.Settings.SettingsAppService@UpdateUserValue | **CRITICAL** |
| Shesha.Settings.SettingsAppService@UpdateValue | **CRITICAL** |
| Shesha.Otp.OtpAppService@VerifyPin | HIGH |

---

## Appendix B: Entities Without Permission Records

Of 145 entities, only 5 have Shesha.Entity records and 4 have Shesha.Entity.Action records.

All entities without explicit permission records rely on the CRUD authorization fallback (any authenticated user can perform all CRUD operations).

## Appendix C: Permission-to-Endpoint Matrix

| Permission | Endpoints Protected | Hardcoded |
|-----------|--------------------|-----------|
| `Pages.Roles` | `Shesha.Roles.RoleAppService`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService@Create`, `Shesha.Roles.RoleAppService@Create`, `Shesha.Roles.RoleAppService@Delete`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService@Delete`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService@Get`, `Shesha.Roles.RoleAppService@Get`, `Shesha.Roles.RoleAppService@GetAll`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService@GetAll`, `Shesha.Roles.RoleAppService@GetAllPermissions`, `Shesha.Roles.RoleAppService@GetRoleForEdit`, `Shesha.Roles.RoleAppService@GetRoles`, `Shesha.Roles.RoleAppService@Update`, `Shesha.ShaRoleAppointedPersons.ShaRoleAppointedPersonActionsAppService@Update` | No |
| `Pages.Tenants` | `Shesha.MultiTenancy.TenantAppService`, `Shesha.MultiTenancy.TenantAppService@Create`, `Shesha.MultiTenancy.TenantAppService@Delete`, `Shesha.MultiTenancy.TenantAppService@Get`, `Shesha.MultiTenancy.TenantAppService@GetAll`, `Shesha.MultiTenancy.TenantAppService@Update` | No |
| `Pages.Users` | `Shesha.Users.UserAppService`, `Shesha.Users.UserAppService@ActivateUser`, `Shesha.Users.UserAppService@ChangeLanguage`, `Shesha.Users.UserAppService@Create`, `Shesha.Users.UserAppService@Delete`, `Shesha.Users.UserAppService@Get`, `Shesha.Users.UserAppService@GetAll`, `Shesha.Users.UserAppService@GetRoles`, `Shesha.Users.UserAppService@GetUserAuthConfig`, `Shesha.Users.UserAppService@InactivateUser`, `Shesha.Users.UserAppService@ResetPassword`, `Shesha.Users.UserAppService@Update` | No |

**Orphaned permissions** (defined but unreferenced):
- `app:Configurator`
- `pages:applicationSettings`
- `Pages.Hangfire`
- `pages:maintenance`
- `pages:persons`
- `users:resetPassword`
- `pages:shaRoles`

---

## Appendix D: Role-to-Endpoint Access Matrix

| Role | Granted Permissions | Permissioned Endpoints |
|------|--------------------|-----------------------|
| System Administrator | (none assigned) | (none via permissions) |

---

## Summary

```
Total endpoints:     935
  - Anonymous:       148 (24 code, 13 DB, 111 default)
  - Authenticated:   65 (CRUD method bypass)
  - Permissioned:    33
  - Dynamic CRUD:    595 (119 entities)

DefaultEndpointAccess: 5 (AllowAnonymous) -- CRITICAL

PermissionedObject coverage:
  - WebApi records:         315
  - WebApi.Action records:  270
  - Entity records:         5
  - Entity.Action records:  4

Permissions & Roles:
  - Permissions referenced: 3
  - Permission definitions: 10
  - Orphaned permissions:   7
  - Roles:                  1

Recommendations:
  - CRITICAL: 43 (write/admin ops anonymous)
  - HIGH:     68 (read ops anonymous via default)
  - MEDIUM:   65 (CRUD bypass, review needed)
  - OK:       57

Top issues:
1. DefaultEndpointAccess=5 -- 111 non-CRUD endpoints are anonymously accessible
2. 43 write/admin operations (Create, Update, Delete, Bootstrap, Import) are anonymous
3. Only 5 of 145 entities have explicit permission records
```
