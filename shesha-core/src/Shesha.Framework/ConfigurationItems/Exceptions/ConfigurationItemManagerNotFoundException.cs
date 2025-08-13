using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Indicates that manager for the specified item type not found
    /// </summary>
    public class ConfigurationItemManagerNotFoundException : Exception
    {
        public string ItemType { get; private set; }

        public ConfigurationItemManagerNotFoundException(string itemType) : base($"Manager for the ConfigurationItem of type `{itemType}` not found")
        {
            ItemType = itemType;
        }
    }
}
