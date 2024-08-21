using Abp.Collections.Extensions;
using Shesha.Reflection;
using System.Collections.Generic;
using System.Collections.Immutable;

namespace Shesha.Settings
{
    /// <summary>
    /// Settings definition context
    /// </summary>
    public class SettingDefinitionContext : ISettingDefinitionContext
    {
        protected Dictionary<SettingIdentifier, SettingDefinition> Settings { get; }

        public string ModuleName { get; private set; }

        public SettingDefinitionContext(Dictionary<SettingIdentifier, SettingDefinition> settings, ISettingDefinitionProvider provider)
        {
            Settings = settings;
            ModuleName = provider?.GetType().GetConfigurableModuleName();
        }

        public virtual SettingDefinition GetOrNull(string module, string name)
        {
            return Settings.GetOrDefault(new SettingIdentifier(module, name));
        }

        public virtual Dictionary<SettingIdentifier, SettingDefinition> GetAll()
        {
            return Settings;
        }

        public virtual void Add(params SettingDefinition[] definitions)
        {
            if (definitions.IsNullOrEmpty())
            {
                return;
            }

            foreach (var definition in definitions)
            {
                var id = new SettingIdentifier(definition.ModuleName, definition.Name);
                Settings[id] = definition;
            }
        }
    }
}