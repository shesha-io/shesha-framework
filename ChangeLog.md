# Release Notes

## Enhancements
- Context Features
  - Allow to have several storages for the application and use additional layers of form configuration. For example, you can use checkbox/button to switch count of fields, required fields, visibility/enabled. Or use length of text to show warnings
  - It is also necessary for passing data between forms and components. There is always an application context “appContext” that we MUST use instead of “globalState”
  - Each setting can be configured in two ways – value and JS code
  - “Custom Visibility” and “Custom Enabled” have been migrated to “Hidden” and “Disabled” settings in JS mode
    
![image](https://github.com/shesha-io/shesha-framework/assets/151041759/c0156039-ac23-4b49-b3cd-7f48ef7c7cd5)


- Added Debug Panel. It is opened by Ctrl-F12

![image](https://github.com/shesha-io/shesha-framework/assets/151041759/fba99cf7-f758-4771-bc97-9f7ce8dd8620)



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

## Breaking Changes
- For custom components the `factory` property has been changed to `Factory`.
- The parameters on the `factory` property are no longer the same. Instead of having multiple parameters on the `factory` property only one parameter is available. The parameters are of type `ComponentFactoryArguements`. `ComponentFactoryArguements` includes `model` in the interface. Simply destruct `model`, `form`, `context` and many more.
- On `settingsConfig` change `name` to `propertyName`, both the key and values should be changed.  From `name: name` to `propertyName: propertyName`.
- `IDataMutator` interface has been removed.
- `ReactTable` component now requires the `DataTableProvider` to wrapped around `ReactTable` to work
