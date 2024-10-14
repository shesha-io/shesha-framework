using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using System;
using System.Linq;

namespace Shesha.Settings
{
    /// <summary>
    /// Dynamic settings definition provider. Defines all settings dynamically created
    /// </summary>
    public class DynamicSettingDefinitionProvider : IOrderedSettingDefinitionProvider, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepository;
        private readonly ISettingDefinitionManager _settingDefinitionManager;

        public DynamicSettingDefinitionProvider(IRepository<SettingConfiguration, Guid> settingConfigurationRepository, ISettingDefinitionManager settingDefinitionManager)
        {
            _settingConfigurationRepository = settingConfigurationRepository;
            _settingDefinitionManager = settingDefinitionManager;
        }

        public int OrderIndex => 2;

        public void Define(ISettingDefinitionContext context)
        {
            var settings = context.GetAll();
            var dbSettings = _settingConfigurationRepository.GetAll().Where(sc => sc.Module != null).ToList();

            var dynamicallyCreatedSettings = dbSettings
                .Where(c => !settings.Any(d => d.Value.Name == c.Name && d.Value.ModuleName == c.Module.Name))
                .ToList();

            foreach (var setting in dynamicallyCreatedSettings)
            {
                var definition = _settingDefinitionManager.CreateUserSettingDefinition(setting.Module.Name, setting.Name, setting.DataType, null);

                var id = new SettingIdentifier(definition.ModuleName, definition.Name);
                if (settings.ContainsKey(id))
                {
                    // Update existing setting if already present
                    settings[id] = definition;
                }
                else
                {
                    // Add new setting
                    settings.Add(id, definition);
                }
            }
        }
    }
}
