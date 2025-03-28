using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Notification identifier
    /// </summary>
    [Serializable]
    public class NotificationIdentifier : ConfigurationItemIdentifier<NotificationTypeConfig>, IIdentifierFactory<NotificationIdentifier>
    {
        public NotificationIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static NotificationIdentifier New(string? module, string name)
        {
            return new NotificationIdentifier(module, name);
        }
    }
}