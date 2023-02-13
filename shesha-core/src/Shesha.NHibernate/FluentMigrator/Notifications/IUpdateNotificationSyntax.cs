using System;

namespace Shesha.FluentMigrator.Notifications
{
    public interface IUpdateNotificationSyntax
    {
        /// <summary>
        /// Set description
        /// </summary>
        /// <param name="description"></param>
        /// <returns></returns>
        IUpdateNotificationSyntax SetDescription(string description);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IUpdateNotificationSyntax AddEmailTemplate(Guid id, string name, string subject, string body);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IUpdateNotificationSyntax AddSmsTemplate(Guid id, string name, string body);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IUpdateNotificationSyntax AddPushTemplate(Guid id, string name, string subject, string body);

        /// <summary>
        /// Delete all templates
        /// </summary>
        /// <returns></returns>
        IUpdateNotificationSyntax DeleteTemplates();
    }
}
