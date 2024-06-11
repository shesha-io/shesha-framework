# Release Notes
## Enhancements
- Enhanced Image component to support additional image sources.
- 'Lightning' button is now selected by default upon binding a property.
- API security can now be configured.
- Implemented Icon Picker component styling.
- Hid irrelevant action options in the side menu.
- FormApi migration:
  - Migrated some form methods and variables into FormApi:
     - `setFormData` -> `form.setFormData` (deprecated, use `form.setFieldsValu`e or `form.setFieldValue` in the future)
     - `formMode` -> `form.formMode`
     - `formData` -> `form.data` (used only for `onNewRowInitialize` and `onRowSave` custom events of DataTable and DataList)
- Added `Disable item value` property of dropdown component.

## Bug Fixes
- Style property not working correctly on the Reference List status
- Error displayed twice for 'This Field is Required' on Button Type property.
- Side menu performs a hard-reload when the configuration used is a navigation URL.
- Switching off the edit mode switch auto-redirects to the configurable header design.
- RichTextEditor fails to display data when rendered in an edit dialog.
- Dragging and dropping an item outside a group in the side menu results in item duplication.
- Custom endpoint returns an int instead of the referenceList item name.
- Properties set to 'audited' in the Entity Configuration are not logged in the audit log.
- Components do not adhere to the specified permissions.
- Ghost property appended when files are attached to a dataList.
- Fixed sideways scroller when the canvas is zoomed.
- DataList component does not display data in designer mode.
- Fixed GetAuditTrail endpoint parameters.
- If a form has tab and button components configured, a 415 error is displayed upon saving.
