using Shesha.Domain;
using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Indicates that configuration item if null
    /// </summary>
    public class ConfigurationMissingException: Exception
    {
        public ConfigurationMissingException(ConfigurationItemBase item) : base($"{nameof(ConfigurationItemBase.Configuration)} must not be null for ${item.GetType().FullName}")
        {

        }
    }
}
