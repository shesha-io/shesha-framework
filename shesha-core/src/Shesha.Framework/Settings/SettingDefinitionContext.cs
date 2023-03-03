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
        protected Dictionary<string, SettingDefinition> Settings { get; }

        public string ModuleName { get; private set; }

        public SettingDefinitionContext(Dictionary<string, SettingDefinition> settings, ISettingDefinitionProvider provider)
        {
            Settings = settings;
            ModuleName = provider?.GetType().GetConfigurableModuleName();
        }

        public virtual SettingDefinition GetOrNull(string name)
        {
            return Settings.GetOrDefault(name);
        }

        public virtual IReadOnlyList<SettingDefinition> GetAll()
        {
            return Settings.Values.ToImmutableList();
        }

        public virtual void Add(params SettingDefinition[] definitions)
        {
            if (definitions.IsNullOrEmpty())
            {
                return;
            }

            foreach (var definition in definitions)
            {
                definition.ModuleName = ModuleName;
                Settings[definition.Name] = definition;
            }
        }
    }
}