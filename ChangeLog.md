# Release Notes

## 🐞 Bug Fixes

- **Memory Leak Resolution** - Fixed unbounded memory growth in Castle Windsor's component release policy under sustained authenticated traffic
- **Critical Vulnerability Fix** - Removed SQL injection vulnerabilities in Elmah error logging modules
- **Fixed invalidation of forms cache**

## 💪 Enhancements
- **Mobile & Multi-Application Support**
  - Application-Specific Form Configurations: Forms can now be configured per front-end application with the same name
  - Added "Application" property to form creation, copy, and details screens
  - Fallback Logic: When an application requests a form, the system first looks for an application-specific configuration; if none exists, it falls back to the default configuration (Application = null)
  - Enables selective overrides while maintaining backward compatibility for existing forms
