# Release Notes 
Shesha 0.45 makes configuration management feel like it actually belongs in a modern framework - a unified Configuration Studio, a domain modeller that doesn't require code, and the ability to customise base modules without fear of the next upgrade wiping your changes. 

## 🚀 What's New in Shesha 

- **Configuration Studio** 

  - All configuration item types (Forms, Reference Lists, Entities, Roles etc.) are now managed from a single unified hub instead of separate admin screens. 
  - A Solution Explorer tree organises all items by module. 
  - Base module configurations are hidden by default and only surface when explicitly "Exposed". 
  - Multiple configuration items can be open and edited simultaneously in tabs. 
  - The `Draft → Save as Ready → Publish` lifecycle has been removed - versions are managed automatically. 
  - Import/Export dialogs now show a per-item conflict preview: Unchanged / New / Updated / Error. 
  - The Studio opens in its own browser tab, separate from the Admin Portal. 
 
- **Configuration Expose & Module Inheritance Hierarchy**
  
  - "Exposing" a configuration item from a base module creates a protected override copy within the current module's scope - insulated from future upgrades to the source module. 
  - Applications can define an ordered module inheritance hierarchy (e.g. `MyApp > ProductA > Shesha.Enterprise > Shesha.Core`). 
  - At runtime, the system traverses the hierarchy from highest to lowest precedence and returns the first matching configuration item, ensuring the most project-specific version always wins. 

- **Enhanced Entity Configurator** 

  - Exposed entities from base modules can now be modified through configuration - adjusting labels, descriptions, validation rules, read-only state, default editors, entity reference filters, cascade rules, and property visibility - without touching code. 
  - Entirely new entities can be created from scratch or by inheriting from an existing entity; new entities are generated as `partial` classes in the back-end project and can be marked as extensible. 
  - The `General` tab now shows `Base Entity` and `Database Table` (read-only) instead of the old Version, Module, and Suppress fields. 
  - The `Properties` tab visually distinguishes hidden, inherited, and code-defined properties, and surfaces warnings for properties with pending back-end changes. 
  - New supported property types: `Integer`, `Entity Reference (Multiple)`, `List of Entities`, `List of Child Entities`, `List of Files`, and `Notes`.

- **Public Portal Layout Now in Core** 

  - A horizontal layout mode is now available in Core, purpose-built for public-facing portals. 
  - Includes a configurable header and footer, breadcrumbs, optional sticky heading, and themeable responsive styles. 
  - A dynamic layout-selection hook enables switching between default and horizontal layouts at runtime. 
  - A new Horizontal Menu designer exposes rich appearance, typography, and dimension controls. 

 
## 💪 Enhancements 

- **Component Configuration Error Indicators** 

  - Components now show colour-coded visual indicators when not properly configured, instead of inline error messages. 
  - Blue indicator: configuration is needed. Yellow indicator: configuration error. 
  - Detailed messages surface via tooltips on hover. 

- **New Frontend Application Setup** 

  - The default public portal header, footer, and login layout are now clean out of the box.
  - Configuration for custom header, footer, and login forms is centralised to a single location. 

- **Form Builder Canvas** 

  - The form builder canvas is now zoomable and scrollable, giving a much more accurate representation of the final rendered form during configuration. 
  - Previously, the canvas bore little resemblance to the actual preview, forcing developers to constantly switch between edit and preview modes to verify layout. 
  - The canvas now behaves as a true WYSIWYG surface - what you configure is what you see. 
  - Dropping a `DataContext`, `DataTable`, or `DataList` onto the canvas now places a pre-configured component complete with dummy data, so you can see structure and layout immediately rather than staring at an empty shell. 

- **DataTable - Styling, Selection & Events** 

  - Significantly expanded styling options - control row appearance, header styles, striping, hover highlights, sticky headers, borders, and more. 
  - Selection mode standardised to match `DataList`, with `None`, `Single`, and `Multiple` options. 
  - Five new event handlers: `onRowClick`, `onRowDoubleClick`, `onRowHover`, `onRowSelect`, and `onSelectionChange`. 

- **Accurate Width Control for Components** 

  - Width properties now apply to the component's own outer dimensions, giving you precise control over how components are sized on the canvas. 
  - Setting a container to 50% now changes the container itself - child elements retain their full available space within it. 

## 🐞 Bug Fixes 

- **`getExpression` Restored to Async** 

  - `getExpression` became synchronous after the Properties Panel migration, breaking Action Configuration scripts (e.g. Execute Script on Button). 
  - It is now async again for all components that support Action Configuration. 

- **Entity Configuration Panel - Three Post-Migration Fixes** 

  - Read-only settings on entities were not enforced at render time. 
  - String properties were missing the `Min Length` field; Reference List Item properties were missing `Reference List Namespace`. 
  - The default tab was not auto-selected when opening an entity in the configuration panel. 

- **Context Variables Undefined in DataTable Action Column Scripts** 

  - Scripts triggered from the action column of a `DataTable` had `pageContext`, `form`, `setGlobalState`, and other context variables arrive as `undefined`. 
  - These are now correctly injected so scripts run with full context. 

- **Uploaded File Lost on Wizard Back Navigation** 

  - A file uploaded via `FileList` on Wizard step 2 (for example) disappears when navigating back to step 1. 
  - Files now persist correctly across Wizard step navigation. 

- **Query Builder Scripts Sent as Raw Strings** 

  - Script conditions in the Query Builder were sent as raw, unevaluated strings in the API payload, meaning filter logic was never executed. 
  - Scripts are now evaluated before being included in the payload. 

- **Label and Component Span Not Live in Form Designer** 

  - Changes to `Label Span` and `Component Span` on the Appearance tab required a save and page refresh to take effect. 
  - They now reflect immediately in the designer. 
