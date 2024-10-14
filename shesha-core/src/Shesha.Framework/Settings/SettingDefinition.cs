using JetBrains.Annotations;
using Shesha.Domain;
using System;

namespace Shesha.Settings
{
    public abstract class SettingDefinition
    {
        /// <summary>
        /// Unique name of the setting.
        /// </summary>
        [NotNull]
        public string Name { get; protected set; }

        /// <summary>
        /// Accessor of the setting (camelCased property name or alias if specified)
        /// </summary>
        [NotNull]
        public string Accessor { get; set; }

        [NotNull]
        public string DisplayName { get; set; }

        [CanBeNull]
        public string Description { get; set; }

        /// <summary>
        /// Category of the setting, is used for groupping in the UI only
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Accessor of the category (camelCased name or alias if specified)
        /// </summary>
        public string CategoryAccessor { get; set; }

        /// <summary>
        /// Is client (front-end application) specific
        /// </summary>
        public bool IsClientSpecific { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the logged in user
        /// </summary>
        public bool IsUserSpecific { get; set; }

        /// <summary>
        /// Edit form
        /// </summary>
        [CanBeNull]
        public ConfigurationItemIdentifier EditForm { get; set; }

        public abstract object GetDefaultValue();
        public abstract Type GetValueType();
        
        /// <summary>
        /// Name of the module current setting belongs to
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// Accessor of the module (usually it's camelCased name or alias if specified)
        /// </summary>
        public string ModuleAccessor { get; set; }

        public string FullName => !string.IsNullOrWhiteSpace(ModuleName)
            ? $"{ModuleName}.{Name}"
            : Name;
    }

    public class SettingDefinition<TValue>: SettingDefinition
    {
        /// <summary>
        /// Default value
        /// </summary>
        public TValue DefaultValue { get; set; }

        public SettingDefinition(string name, string displayName)
        {
            Name = name;
            DisplayName = displayName;
        }
        
        public SettingDefinition(string name, TValue defaultValue, string displayName): this(name, displayName)
        {
            DefaultValue = defaultValue;
        }

        public override object GetDefaultValue()
        {
            return DefaultValue;
        }

        public override Type GetValueType() 
        {
            return typeof(TValue);
        }
    }
}
