const fs = require('fs');

// Build the comprehensive frontend reference lookup from the referenced-endpoint-catalog
// Key: URL path (normalized), Value: { sources: string[], forms: string[] }
const refs = {};

function addRef(url, source, forms) {
  // Normalize: lowercase, strip trailing slash, strip query params
  const key = url.replace(/\?.*$/, '').replace(/\/$/, '').toLowerCase();
  if (!refs[key]) refs[key] = { sources: new Set(), forms: new Set() };
  if (source) refs[key].sources.add(source);
  if (forms) {
    if (Array.isArray(forms)) forms.forEach(f => refs[key].forms.add(f));
    else refs[key].forms.add(forms);
  }
}

// ============ SECTION A: Coded Frontend ============
// Authentication & Session
addRef('/api/TokenAuth/Authenticate', 'coded', ['apis/tokenAuth.ts']);
addRef('/api/TokenAuth/RefreshToken', 'coded', ['apis/tokenAuth.ts']);
addRef('/api/TokenAuth/SignOff', 'coded', ['apis/tokenAuth.ts']);
addRef('/api/services/app/Session/GetCurrentLoginInfo', 'coded', ['apis/session.ts']);

// Form Configuration
addRef('/api/services/Shesha/FormConfiguration/Get', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/GetByName', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/UpdateMarkup', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/Create', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/CheckPermissions', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/GetJson', 'coded', ['apis/formConfiguration.ts']);
addRef('/api/services/Shesha/FormConfiguration/ImportJson', 'coded', ['apis/formConfiguration.ts']);

// Configurable Components
addRef('/api/services/Shesha/ConfigurableComponent/GetByName', 'coded', ['apis/configurableComponent.ts']);
addRef('/api/services/Shesha/ConfigurableComponent/UpdateSettings', 'coded', ['apis/configurableComponent.ts']);

// Generic Entity CRUD
addRef('/api/services/app/Entities/Get', 'coded', ['apis/entities.ts']);
addRef('/api/services/app/Entities/GetAll', 'coded', ['apis/entities.ts']);
addRef('/api/services/app/Entities/ExportToExcel', 'coded', ['apis/entities.ts']);

// Metadata
addRef('/api/services/app/Metadata/Get', 'coded', ['apis/metadata.ts']);
addRef('/api/services/app/Metadata/EntityTypeAutocomplete', 'coded', ['apis/metadata.ts']);
addRef('/api/services/app/Metadata/TypeAutocomplete', 'coded', ['apis/metadata.ts']);
addRef('/api/services/app/Metadata/Specifications', 'coded', ['apis/metadata.ts']);

// Entity Configuration
addRef('/api/services/app/EntityConfig/GetEntityConfigForm', 'coded', ['apis/entityConfig.ts']);
addRef('/api/services/app/EntityConfig/GetMainDataList', 'coded', ['apis/entityConfig.ts']);
addRef('/api/services/app/EntityConfig/GetClientApiConfigurations', 'coded', ['apis/entityConfig.ts']);
addRef('/api/services/app/EntityConfig/SyncClientApi', 'coded', ['apis/entityConfig.ts']);
addRef('/api/services/app/EntityConfig/Delete', 'coded', ['apis/entityConfig.ts']);
addRef('/api/services/app/EntityConfig/EntityConfigAutocomplete', 'coded');

// Model Configurations
addRef('/api/ModelConfigurations', 'coded', ['apis/modelConfigurations.ts']);
addRef('/api/ModelConfigurations/merge', 'coded', ['apis/modelConfigurations.ts']);

// Permissions
addRef('/api/services/app/Permission/GetAllTree', 'coded', ['apis/permission.ts']);
addRef('/api/services/app/Permission/UpdateParent', 'coded', ['apis/permission.ts']);
addRef('/api/services/app/Permission/Delete', 'coded', ['apis/permission.ts']);
addRef('/api/services/app/Permission/IsPermissionGranted', 'coded', ['apis/permission.ts']);
addRef('/api/services/app/Permission/Autocomplete', 'coded', ['apis/permission.ts']);
addRef('/api/services/app/PermissionedObject/GetAllTree', 'coded', ['apis/permissionedObject.ts']);

// Reference Lists
addRef('/api/services/app/ReferenceList/GetByName', 'coded', ['apis/referenceList.ts']);

// Notes
addRef('/api/services/app/Note/GetList', 'coded', ['apis/note.ts']);
addRef('/api/services/app/Note/Create', 'coded', ['apis/note.ts']);
addRef('/api/services/app/Note/Update', 'coded', ['apis/note.ts']);
addRef('/api/services/app/Note/Delete', 'coded', ['apis/note.ts']);

// Settings
addRef('/api/services/app/Settings/GetValue', 'coded', ['apis/settings.ts']);
addRef('/api/services/app/Settings/UpdateValue', 'coded', ['apis/settings.ts']);
addRef('/api/services/app/Settings/GetUserValue', 'coded', ['apis/settings.ts']);
addRef('/api/services/app/Settings/UpdateUserValue', 'coded', ['apis/settings.ts']);
addRef('/api/services/app/Settings/GetConfigurations', 'coded', ['apis/settings.ts']);

// File Storage
addRef('/api/StoredFile', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/Download', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/Base64String', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/Upload', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/UploadNewVersion', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/Delete', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/DownloadZip', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/FilesList', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/EntityProperty', 'coded', ['apis/storedFile.ts']);
addRef('/api/StoredFile/DownloadThumbnail', 'coded');

// User Management (coded)
addRef('/api/services/app/User/ResetPasswordSendOtp', 'coded', ['apis/user.ts']);
addRef('/api/services/app/User/ResetPasswordVerifyOtp', 'coded', ['apis/user.ts']);
addRef('/api/services/app/User/ResetPasswordUsingToken', 'coded', ['apis/user.ts']);

// Configuration Items (coded)
addRef('/api/services/app/ConfigurationItem/ExportPackage', 'coded', ['components/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/AnalyzePackage', 'coded', ['components/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/ImportPackage', 'coded', ['components/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/CreateNewVersion', 'coded', ['utils/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/UpdateStatus', 'coded', ['utils/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/CancelVersion', 'coded', ['utils/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/Delete', 'coded', ['utils/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/ClearClientSideCache', 'coded', ['utils/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/GetExportFlatTree', 'coded', ['components/configurationFramework/']);
addRef('/api/services/app/ConfigurationItem/Copy', 'coded');
addRef('/api/services/app/ConfigurationItem/MoveToModule', 'coded');

// API Discovery
addRef('/api/services/app/Api/Endpoints', 'coded', ['apis/api.ts']);

// Process Monitoring
addRef('/api/services/app/ProcessMonitor/GetProcessState', 'coded');
addRef('/api/services/app/ProcessMonitor/DownloadLogFile', 'coded');

// Misc
addRef('/api/services/app/EntityHistory/GetAuditTrail', 'coded', ['designer-components/']);
addRef('/api/services/app/Entities/Reorder', 'coded', ['components/kanban/']);

// ============ SECTION B: Form Config Values ============
addRef('/api/services/Shesha/FormConfiguration/Update', 'form-config', ['form-details']);
addRef('/api/services/Shesha/FormConfiguration/Copy', 'form-config', ['form-copy']);
addRef('/api/services/Shesha/FormConfiguration/MoveToModule', 'form-config', ['form-details']);
addRef('/api/services/Shesha/FormConfiguration/PublishAll', 'form-config', ['forms']);

addRef('/api/services/app/UserManagement/Create', 'form-config+JS', ['registration', 'user-create', 'user-management-create']);
addRef('/api/services/app/UserManagement/Update', 'form-config', ['user-management-details']);
addRef('/api/services/app/User/Get', 'form-config+JS', ['user-details', 'update-password-reset-methods', 'user-management-details']);
addRef('/api/services/app/User/InactivateUser', 'JS', ['user-details', 'user-management-details']);
addRef('/api/services/app/User/ActivateUser', 'JS', ['user-details', 'user-management-details']);
addRef('/api/services/app/User/ChangePassword', 'JS', ['change-password']);
addRef('/api/services/app/User/GetUserPasswordResetOptions', 'JS', ['forgot-password', 'select-reset-method']);
addRef('/api/services/app/User/SendEmailLink', 'JS', ['select-reset-method']);
addRef('/api/services/app/User/SendSMSOTP', 'JS', ['select-reset-method']);
addRef('/api/services/app/User/SendSmsOtp', 'JS', ['select-reset-method']); // alias
addRef('/api/services/app/User/ValidateResetCode', 'JS', ['otp-verification-page', 'email-link-verification']);
addRef('/api/services/app/User/ResetPasswordUsingToken', 'JS', ['reset-password']);
addRef('/api/services/app/User/ValidateSecurityQuestions', 'form-config', ['security-questions']);
addRef('/api/services/app/User/ResetPassword', 'form-config', ['user-reset-password', 'user-management-reset-password']);
addRef('/api/services/app/User/Update', 'form-config', ['update-password-reset-methods']);

addRef('/api/services/app/ShaRole/Get', 'form-config', ['role-details']);
addRef('/api/services/app/ShaRole/Update', 'form-config', ['role-details']);
addRef('/api/services/app/ShaRole/Delete', 'form-config', ['roles', 'role-details']);
addRef('/api/services/app/ShaRoleAppointedPerson/Get', 'form-config', ['assign-user-role']);
addRef('/api/services/app/ShaRoleAppointedPerson/Create', 'form-config', ['assign-user-role']);
addRef('/api/services/app/ShaRoleAppointedPerson/Update', 'form-config', ['assign-user-role']);
addRef('/api/services/app/ShaRoleAppointedPerson/Delete', 'form-config+JS', ['assign-user-role', 'role-details']);

// OTP
addRef('/api/services/app/Otp/SendPin', 'JS', ['otp-verification']);
addRef('/api/services/app/Otp/ResendPin', 'JS', ['otp-verification']);
addRef('/api/services/app/Otp/VerifyPin', 'JS', ['otp-verification']);
addRef('/api/services/app/Otp/GetSettings', 'form-config', ['otp-settings']);

// Notification
addRef('/api/services/app/Notification/Get', 'form-config', ['notification-details', 'notifications-create']);
addRef('/api/services/app/Notification/GetAll', 'form-config', ['notifications']);
addRef('/api/services/app/Notification/Delete', 'form-config', ['notifications']);

// Dynamic CRUD from forms
addRef('/api/dynamic/Shesha/NotificationTypeConfig/Crud/Create', 'form-config', ['notification-type-config-create']);
addRef('/api/dynamic/Shesha/NotificationTypeConfig/Crud/Update', 'form-config', ['notification-type-config-details']);
addRef('/api/dynamic/Shesha/NotificationTypeConfig/Crud/Delete', 'form-config', ['notification-type-configs']);
addRef('/api/dynamic/Shesha/NotificationTemplate/Crud/Delete', 'form-config', ['notification-type-config-details']);
addRef('/api/dynamic/Shesha/SecurityQuestion/Crud/Delete', 'form-config', ['security-questions']);
addRef('/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete', 'form-config', ['user-details', 'user-management-details', 'role-details']);
addRef('/api/dynamic/Shesha/FrontEndApp/Crud/Delete', 'form-config', ['front-end-applications']);
addRef('/api/dynamic/Shesha/FrontEndApp/Crud/GetAll', 'JS', ['user-details', 'user-management-details']);

// Reference Lists
addRef('/api/services/app/ReferenceList/Get', 'form-config', ['reference-list-details']);
addRef('/api/services/app/ReferenceListItem/Delete', 'form-config', ['reference-list-details']);
addRef('/api/services/app/ReferenceListItem/Get', 'form-config', ['reference-list-item-details-view']);

// Permission Management
addRef('/api/services/app/Permission/Get', 'form-config', ['permission-configurator']);
addRef('/api/services/app/PermissionedObject/Get', 'form-config', ['permissioned-objects']);
addRef('/api/services/app/PermissionedObject/Update', 'form-config', ['permissioned-objects']);

// Scheduler
addRef('/api/services/Scheduler/ScheduledJob/StartJob', 'JS', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobExecution/Get', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobExecution/Create', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobExecution/Update', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobExecution/Delete', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobTrigger/GetAll', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobTrigger/Create', 'form-config', ['scheduled-job-details']);
addRef('/api/services/Scheduler/ScheduledJobTrigger/Delete', 'form-config', ['scheduled-job-details']);

// Settings (forms)
addRef('/api/services/app/AuthorizationSettings/GetSettings', 'form-config', ['settings-security']);
addRef('/api/services/app/AuthorizationSettings/UpdateSettings', 'form-config', ['settings-security']);
addRef('/api/v2/Sms/Settings', 'form-config', ['settings-sms']);
addRef('/api/Sms/Gateways', 'form-config', ['settings-sms']);

// Home URL Routes
addRef('/api/services/Enterprise/HomeUrlRoute/Get', 'form-config', ['home-url-route-details']);
addRef('/api/services/Enterprise/HomeUrlRoute/Create', 'form-config', ['home-url-route-create']);
addRef('/api/services/Enterprise/HomeUrlRoute/Update', 'form-config', ['home-url-route-details']);
addRef('/api/services/Enterprise/HomeUrlRoute/Delete', 'form-config', ['home-url-routes']);

// Entity History
addRef('/api/services/app/EntityHistory/GetAuditTrail', 'form-config', ['entity-change-audit-log']);

// Autocomplete datasources
addRef('/api/services/app/Metadata/EntityTypeAutocomplete', 'form-autocomplete', ['form-details', 'form-create']);
addRef('/api/Sms/Gateways', 'form-autocomplete', ['sms-settings']);

// ============ SECTION C: Entity Bindings (implicit CRUD) ============
// These entities are bound to forms, implying all CRUD endpoints are referenced
const entityBindings = {
  'Person': ['persons-table', 'person-details', 'person-create', 'account-details', 'site-details', 'organisation-details', 'user-management-table', 'users'],
  'Organisation': ['accounts-table', 'organisations-table', 'sites-table', 'organisation-details'],
  'Account': ['accounts-table', 'account-details', 'account-create'],
  'Site': ['sites-table', 'site-details', 'site-create'],
  'Address': ['person-details', 'site-details', 'organisation-details'],
  'ShaRole': ['roles', 'role-assign-user', 'role-create'],
  'ShaRoleAppointedPerson': ['role-details', 'user-details', 'user-management-details'],
  'SecurityQuestion': ['security-questions', 'security-questions-view', 'security-question-create', 'security-question-details'],
  'FrontEndApp': ['front-end-applications', 'front-end-application-create', 'front-end-application-details'],
  'Module': ['modules'],
  'NotificationTypeConfig': ['notification-type-configs', 'notification-template-details', 'notification-template-create'],
  'NotificationTemplate': ['notification-template-create', 'notification-type-config-details'],
  'NotificationChannelConfig': ['notification-channel-configs', 'notification-settings'],
  'NotificationMessage': ['notifications-audit'],
  'OtpAuditItem': ['otp-audit'],
  'ShaUserLoginAttempt': ['logon-audit'],
  'EntityChangeAuditLog': ['entity-change-audit-log'],
  'StoredFile': [],
  'OrganisationBase': ['account-create', 'organisation-create', 'site-create'],
  'MessageTemplate': ['notification-templates'],
  'ScheduledJob': ['scheduled-job', 'scheduled-jobs'],
  'ScheduledJobExecution': ['scheduled-job-execution', 'scheduled-job-details'],
  'ScheduledJobTrigger': ['scheduled-job-trigger-create', 'scheduled-job-trigger-details', 'scheduled-job-details'],
  'ReferenceList': ['reference-lists', 'reference-list-create', 'reference-list-details'],
  'ReferenceListItem': ['reference-list-details', 'reference-list-item-create', 'reference-list-item-edit'],
  'Notification': ['notifications', 'notification-create', 'notifications-create'],
  'FormConfiguration': ['forms', 'form-templates', 'form-details'],
};

for (const [entity, forms] of Object.entries(entityBindings)) {
  for (const action of ['Get', 'GetAll', 'Create', 'Update', 'Delete']) {
    // Dynamic CRUD pattern
    addRef(`/api/dynamic/Shesha/${entity}/Crud/${action}`, 'entity-binding', forms);
  }
}

// ============ Now process the catalog report ============
const catalogPath = require('path').resolve(__dirname, '..', 'endpoint-catalog-report.md');
let catalog = fs.readFileSync(catalogPath, 'utf8');
const lines = catalog.split('\n');
const output = [];

// Track table headers to know which tables we're in
let inTable = false;
let headerLine = '';
let separatorLine = '';
let tableStarted = false;

function lookupRef(url) {
  if (!url) return '';
  // Normalize
  const key = url.replace(/\?.*$/, '').replace(/\/$/, '').replace(/\{[^}]+\}/g, '').replace(/\/$/, '').toLowerCase();

  // Direct match
  if (refs[key]) {
    const sources = [...refs[key].sources];
    const forms = [...refs[key].forms];
    let label = sources.join('+');
    if (forms.length > 0 && forms.length <= 3) label += ' (' + forms.join(', ') + ')';
    else if (forms.length > 3) label += ' (' + forms.length + ' forms)';
    return label;
  }

  // Try prefix match for /api/ModelConfigurations/{id}
  for (const [rk, rv] of Object.entries(refs)) {
    if (key.startsWith(rk) || rk.startsWith(key)) {
      const sources = [...rv.sources];
      return sources.join('+');
    }
  }

  return '';
}

function extractUrlFromRow(row) {
  // Parse markdown table row, find URL-like cell
  const cells = row.split('|').map(c => c.trim()).filter(c => c);
  for (const cell of cells) {
    if (cell.startsWith('/api/') || cell.startsWith('/api')) return cell;
    // Also check for URL-like patterns
    if (cell.match(/^\/[a-zA-Z]/)) return cell;
  }
  return '';
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Detect table header rows (contain |)
  if (trimmed.startsWith('|') && trimmed.includes('URL') && !trimmed.startsWith('|--')) {
    // This is a header row - add "Frontend Ref" column
    const newHeader = trimmed.replace(/\|(\s*)$/, '| Frontend Ref |');
    output.push(newHeader);
    tableStarted = true;
    continue;
  }

  // Detect table header rows for entity tables (contain "Entity")
  if (trimmed.startsWith('|') && trimmed.includes('Entity') && trimmed.includes('Auth Level') && !trimmed.startsWith('|--')) {
    const newHeader = trimmed.replace(/\|(\s*)$/, '| Frontend Ref |');
    output.push(newHeader);
    tableStarted = true;
    continue;
  }

  // Detect separator rows
  if (trimmed.startsWith('|') && trimmed.match(/^\|[\s-|]+\|$/) && tableStarted) {
    // Add extra column separator
    const newSep = trimmed.replace(/\|(\s*)$/, '|-------------|');
    output.push(newSep);
    continue;
  }

  // Detect data rows in tables
  if (trimmed.startsWith('|') && tableStarted && !trimmed.match(/^\|[\s-|]+\|$/)) {
    const cells = trimmed.split('|').filter((_, idx) => idx > 0); // skip first empty
    if (cells.length > 0) {
      // Try to find URL in this row
      const url = extractUrlFromRow(trimmed);
      let ref = '';
      if (url) {
        ref = lookupRef(url);
      } else {
        // For entity CRUD table rows, extract entity name and check
        const entityMatch = trimmed.match(/^\|\s*([A-Za-z]+)\s*\|/);
        if (entityMatch) {
          const entity = entityMatch[1];
          // Check if entity is bound
          if (entityBindings[entity]) {
            const forms = entityBindings[entity];
            ref = 'entity-binding' + (forms.length > 0 ? ' (' + (forms.length <= 2 ? forms.join(', ') : forms.length + ' forms') + ')' : '');
          }
        }
      }

      // For action-level tables, also check if the action name matches
      if (!ref) {
        // Try to match "Action" column
        const actionMatch = trimmed.match(/\|\s*(Get|GetAll|Create|Update|Delete|[A-Za-z]+)\s*\|/);
        // noop, URL match should handle it
      }

      // Append ref column
      const refCell = ref ? ` **${ref}** ` : ' -- ';
      const newRow = trimmed.replace(/\|(\s*)$/, '|' + refCell + '|');
      output.push(newRow);
      continue;
    }
  }

  // Non-table line: reset table tracking if we hit a blank or heading
  if (!trimmed.startsWith('|')) {
    tableStarted = false;
  }

  output.push(line);
}

// Write updated catalog
const result = output.join('\n');
fs.writeFileSync(catalogPath, result);
console.log('Updated catalog with frontend references');
console.log('Total referenced endpoints in lookup:', Object.keys(refs).length);

// Count how many catalog rows got a reference
let refsFound = 0;
let totalRows = 0;
for (const line of output) {
  if (line.trim().startsWith('|') && !line.includes('---') && !line.includes('URL') && !line.includes('Entity') && !line.includes('HTTP') && !line.includes('Object Type')) {
    totalRows++;
    if (!line.endsWith('-- |') && !line.endsWith('--|')) refsFound++;
  }
}
console.log(`Rows with frontend refs: ${refsFound} / ${totalRows}`);
