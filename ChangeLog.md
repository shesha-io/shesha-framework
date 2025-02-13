# Release Notes

## 💪 Enhancements
- Changed UserManagementAppService.MobileNoAlreadyInUse() and UserManagementAppService.EmailAlreadyInUse() to use indexes queries.
- Changed NotificationSender to skip attachments if not supported by notification type of channel instead of exception.
- Replaced exception in TemplateHelper.ReplacePlaceholders() with empty string replacement.
- Added indexes to Frwk_UserRegistrations.
- Added support for the redirectAllMessages functionality in notifications.
