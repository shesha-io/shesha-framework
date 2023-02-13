using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Indicates that found more than one managers for the specified item type
    /// </summary>
    public class AmbiguousConfigurationItemManagersException : Exception
    {
        public string ItemType { get; private set; }

        public AmbiguousConfigurationItemManagersException(string itemType) : base($"Found ambiguous managers for the same type of ConfigurationItem ({itemType}) ")
        {
            ItemType = itemType;
        }
    }
}
