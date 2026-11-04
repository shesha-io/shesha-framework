# Release Notes

## 🐞 Bug Fixes

- **Setting Definition Resolution on the Backend** - `SettingsAppService` (`GetValueAsync`, `UpdateValueAsync`, `GetUserValueAsync`, `UpdateUserValueAsync`) now resolves the setting definition server-side via `ISettingDefinitionManager` (matching `Module`/`Category`/`Name` against `ModuleAccessor`/`CategoryAccessor`/`Accessor`), falling back to the raw input when no definition is found. `SettingIdentifierDto` gained a `Category` field. Front-end `SettingsManager.getValueAsync` no longer pre-resolves the setting id client-side before calling the API — removed the now-redundant `IConfigurationFrameworkRuntime` dependency from `SettingsAppService`
