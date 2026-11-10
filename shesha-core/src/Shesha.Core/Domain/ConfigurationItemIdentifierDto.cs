using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
#nullable enable
    [Serializable]
    public class ConfigurationItemIdentifierDto : IEquatable<ConfigurationItemIdentifierDto>
    {
        /// <summary>
        /// Item name
        /// </summary>
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
        public string Name { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

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
#nullable restore
}
