using System;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Exceptions
{
    /// <summary>
    /// Indicates that there is ambiguous importers for the same type of ConfigurationItem
    /// </summary>
    public class AmbiguousConfigurableItemException: Exception
    {
        public AmbiguousConfigurableItemException(Dictionary<string, List<Type>> duplicates) : base($"Found ambiguous importers for the same type of ConfigurationItem. Check {nameof(Duplicates)} property for details")
        {
            Duplicates = duplicates;
        }

        /// <summary>
        /// Duplicates
        /// </summary>
        public Dictionary<string, List<Type>> Duplicates { get; private set; }
    }
}
