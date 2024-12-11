
using Newtonsoft.Json;
using Shesha.EntityReferences;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
    /// <summary>
    /// Form identifier
    /// </summary>
    [Serializable]
    public class NotificationChannelIdentifier : ConfigurationItemIdentifier
    {
        public NotificationChannelIdentifier(string module, string name) : base(module, name)
        {
        }

        [JsonIgnore]
        public override string ItemType => "notification-channel";
    }
}