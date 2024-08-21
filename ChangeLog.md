# Release Notes
## Enhancements
- **Configurable Login Page**: The login page has been converted to a configurable form, enhancing flexibility and customization options for user authentication.
- **Image Background Support**: Added support for rendering an image background on the container, allowing for more customizable and visually appealing designs.
- **Additional Styling Properties**: Exposed additional styling properties on `autocomplete`, `image`, `textfield`, and `container` components.
- **Permission Check Enhancements**: Improved the `user.hasPermissionAsync` API to allow checking for permissions scoped by permissionnedEntityId, providing more granular control over permission checks.
- **Side Menu Update**: Updated the `Visibility` property on the side menu to the `Hidden` property, improving clarity and functionality.
- **User-Specific Settings**: Added APIs to store user-specific settings and preferences, enhancing personalization options.

## Bug Fixes
- **SubForm Context Restriction**: Restricted access to contexts for JavaScript code in components inside SubForms, enhancing security and data integrity.
- **Wizard Validation Extension**: Extended wizard validations to apply to subforms rendered within the wizard component, ensuring comprehensive validation coverage.
- **Entity Configurations Formatting**: Fixed an issue where formatting on the Entity Configurations was overwriting the component formatting on a DataTable, ensuring consistent formatting.
- **React Error Resolution**: Resolved "Minified React error #185" thrown when rendering Datalist with form sourceType in DataTable, improving stability and user experience.
- **Side Menu Behavior**: Addressed an issue where the side menu was unintentionally collapsing and expanding on page load, ensuring consistent navigation behavior.
- **Permission-based Filter Access**: Ensured that users without appropriate permissions cannot access filters that are assigned permissions, maintaining proper access control and security.
- **Action Refresh Table**: Fixed an issue where the refresh table action fails when used on custom buttons.
- **Form Refresh Action**: Resolved an error that occurred when the form:refresh action was used on a stand-alone form/table
