# Release Notes

## 🐞 Bug Fixes

- **Excel Export – Respect Column Selection** - Excel export now only includes columns that are ticked/selected at the time of export
- **Forms Stuck on "Fetching Data"** - Fixed infinite loading indicator on forms that do not require data loading (Loader Type = None)
- **Registration Verification Routing Fix** - Fixed registration flow always routing to phone/OTP verification regardless of configuration. Email verification is now correctly used when configured, instead of defaulting to the mobile-number path
- **Entity Config Import/Export Fixes** - Security: Entity CRUD permissions are now correctly enforced after import (previously silently unenforced). Fixed property data being dropped during import

## 💪 Enhancements
- **Custom Endpoint Permission Export/Import**
  - Added export/import support for Shesha.WebApi / Shesha.WebApi.Action permissioned objects
  - New per-module ApiPermissionsManifest configuration item integrates with the existing export/import pipeline
  - Permissions are applied to PermissionedObject rows on import via IPermissionedObjectManager.SetAsync
  - No changes required to existing configuration infrastructure
 
- **L1 Caching for Redis**
  - Added in-process L1 cache in front of Redis with pub/sub invalidation, reducing CPU/memory from per-request deserialization
  - Configurable via SheshaRedis section (L1Enabled, TTL, max entries); can be disabled with L1Enabled=false
