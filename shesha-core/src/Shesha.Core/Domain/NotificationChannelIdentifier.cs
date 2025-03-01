using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Form identifier
    /// </summary>
    [Serializable]
    public class NotificationChannelIdentifier : ConfigurationItemIdentifier<NotificationChannelConfig>, IIdentifierFactory<NotificationChannelIdentifier>
    {
        public NotificationChannelIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static NotificationChannelIdentifier New(string? module, string name)
        {
            return new NotificationChannelIdentifier(module, name);
        }
    }
}