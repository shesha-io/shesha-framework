# Release Notes
## Enhancements
- Integration to Monaco Editor:
  - Integrated Monaco Editor, powering VS Code, into Shesha.
  - Supports parsing of JavaScript and TypeScript files.
  - Features code completion (IntelliSense), refactoring functions, and syntax highlighting.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/f1862aeb-6633-43bc-9984-cb4e15f632c1)
  - Code validation and syntax highlight.
- Async/await in 'Execute Script' Action:
  - 'Execute Script' action now supports async/await, simplifying asynchronous code writing.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/a16d66c2-f5b1-4ca1-a980-a455b9dffcd0)
- JavaScript Template Enhancements:
  - Utilizes wrapper templates for JavaScript code blocks.
  - Allows read-only and editable areas for enhanced configurability.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/2d370cb7-578f-49ad-a259-f9038d74e99d)
- Application Exposed Variable:
  - Introduces the Application exposed variable, providing access to user and settings properties.
  - application.user contains properties such as user ID, name, and permission checking functions.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/5a2b3a10-b681-4e8c-a7a0-74bac79a2937)
  - application.settings allows reading and writing values of application settings.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/816d4653-dc4d-4f4f-ba02-129a16a629ac)
  - Supports application usage context, enabling binding of context properties to form components in readonly mode.
  ![image](https://github.com/shesha-io/shesha-framework/assets/151041759/3781faf1-f5ba-4cc3-a6b3-80bb7f41e09f)
- Moved non-core functionality and modules outside of Shesha core.
- Added support for Macs and iOS devices compatibility.
- Added a custom HTML form component.
- Exposed User Object and API.
- Provides client-side access to user properties and API for integration and customization.
- Tab Component Enhancements: Added select mode property for improved functionality.
- Allows specifying placeholder content for empty dataTable and dataList.
- Removed all obsolete components from the @shesha/reactjs

## Bug Fixes
- Resolved an issue where additional layers were added to the borders of files and file lists when the dragger property is enabled.
- Fixed an issue where the value of files and file lists did not show in details view read mode.
- Addressed limitations of subform-based custom renderer on dataTable column.
- Ensured a consistent default view between properties from entities and components from builder widgets.
- Fixed rendering issues where Datalist did not render when bound to the jsonList property.
- Resolved a rendering issue where the dataList within the subform component did not show when configuring from quick edit mode.
- Updated a spelling typo on the dataList form expression.
- Fixed an issue where the style property on dropdown didn't apply CSS with the value dataSource.
- Corrected the size reduction of the dateField when styling is applied.
- Improved functionality of the address component to provide multiple suggestions instead of a single one.
- Fixed an issue where the File component allowed upload when isDragger is true and edit mode is readOnly.
- Cleaned up the richtexteditor property for improved performance and usability.
- File/File List upload component does not append the owner ID after it's created

## UX Changes
- Configurator Toolbox Cleanup:
  - Enhanced configurator toolbox for a cleaner and intuitive user experience.
- Canvas Dimension Options:
  - Added desktop, iPad, and custom canvas dimension settings for increased flexibility.
- Zoomable Configuration Canvas:
  - Implemented zoom functionality for better visibility and control.
