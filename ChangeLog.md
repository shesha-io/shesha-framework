# Release Notes
## Enhancements
- Added an access property on form settings to support: `Anonymous`, `Any authenticated`, and `Requires permissions` values. This allows configurators to specify required access at a view level.
- Required permissions of `Navigate to` menu items now automatically inherit from the required permissions of the targeted view. Currently supports the `form` navigation option.
- Provided a helper function on `SheshaAppServiceBase` to perform `MapToDynamicDtoListAsync`.
- Cleaned up the logon and OTP tables in the starter template database.
- Added an advanced filter component with a badge to indicate that filtering has been applied.
- Removed AppService or custom endpoints from the backend when `access` is set to `disabled`.

## Bug Fixes
- Fixed an issue where the autocomplete custom query parameter was not accepting dynamically defined values.
- Removed dot in `Select All Rows` cell.
- Fixed a bug where updated query parameter values were not saved in action configurations.
- Resolved an issue preventing configuration of a custom create URL without enabling `Can Edit Inline` in DataTable configuration.
- Fixed an issue where the `RichTextEditor` component displayed the value on top of the placeholder text when rendered in an edit dialog.
- Fixed the `table view selector` component to save updated changes.
- Ensured the navigation link on hover appears only on action configurations set to navigate.
- Removed the default icon if not specified in the side menu configuration.
- Fixed an issue where the API actual access value was not updated until a refresh was performed.

## Configuration Changes
- Updated forgot password to have access value.

## UX Changes
- CSS and layout improvements of the forms designer.
- Cleaned up Permissioned Objects and Entity Configuration UI.

## Breaking Changes
- Consolidated security-related settings into a single form. A backend update is also required.
