# Release Notes
Shesha 0.44 brings real quality-of-life improvements to the framework — from a redesigned property panel to more reliable scripting and clearer documentation. 
## 🚀 What's New in Shesha 
- **Migration from DefaultValue to onAfterDataLoad Scripts**
 - The DefaultValue property was removed from all supported components.
 - Default values are now expected to be set using onAfterDataLoad scripts.
 - This improves flexibility and avoids hardcoding values into the component definitions. 

- **Improved Script Dependency Management**
 - Scripts with dependencies now execute in the correct order.
 - Prevents issues caused by out-of-sequence execution. 

- **Direct Write Access to data and context**
 - Allows direct assignment without using SetFieldValue.
 - Reduces verbosity and improves readability of scripts. 

- **New Property Panel UI**
 - Completely redesigned panel with an improved layout.
 - Easier for developers to configure components visually.
 - More styling properties are exposed
![New_Property_Panel](https://github.com/user-attachments/assets/1b314357-2fdd-4069-aeb7-d7e51e86622d)

- **ReadOnly Mode Styling Support**
 - Developers can now apply styles specifically for components in ReadOnly state.
 - Useful for non-editable forms and view-only scenarios. 

 - **Chart Component Redesign**
  - The original chart component was split into **four specialized components**.
  - Enhances modularity, simplifies configuration by chart type. 

- **RefList Status & Dropdown Consolidation**
 - Dropdown now supports a “Display Style” setting (Plain text or Tags), making tag rendering more flexible in both edit and read‑only modes.
 - Supports specifying icon and color per value when using manual value lists.
 - New properties and read‑only behavior updates were added to simplify configuration and consistency across components 

- **DataContext - A Better, Faster Way to Handle App Data**
 - In previous versions, almost all temporary and permanent data was stored in a single unmanaged **GlobalState**. Over time, some components wrote to it unnecessarily, leading to major slowdowns.
 - Example: the SubForm component stored *all* field values in GlobalState, so typing one character could trigger a full re-render of every form - even the header and side menu.
 - **DataContext** replaces this with a managed, structured approach:
  - **appContext** – for app-wide data (replaces the old GlobalState)
  - **pageContext** – for data tied to a single page
  - **formContext** – for data tied to one form
- Also supports **component contexts** (e.g. DataTable) to directly access that component’s data and APIs.
- This dramatically reduces unnecessary renders, making apps faster and more responsive.

## 💪 Enhancements
- **Tabbed Properties Panel**
 - The property panel now uses tabbed navigation: Common, Appearance, Data, etc.
 - Tabs allow for better grouping of configuration options.
![Tabbed_Panel](https://github.com/user-attachments/assets/2265d891-db13-452d-a280-4ceff789f224)

- **Wrapped Content in Data Tables**
 - Text in data table cells now automatically wraps.
 - Prevents overflow and improves presentation of longer text entries.

## 🐞 Bug Fixes
- **Button Group Crash on Entity Option Change**
 - Fixed a crash when an entity option’s URL was changed dynamically.
 - Previously affected dropdowns and button groups using dynamic entities. 

- **Notification Framework Issue**
 - Addressed inconsistent triggering of toast messages and alert panels.
 - Event handling within the notification framework is now more reliable. 

 - **File List Ghost Property**
  - Fixed an issue where a ghost property was incorrectly added to payloads.
  - Triggered during Execute Script actions with the FileList component.
  - Ensures that only intended properties are included during submission. 




 

 

