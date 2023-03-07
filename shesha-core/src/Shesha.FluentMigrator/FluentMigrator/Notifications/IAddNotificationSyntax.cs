using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FluentMigrator.Notifications
{
    public interface IAddNotificationSyntax
    {
        /// <summary>
        /// Set description
        /// </summary>
        /// <param name="description"></param>
        /// <returns></returns>
        IAddNotificationSyntax SetDescription(string description);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IAddNotificationSyntax AddEmailTemplate(Guid id, string name, string subject, string body);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IAddNotificationSyntax AddSmsTemplate(Guid id, string name, string body);

        /// <summary>
        /// Add Email Template
        /// </summary>
        IAddNotificationSyntax AddPushTemplate(Guid id, string name, string subject, string body);
    }
}
