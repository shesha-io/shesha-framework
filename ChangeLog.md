# Release Notes

## 🐞 Bug Fixes

- **Email registration text** — Fixed incorrect "reset password" message in registration emails
- **Forget Password** — Fixed invalid link generation for password reset emails
- **Reset Password** — Added UI feedback when password fails minimum length validation
- **Security: Dynamic LINQ Sorting** — Restricted navigation property traversal to prevent sensitive data exposure
- **Security:Path Traversal** — Fixed Local File Inclusion vulnerability in ScheduledJobExecution LogFilePath

## 💪 Enhancements

- **SignalR** — Implemented automatic reconnection 
