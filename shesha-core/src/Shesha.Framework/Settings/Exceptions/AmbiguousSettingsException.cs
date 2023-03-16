using System;
using System.Collections.Generic;

namespace Shesha.Settings.Exceptions
{
    /// <summary>
    /// Indicates that there are duplicated settings definitions
    /// </summary>
    public class AmbiguousSettingsException : Exception
    {
        public AmbiguousSettingsException(Dictionary<string, List<SettingDefinition>> duplicates) : base($"Found ambiguous setting definition with the same name. Check {nameof(Duplicates)} property for details")
        {
            Duplicates = duplicates;
        }

        /// <summary>
        /// Duplicates
        /// </summary>
        public Dictionary<string, List<SettingDefinition>> Duplicates { get; private set; }
    }
}
