# Release Notes

## 💪 Enhancements

- **Notifications Framework Refactoring and Enhancement**: Refactored and enhanced the Notifications Framework.
- **Close Dialog Action Improvement**: Improved "Close dialog" action by adding "Show dialog result" functionality.
- **Reference List Rendering**: Enabled `referenceList`components to render '0' values.
- **Dynamic Menu Item Behavior**: Made dynamic menu item behavior configurable.
- **Data Refresh Control in DataTable**: Introduced 'Disable refresh data' expression setting in `dataTableContext` for enhanced control.
- **Form Builder Panel Removal**: Removed form builder panels by default in preview mode.
- **Endpoint Access Override**: Allowed overriding of endpoint access defined in code when updated from the frontend.
- **User ID API Addition**: Added `user.personId` front-end API to retrieve the current user's `personId`.
- **User Registration and Authentication Configurability**: Made User Registration and Authentication behavior configurable for greater flexibility.
- **Event Handlers Enhancement**: Enhanced components' event handlers to use the full list of available variables.
- **Image Uploads from Configurations**: Enabled image uploads from configuration settings when base64 option is used.

## 🐞 Bug Fixes

- **DataList Component Crash**: Fixed DataList component crash when "Can Add Inline" configuration was set to "Yes."
- **Datalist Form Info Disappearance**: Corrected datalist form info not disappearing after 3 seconds in edit mode.
- **Entity Reference Links Issue**: Resolved issue with Entity Reference component links being disabled when Edit Mode was set to 'Readonly.'
- **Data Loss in Filtered ChildTable**: Fixed data loss in filtered childTable when 'Edit' and 'Cancel Edit' were clicked on the parent form.
- **Header Background Color**: Addressed header background color not applying with new panel styling.
- **Sizable Columns Crash**: Resolved crash in sizable columns component when adding a new column.
- **Form Information on Logout**: Ensured form information is hidden upon logout.
- **Modal Designer Locking**: Locked modal designer within the browser window to prevent scrolling during form edits.
- **Redirection After Logout**: Fixed redirection issue where users were sent to the previous page instead of the configured home URL/default landing page after logout.
- **Integer ID Validation**: Addressed integer ID validation error when loading a form using the integer ID.
- **Endpoint Failure on Readonly Forms**: Fixed endpoint failure when re-updating a form with a `readOnly` property without page refresh.
- **Cancelled Edit Reversion**: Resolved issue where cancelling an edit reverted to old changes instead of the latest saved data.
- **Home URL Routing**: Corrected Home URL routing to navigate to the specified dynamic URL instead of the default landing page.

## Configuration Forms

- **ShaRoleAppointedPerson Endpoint Update**: Updated ShaRoleAppointedPerson delete configuration to use the correct endpoint.
- **New Version Creation Redirection**: Fixed issue where creating a new version did not redirect to the designer after version creation.
