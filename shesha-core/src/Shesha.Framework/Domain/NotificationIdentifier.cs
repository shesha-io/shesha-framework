using Newtonsoft.Json;
using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Notification identifier
    /// </summary>
    [Serializable]
    public class NotificationIdentifier : ConfigurationItemIdentifier
    {
        public NotificationIdentifier(string module, string name) : base(module, name)
        {
        }

        [JsonIgnore]
        public override string ItemType => "notification";
    }
}