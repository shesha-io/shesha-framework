# Release Notes
## Enhancements
- **Ehanced Form Settings**: Introduced configurable form lifecycle management, providing more flexibility in form handling.
  - **Appearance**: Contains all settings related to form view (layout, size etc).
  - **Data**: Contains settings related to data processing and form lifecylce.
  - **Security**: Security related settings.
- **Enhanced App Settings Page**: Expanded the App Settings page to manage front-end specific settings in addition to general settings, including Default URL, Theme, and Main Menu configurations.
  - **Default URL**: This is the url the user should be redirected to if the user is not authenticated and does not specify a specific page.
  - **Main Menu Settings**: Here you can configure the sidebar menu items by adjusting their settings and ordering.
  - **Theme Settings**: Here you customise the theme color of the application.
- **Enhanced Button Component**: Added additional styling properties to the Button Component for improved customization.
- **Exposed getAnonymousForms Endpoint**: Made the getAnonymousForms endpoint accessible for easier integration.
- **Improved JavaScript Settings Component**: Updated the JS settings component for better performance and user experience.
- **Configurable User Profile**: Allowed additional configurations to be configured below the user logged information.
- Added `addDelayedUpdateData` variable which is required for files when using a script method.
- **Style Section Hidden in Table**: The style section is now hidden for Textfield and Autocomplete components when rendered within a table.
- **Font Weight on Table Column Names**: Increased the font weight to 600 for table column names to enhance visibility and readability.
- **Reset Wizard State Action**: Exposed an action on Wizard actions that allows resetting the wizard state.

## Bug Fixes
- **Component Label Issue**: Fixed an issue where components (Address, Entity Reference, Subform, ChildEntitiesTag Group) did not append the label by default when a property name was selected.
- **Base64 Image Rendering**: Resolved a problem with Base64 images not rendering in the Image component and container background property.
- **CRUD Operations Column Expansion**: Corrected the unexpected expansion of CRUD operations columns when using the toogle columns selector option.
- **Table View Component Issue**: Fixed the "add item" modal in the newly created Table view component, which was not closeable by default.
- **Permission Configurations Import**: Addressed a bug causing the application to break when importing permission configurations with ConfigMigrations.
- **setFormData Initialization**: Resolved an issue where setFormData used on Initialization did not append values to the specified field in forms.
- **Backend Endpoint Management**: Fixed the issue where the backend did not properly remove or reinstate endpoints when disabled or enabled.
- **Duplicate Records from Button Clicks**: Fixed a bug causing duplicate records due to multiple clicks on the default, custom buttons and datalist during network delays.
- **Notes Component Overflow Issue**: Fixed an issue where clicking 'More' on long notes caused them to overlap outside the line section on the Notes component.
