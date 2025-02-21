using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Form identifier
    /// </summary>
    [Serializable]
    public class NotificationChannelIdentifier : ConfigurationItemIdentifier<NotificationChannelConfig>
    {
        public NotificationChannelIdentifier(string module, string name) : base(module, name)
        {
        }
    }
}