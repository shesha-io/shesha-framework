using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
    /// <summary>
    /// Identifier oif the configuration item
    /// </summary>
    public abstract class ConfigurationItemIdentifier: IEquatable<ConfigurationItemIdentifier>
    {
        [BindNever]
        [JsonIgnore]
        public abstract string ItemTypeName { get; }

        [BindNever]
        [JsonIgnore]
        public abstract Type ItemType { get; }

        /// <summary>
        /// Item name
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; private set; }

        public ConfigurationItemIdentifier(string? module, string name)
        {
            Module = module;
            Name = name;
        }

        public bool Equals(ConfigurationItemIdentifier? other)
        {
            return other != null && 
                ItemTypeName == other.ItemTypeName && Module == other.Module && Name == other.Name;
        }

        public override bool Equals(object? obj) => this.Equals(obj as ConfigurationItemIdentifier);

        public static bool operator ==(ConfigurationItemIdentifier? l, ConfigurationItemIdentifier? r)
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

        public static bool operator !=(ConfigurationItemIdentifier? l, ConfigurationItemIdentifier? r) => !(l == r);

        [BindNever]
        [Bindable(false)]
        [JsonIgnore]
        public string NormalizedFullName => $"{ItemTypeName}:{Module}/{Name}".ToLower();

        public override int GetHashCode()
        {
            return NormalizedFullName.GetHashCode();
        }

        public override string ToString()
        {
            return NormalizedFullName;
        }
    }

    public abstract class ConfigurationItemIdentifier<TItem>: ConfigurationItemIdentifier where TItem : ConfigurationItem
    {
        protected ConfigurationItemIdentifier(string? module, string name) : base(module, name)
        {
        }

        public override Type ItemType => typeof(TItem);
        public override string ItemTypeName => ItemType.Name;
    }

    public interface IIdentifierFactory 
    { 
    }

    public interface IIdentifierFactory<TSelf>: IIdentifierFactory where TSelf : IIdentifierFactory<TSelf>
    {
        static abstract TSelf New(string? module, string name);
    }
}
