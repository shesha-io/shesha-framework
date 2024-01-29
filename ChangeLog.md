# Release Notes
## Enhancements
- Introduction of a Quick Edit form builder, now opening in a large dialog box instead of a new tab.
- Allowing users to define the width of the datalist create dialog.
- Updating to the latest versions of Ant Design (antD) and Next.js.

## Bug Fixes
- Resolving issues with the time picker range and hour properties.
- Setting specific widths for CRUD operations column and action column.
- Hiding the JS function on the styling box.
- Enabling checkboxes for single/multiple selection in datalist.
- Addressing the problem where the same form is displayed for creating and listing when using view type on datalist.
- Fixing rendering issues related to custom hidden state and edit mode with if statements.
- Correcting the edit mode behavior on the subform.
- Resolving the issue where the ChildEntitiesTagGroup component sends null values.
- Ensuring datalist becomes editable when rendering the component within a layout component.
- Fixing the failure to prepopulate relevant additional fields for components requiring them upon selection.
- Rectifying the problem where subform data comes empty when rendered on the datalist.
- Fixing the Entity Picker component failing to update the value when rendered on the datalist.
- Addressing the datalist form selection mode expression hiding the create form field.
- Resolving the issue where a component is not displayed in designer mode when the state is set to hidden.
- Various bug fixes after upgrading Ant Design.

## UX Changes
- Addition of a new styling component on layout components.
- Displaying the delete button only on the selected widget.

## Configuration Changes
- Removed the label field from new forms.
- Added tooltips to key fields.
- Adjustments to the template dropdown on new forms.
- Moved the entity field after the template.
- Adjustments to the Entity dropdown on new forms.
- Default Form to currently edited module.
- Updated the label and component span

## Breaking Changes
- Due to recent changes, some old forms may not render as expected, requiring reconfiguration.
- The ChildTagEntity component does not clear the previously captured data if nested data is present.
- The system theme does not apply the primary color to all required components; update with the info color.
