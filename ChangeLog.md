# Release Notes
## Enhancements
- Made the header bar configurable. A backend update is required to retrieve the header configuration form.
- Converted roles and permissions to `configurationItem`.
- Added support for `wrap` orientation on the Datalist component.
- Permissions can now be selected from a list instead of entered as free text.
- Created a permission component that allows selection of one or more permissions.
- Added support for full width on the search bar component.
- Added support for `pageContext` on the query builder.
- Added an `onChange` event property to the Entity Picker component.
- Added a `name` property to the formConfiguration update endpoint.
- Added support for typeShortAlias to the entityHistory endpoint and created an API for getting form settings from the code editor.
- Implemented a click action listener.
- Added an `allow delete` property to the Notes component.

## Bug Fixes
- Fixed an issue where formatting on nested entities configurations did not apply to subforms.
- Fixed duplication of the `initialValue`s variable in onDataLoaded form settings.
- Fixed duplication of the `formMode` variable on the file list changed property.
- Ghost property appended to the payload when submitting the fileList component using the execute script action.
- Ensured formatting on Entity Configuration now applies in real time in the current browser.
- Fixed the issue where the `edit mode` property on the Address component was not working as expected.
- Ensured values written to the `pageContext` are now reflected in its properties immediately.
- Fixed the issue where `pageContext` did not append data to the subform after selection on an autocomplete.
- Addressed the issue where custom buttons failed to adhere to form validations.
- Optimized the Entity Picker component to prevent unnecessary calls on form load, improving performance.
- Fixed the issue where the Tab component allowed users without defined permissions to view the component.
- Ensured the file list component does not allow file deletion when the `Allow remove` property is set to false.
- Fixed an error thrown when utilizing `pageContext` on a dialog view.
- Fixed the issue where the Address component appears blank upon rendering and only becomes visible after the form state changes.

## Configuration Changes
- Added a standard form to display entity audit trail information.
