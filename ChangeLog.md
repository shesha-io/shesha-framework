# Release Notes

## Enhancements
- Context Features
  - Allow to have several storages for the application and use additional layers of form configuration. For example, you can use checkbox/button to switch count of fields, required fields, visibility/enabled. Or use length of text to show warnings
  - It is also necessary for passing data between forms and components. There is always an application context “appContext” that we MUST use instead of “globalState”
    
![Context Image](https://github.com/shesha-io/shesha-framework/assets/151041759/1571b89f-cd28-4d0e-8224-f3b57ba72a3b)

- Enhancements to the Wizard component
  - Allowing `beforeNext`, `AfterNext`, `BeforeBack`, `AfterBack`, `BeforeCancel`, and `AfterCancel` events to be defined.
- Enhancements to DataList
  - Support for grouping, styling the header color and text color.
  - Allow collapsible and collapse by default.
- Enhancements to DataTable
  - Support for grouping, sorting, and reordering.

## Bug Fixes

- Textfield bug fixes.
- Allowing time picker value to be rendered on a dialog.
- Rendering the correct value on the time picker instead of 'am' value always.
- Removing 'null' values on a number component.
- Logging onChange events.
- Removing time when showtime is false on a datefield display component.
- Displaying the correct values when drilling down to the child table values matching the parent values.
- Allowing the number component to render '0'.
- Displaying filtered data on page reload.
- Applying formatting applied to the number property.
- Logging errors on validation component when rendered on the details view.

## UI Fixes

- Showing the parent menu item after moving away from the selecting.
- Misalignment on add inline columns when multi-select is true.
- Misalignment of data when displaying table data using default and input field.
