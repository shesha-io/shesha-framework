namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// NotificationTemplate update syntax
    /// </summary>
    public interface IUpdateNotificationTemplateSyntax
    {
        /// <summary>
        /// Set template name
        /// </summary>
        IUpdateNotificationTemplateSyntax SetName(string name);

        /// <summary>
        /// Set item subject
        /// </summary>
        IUpdateNotificationTemplateSyntax SetSubject(string subject);

        /// <summary>
        /// Set body
        /// </summary>
        IUpdateNotificationTemplateSyntax SetBody(string body);

        /// <summary>
        /// Set send type
        /// </summary>
        IUpdateNotificationTemplateSyntax SetSendType(NotificationSendType sendType);

        /// <summary>
        /// Set body format
        /// </summary>
        IUpdateNotificationTemplateSyntax SetBodyFormat(NotificationTemplateType bodyFormat);

        /// <summary>
        /// Disable template
        /// </summary>
        IUpdateNotificationTemplateSyntax Disable();

        /// <summary>
        /// Enable template
        /// </summary>
        IUpdateNotificationTemplateSyntax Enable();
    }
}
