using Abp.Localization;
using Abp;
using JetBrains.Annotations;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.ConfigurationItems;
using System;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.Settings
{
    public abstract class SettingDefinition
    {
        /// <summary>
        /// Unique name of the setting.
        /// </summary>
        [NotNull]
        public string Name { get; protected set; }

        [NotNull]
        public string DisplayName { get; set; }

        [CanBeNull]
        public string Description { get; set; }

        /// <summary>
        /// Category of the setting, is used for groupping in the UI only
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Is client (front-end application) specific
        /// </summary>
        public bool IsClientSpecific { get; set; }

        /// <summary>
        /// Edit form
        /// </summary>
        [CanBeNull]
        public ConfigurationItemIdentifier EditForm { get; set; }

        public abstract object GetDefaultValue();
        public abstract Type GetValueType();
        
        public string ModuleName { get; set; }
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
