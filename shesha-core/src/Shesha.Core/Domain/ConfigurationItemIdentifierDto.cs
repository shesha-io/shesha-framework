using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
    [Serializable]
    public class ConfigurationItemIdentifierDto : IEquatable<ConfigurationItemIdentifierDto>
    {
        /// <summary>
        /// Item name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }

        public bool Equals(ConfigurationItemIdentifierDto? other)
        {
            return other != null && Module == other.Module && Name == other.Name;
        }

        public override bool Equals(object? obj) => this.Equals(obj as ConfigurationItemIdentifierDto);

        public static bool operator ==(ConfigurationItemIdentifierDto? l, ConfigurationItemIdentifierDto? r)
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

        public static bool operator !=(ConfigurationItemIdentifierDto? l, ConfigurationItemIdentifierDto? r) => !(l == r);

        [BindNever]
        [Bindable(false)]
        [JsonIgnore]
        public string NormalizedFullName => $"{Module}/{Name}".ToLower();

        public override int GetHashCode()
        {
            return NormalizedFullName.GetHashCode();
        }

        public override string ToString()
        {
            return NormalizedFullName;
        }
    }
}