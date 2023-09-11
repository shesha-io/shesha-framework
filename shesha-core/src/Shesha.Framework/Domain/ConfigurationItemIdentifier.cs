using Abp.ObjectComparators.StringComparators;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Identifier oif the configuration item
    /// </summary>
    public abstract class ConfigurationItemIdentifier: IEquatable<ConfigurationItemIdentifier>
    {
        public abstract string ItemType { get; }

        /// <summary>
        /// Item name
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; private set; }

        public ConfigurationItemIdentifier(string module, string name)
        {
            Module = module;
            Name = name;
        }

        public bool Equals(ConfigurationItemIdentifier other)
        {
            return other != null && 
                ItemType == other.ItemType && Module == other.Module && Name == other.Name;
        }

        public override bool Equals(object obj) => this.Equals(obj as ConfigurationItemIdentifier);

        public static bool operator ==(ConfigurationItemIdentifier l, ConfigurationItemIdentifier r)
        {
            if (l is null)
            {
                if (r is null)
                    return true;
                // Only the left side is null.
                return false;
            }
            // Equals handles case of null on right side.
            return l.Equals(r);
        }

        public static bool operator !=(ConfigurationItemIdentifier l, ConfigurationItemIdentifier r) => !(l == r);

        [Bindable(false)]
        [JsonIgnore]
        public string NormalizedFullName => $"{ItemType}:{Module}/{Name}".ToLower();

        public override int GetHashCode()
        {
            return NormalizedFullName.GetHashCode();
        }
    }
}
