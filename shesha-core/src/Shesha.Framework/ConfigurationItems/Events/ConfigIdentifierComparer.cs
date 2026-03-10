using System;
using System.Collections.Generic;
using static Shesha.ConfigurationItems.Events.ConfigurationChangesCollectedEventData;

namespace Shesha.ConfigurationItems.Events
{
    internal class ConfigIdentifierComparer : EqualityComparer<ConfigIdentifier>
    {
        public override bool Equals(ConfigIdentifier? x, ConfigIdentifier? y)
        {
            if (x is null && y is null)
                return true;

            return x is not null &&
                y is not null &&
                x.ItemType == y.ItemType &&
                x.Module.Equals(y.Module, StringComparison.InvariantCultureIgnoreCase) &&
                x.Name.Equals(y.Name, StringComparison.InvariantCultureIgnoreCase);
        }

        public override int GetHashCode(ConfigIdentifier obj)
        {
            return $"{obj.ItemType}_{obj.Module}_{obj.Name}".GetHashCode();
        }
    }
}
