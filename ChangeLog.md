# Release Notes
# Release Notes
## 🚀 What's New in Shesha
- **Multi Entity Reference (Many-to-Many Reference)**
  - Multi-Entity Reference allows an entity to maintain relationships with multiple related entities which can be applied to list properties. For more details [see docs](https://docs.shesha.io/docs/back-end-basics/multi-entity-reference/) 
  - Support for multi-entity reference properties at the domain level. Developers can now define properties `(e.g., List<Persons> AssignedPeople)` with the `[MultiEntityReference]` attribute.
  - GET, CREATE, and UPDATE operations now support multi-entity reference data. During updates, any references missing from the payload are automatically removed from the database.
  - All multi-entity references are stored in a dedicated database table—no additional migrations required.
  - The Entity Picker component now seamlessly bind to these properties, with the Autocomplete defaulting to multiple selections when applicable. The same binding mechanisim will be applied to Autocomplete component in the future release
  - Changes to audited properties are now logged, and the entity configurator has been updated to reflect this new property type.
## 💪 Enhancements
- **Enhanced File List Display Options**
  - The file list component now supports additional properties for improved customization. Users can choose between Thumbnail and File Name views.
  
Thumbnail view:
![Thumbnail_view](https://github.com/user-attachments/assets/7ab39a6e-9ab0-4a0b-a304-349fda212b52)

- **File Type Icons For Enhanced File List Component**
  - We have improved the file list component by introducing file-specific icons for better clarity and user experience. Instead of the generic icon, the component now displays an appropriate icon based on the file type (e.g PDF, Word, Excel, Text files, and images). For unsupported file types, a default icon will be shown.
![image](https://github.com/user-attachments/assets/bbaa9f57-d8fd-4645-879c-4269d759606e)
- Added usage of `localStorage` and `sessionStorage` objects via `contexts.webStorage` from the Code Editor
- Limited script execution in components based on dependencies

## 🐞 Bug Fixes
- Fixed an issue where form arguments in custom buttons were not triggered when the DataTable changed in a modal dialog.
- Resolved a problem where globalState did not re-render automatically, requiring an additional action to refresh buttonGroup and custom buttons.
- Addressed a bug where enabling "Allow Sorting" on an Entity Picker column triggered a call to the getAll endpoint without including the sorting parameter in the request.
- Fixed an error in DataTable and DataList Action Config, which occurred when refreshing dataTableContext using the refresh method from custom buttons.
- Fixed an issue where the SubForm GetFormData action did not update data when parameters were re-rendered.
- Fixed a 500 Internal Server Error that occurred when exporting entities inheriting from Shesha or Enterprise entities.
