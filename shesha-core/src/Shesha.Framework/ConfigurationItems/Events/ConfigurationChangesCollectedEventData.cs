using Abp.Events.Bus;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Configuration changes collected event data. Stores information about collected configuration changes
    /// </summary>
    public class ConfigurationChangesCollectedEventData: EventData
    {
        public List<ConfigIdentifier> Updates { get; set; }

        public ConfigurationChangesCollectedEventData()
        {
            Updates = new List<ConfigIdentifier>();
        }

        public class ConfigIdentifier
        {
            public string ItemType { get; set; }
            public string Module { get; set; }
            public string Name { get; set; }
            public ConfigIdentifier(string itemType, string module, string name)
            {
                ItemType = itemType;
                Module = module;
                Name = name;
            }
        }
    }
}
