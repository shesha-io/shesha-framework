# Release Notes 

Shesha 0.46 is a rebuild release. Where 0.45 rethought how configuration is managed, this one goes after what you touch every hour: the components on your canvas, the scripts behind them, and the platform they run on. Expect far fewer surprises once you are on it, and a few deliberate ones on the way there, so start with Breaking Changes. 

 

## 📌 General 

- **Node.js 24 Is Now Required** 

  - The framework has moved from Node.js 22 to Node.js 24, and npm 11 is now the minimum. 

  - Please make sure your local development environment is running Node.js 24 before you pull this release. To manage multiple versions on one machine, we recommend a version manager such as `fnm` or `nvm`. 

- **.NET 10 Is Now Required** 

  - Backend projects have moved from .NET 8 to .NET 10, so you will need the .NET 10 SDK installed and your own projects retargeted before they can reference this release. 

- **React 19, Ant Design 6, and Next.js 16** 

  - The frontend library has moved to React 19, Ant Design 6, and Next.js 16. 

  - Custom components, custom styling, and any code that depends on Ant Design internals should be tested against this release, as Ant Design 6 is a major version with its own breaking changes. 

 

## ⚠️ Breaking Changes 

- **The Scripting API Was Reworked**

  - Scripts now work with a single, consistent set of objects: `form`, `formData`, `user`, `actions`, `utils`, `page`, `components`, `storage`, `application`, and `query`. 

  - `pageContext` is replaced by `page.state`, with `page.location` for the browser location. 

  - `http` is now `actions.callApi`, and `message` is now `actions.showMessage`. 

  - `modal` is now `utils.modal`, with `actions.showDialog` and `actions.showConfirmation` for opening dialogs. 

  - `moment` is now `utils.moment`, and `fileSaver` is now `utils.saveAs`. 

  - `globalState`, `setGlobalState`, `selectedRow`, and `contexts` are no longer offered; use `page.state`, a data context, or the new `components` API instead. 

  - Existing scripts keep working for now because the old names still resolve at runtime, but they are no longer suggested or type-checked in the editor and should be migrated. 

  - Component settings and event handlers were migrated automatically to `form.data`, `form.setFormData`, and `form.formMode`. 

- **Permissions Moved for Reworked Components** 

  - Reworked components no longer have a Security tab. Permissions are now set per setting, using the lock icon next to `Visible` and `Interaction Mode`, so visibility and editability can be permissioned independently. 

  - Existing permission values are migrated across automatically, and components that have not been reworked yet continue to use their Security tab. 

- **Reworked Components Have a New Settings Layout** 

  - Only `Common`, `Events`, and `Appearance` tabs remain. Validation settings moved into a `Validations` panel on the `Common` tab, and `Edit Mode` is now labelled `Interaction Mode`. 


 

 

 

- **Property Name No Longer Accepts a JS Expression** 

  - The JS toggle was removed from the `Property Name` setting on all components. Property names must now be static. 

- **Password Combo Component Deprecated** 

  - It is hidden from the toolbox. Use Text Field with `Text Type = Password`, which now includes a `Use standard password validation` switch. Existing forms keep working. 

- **Key/Value Variable Lists Replaced by the Expression Editor** 

  - The old variable list has been removed across the entire system in favour of the new expression editor. 

- **Login and OTP Endpoints Are Rate Limited** 

  - Login is capped at 10 requests per minute and OTP sends at 5 per minute, both configurable. 

  - Load tests and automated scripts that hit these endpoints in bursts will start receiving `429 Too Many Requests`. 

 

## 🚀 What's New in Shesha 

- **Components Reworked Across the Board** 

  - 43 components have been reworked on a common pattern, with a tighter settings layout, validation settings alongside the rest of the configuration, and permissions that can be set per setting rather than per component. The remaining components are being moved to the same pattern and will follow in upcoming releases. 

   - Text Field now handles passwords directly, with the option to follow the complexity rules from your authentication configuration or to skip global validation. 

- **Reworked Scripting API** 

  - One coherent API replaces the loose collection of globals that scripts previously reached for: `actions` for calling APIs, showing messages and opening dialogs, `utils` for helpers, `page` for page state and location, `user` for the current user, `storage` for web storage, and `form` for the form itself. 

  - `components` gives typed access to other components on the form, including DataTable and DataList, so a script can read or drive another component without reaching into internals. 

  - Because the API is typed, the editor now offers accurate autocomplete and inline documentation for all of it. 

- **New Expression Editor** 

  - A single expression editor replaces key/value pair configuration everywhere it was previously used, so building expressions works the same way across the whole system. 

- **Show Dialogs and Confirmations From a Script** 

  - `actions.showDialog` opens a form in a modal and returns its values, and `actions.showConfirmation` asks a Yes/No question, both without configuring a separate action. 

- **Map Component Now in Core** 

  - The map component is available in Core without a package dependency, and users can pick a location directly on the map. 

- **Rate Limiting on Authentication Endpoints** 

  - Login and OTP endpoints are now rate limited, which shuts down password spraying, OTP brute forcing, and SMS toll fraud. 

 

## 💪 Enhancements 

- **Configuration Studio: Multi-Select and Import Fidelity** 

  - Ctrl+click and Shift+click select multiple items in the sidebar for drag and move. 

  - Folder structure is preserved and synchronised on import, instead of being flattened. 

  - Manually changed items are now visually distinct in the export view. 

  - Sidebar tree text no longer truncates or wraps awkwardly when the panel is resized. 

- **Form Designer: Sizing, Preview, and Offline Editing** 

  - Grid child components now expose grid size properties, so sizing is set directly on the child. 

  - The designer retains your active settings tab and selected component when you return from preview. 

  - DataTable gained a CRUD action icons section on the Appearance tab. 

  - The code editor works offline, so local development no longer requires internet access. 

- **New Font Defaults and Lighter Thumbnails** 

  - Refreshed default typography across the UI. 

  - FileList thumbnails use the dedicated thumbnail endpoint instead of downloading full files. 

- **Enter Key Submits the Login Form** 

  - Pressing Enter on the login screen signs in, instead of requiring a click. 

- **Reusable Integration Test Package** 

  - `Shesha.Testing` ships database fixtures, test modules, and dependency registration as a package, so projects no longer hand-roll it per solution. 

 

## 🐞 Bug Fixes 

- **Stored XSS Vulnerabilities Closed** 

  - Ten stored cross-site scripting vulnerabilities were closed. 

- **Email Links Work in Any Browser** 

  - Opening a valid email link in a different browser from the one it was sent to reported "expired or invalid link". 

- **Multiple-Value Components Sent Malformed Payloads** 

  - Components sent `[object Object]` in the API payload when configured for multiple values. 

- **Audit Log Missed Form Changes** 

  - The audit log did not record changes made on a form. 

- **Required Validation Fired After a Successful Upload** 

  - Required validation kept firing after a file had been uploaded. 
