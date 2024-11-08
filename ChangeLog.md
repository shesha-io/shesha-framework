# Release Notes
## 🚀 What's New in Shesha
- **Chevron Component**
  - The new chevron (›) arrow-shaped indicator guides users through navigation and shows clickable areas in an application.
  - It contains cool features like Customizable Items, Customizable Styles, and Configured Actions.
  - Adding a Chevron Component is as simply as adding any other component to your form.

https://github.com/user-attachments/assets/34603dfd-0b1c-46e0-b25d-7baa511f85e2

- **Kanban Component**
    - Kanban board visually organizes tasks into columns like 'To Do,' 'In Progress,' and 'Done,' allowing teams to track project status at a glance.
   - It contains Drag and Drop functionalities, Customizable Columns and Cards, Collapsible Cards, and Customizable Styles.

https://github.com/user-attachments/assets/6ce955d3-99c0-4ddd-b2b8-6b108f7ba599

- **Chart Component**
  - With the new chart component, users can now create dynamic chart visualizations from entry data or API endpoints.
  
![Chart_Component (3)](https://github.com/user-attachments/assets/30e955e7-ca94-46cf-8925-f2f277046ecc)

## 💪 Enhancements
- **Form Edit Mode**
   - Edit Mode has been revamped with an entirely new UI and a more streamlined experience.
    - The Edit Mode toggle has been consolidated into a single switch, simplifying the user interface and reducing clutter.
    - Smooth animations now accompany the Edit Mode UI, providing functionality only when needed.
    - To exit the new Edit Mode UI, you can either click on the close icon next to the form name or toggle off the Edit Mode switch.
    - The showinfo option has been removed from the dropdown for a cleaner setup, and this change is evident in the screenshot below.
  <img width="452" alt="Picture2" src="https://github.com/user-attachments/assets/19004d47-e398-4a44-ba46-945d90e81525">

- **Component Responsiveness**
   - You can now separate your size according to screen size, for more responsive components based on the size of screen.
   - Responsive styling is available on **Desktop**, **Tablet** and **Mobile** screens.
   - Components can adapt dynamically to different device options, with customizable size, margins, height and width, and even border styles to ensure they appear correctly on any screen size.

![New_Responsive_Component](https://github.com/user-attachments/assets/9a09c531-5d52-4a83-9387-ec82524c1f2c)


- **Startup Optimization**: Improved solution startup time by bypassing the bootstrapper process for unchanged DLLs.
- **Startup Optimization**: Improved solution startup time by optimizing the `PermissionObjectBootstrapper` process for faster performance.
- **Improved Text Components**: Exposed value variable in `Textfield` and `Text Area` components' `onChange` property.
- **CRUD API Swagger Updates**: Refined documentation for CRUD endpoints to prevent readonly properties from appearing in Create and Update operations.
- **Container Component Enhancement**: Added shadow control for better UI customization.
- Enhanced DynamicDto Mapping Methods

## 🐞 Bug Fixes
- **Subform Data Update Issue**: Resolved issue where subform didn’t update correctly without clearing selected values.
- **Dialog Error**: Fixed error when re-rendering dialogs after clearing dialog arguments.
- **Theme Color Transition**: Corrected initial display to immediately reflect the primary theme color. (Note: Adding app/app-provider.tsx at the project level is required for the loader line to inherit the primary system color.)
- **Inline Editing in DataTable**: Addressed issue preventing inline editing from displaying values within subforms.
- **Dropdown Width**: Removed hardcoded 100% width from dropdown component for flexible styling.


## Starter Template Update
- **Login Page Update**: Updated login page to utilize configurable forms for customization.
- **Organization Naming Constraint**: Prevented users from setting "Shesha" as the organization name in the starter project creator page.
- **Form Template Removal**: Removed GUID form template from the starter project database.
