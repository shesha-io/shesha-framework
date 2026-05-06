# Release Notes

## 🐞 Bug Fixes

- **Email Validation:** - Corrected validation logic that incorrectly flagged valid email addresses as invalid, which prevented email sending and caused misleading error logs.
- **Table View Actions:** - Resolved an error where using the `application` object in Action column scripts (e.g., `application.navigator.navigateToUrl`) would fail at runtime, despite being listed as an available variable in the script editor.
- **External Authentication:** - Fixed an issue where external login accounts were not reliably linked during registration, improving sign-in continuity for third-party providers.

## 💪 Enhancements

- **Tree optimisation**
