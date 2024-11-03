# Release Notes
## Enhancements
- **New Components Added**: Chevron, Kanban, and Chart components.
- **Startup Optimization**: Improved solution startup time by bypassing the bootstrapper process for unchanged DLLs.
- **Startup Optimization**: Improved solution startup time by optimizing the `PermissionObjectBootstrapper` process for faster performance.
- **Responsive Configuration**: Enhanced advanced responsive settings for components.
- **Improved Text Components**: Exposed value variable in `Textfield` and `Text Area` components' `onChange` property.
- **CRUD API Swagger Updates**: Refined documentation for CRUD endpoints to prevent readonly properties from appearing in Create and Update operations.
- **Form Edit Mode Updates**: Streamlined editing functionality.
- **Container Component Enhancement**: Added shadow control for better UI customization.
- Enhanced DynamicDto Mapping Methods

## Bug Fixes
- **Subform Data Update Issue**: Resolved issue where subform didn’t update correctly without clearing selected values.
- **Dialog Error**: Fixed error when re-rendering dialogs after clearing dialog arguments.
- **Theme Color Transition**: Corrected initial display to immediately reflect the primary theme color. (Note: Adding app/app-provider.tsx at the project level is required for the loader line to inherit the primary system color.)
- **Inline Editing in DataTable**: Addressed issue preventing inline editing from displaying values within subforms.
- **Dropdown Width**: Removed hardcoded 100% width from dropdown component for flexible styling.


## Starter Template Update
- **Login Page Update**: Updated login page to utilize configurable forms for customization.
- **Organization Naming Constraint**: Prevented users from setting "Shesha" as the organization name in the starter project creator page.
- **Form Template Removal**: Removed GUID form template from the starter project database.
