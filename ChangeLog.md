# Release Notes

## 🐞 Bug Fixes

- **Loader Positioning** - Fixed an issue where the loader would appear in the top corner of the page instead of being centered. The loader now correctly displays in the middle of the viewport.
- **Role Permissions & Visibility Update** - Resolved a problem where updating permissions or visibility settings for a role already assigned to a user would not apply correctly. Changes to role settings now propagate as expected.
- **Excessive RAM Consumption on GetAll Endpoint** - Fixed an issue where the GetAll endpoint for the Member class (inheriting from Person) would load full entities including large Base64String image data, even when not requested by the client. This caused excessive RAM usage and degraded performance. Implemented partial entity loading to prevent multiple large image copies from being held in memory.
- **Production Error** - back-end no longer crashes on critical logging errors
