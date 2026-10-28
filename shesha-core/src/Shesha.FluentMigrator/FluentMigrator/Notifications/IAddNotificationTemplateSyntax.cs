namespace Shesha.FluentMigrator.Notifications
{
    public interface IAddNotificationTemplateSyntax
    {
        /// <summary>
        /// Disable template
        /// </summary>
        IAddNotificationTemplateSyntax Disable();

        /// <summary>
        /// Enable template
        /// </summary>
        IAddNotificationTemplateSyntax Enable();
    }
}
