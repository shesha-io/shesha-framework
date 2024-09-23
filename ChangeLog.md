# Release Notes
## Enhancements
- **Ehanced System Login Restriction Access**: 
  - If no specific frontends are specified, the user will, by default, have access to all frontend applications.
  - **Login Failure for Unauthorized Frontends**: If a user is not authorized for a particular frontend, the login process will fail.
  - **Restricted Frontend Access**: When frontend access is restricted, the user can only log in to the specific frontends for which they have permissions.
  - Added a navigator-API
## Bug Fixes
- **`globalState` Not Rerendering Automatically**: Fixed an issue where globalState did not rerender automatically and required a manual action to refresh.
- **Side Menu Hard Reload**: Addressed an issue where the side menu caused a hard reload when a selected menu item rendered the Shesha setting forms.
- **Entity Picker Error on Nested Property**: Resolved an issue where configuring a display property with a nested property in the Entity Picker caused an error on the getAll endpoint during form rendering.
