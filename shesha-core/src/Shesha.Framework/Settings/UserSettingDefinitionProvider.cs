using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Attributes;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Shesha.Settings
{
    /// <summary>
    /// User settings definition provider. Defines all settings dynamically created
    /// </summary>
    public class UserSettingDefinitionProvider : ISettingDefinitionProvider, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepository;

        public UserSettingDefinitionProvider(IRepository<SettingConfiguration, Guid> settingConfigurationRepository)
        {
            _settingConfigurationRepository = settingConfigurationRepository;
        }

        public void Define(ISettingDefinitionContext context)
        {
            var settings = context.GetAll();
            var dbSettings = _settingConfigurationRepository.GetAll().ToList();

            var dynamicallyCreatedSettings = dbSettings
                .Where(c => !settings.Any(d => d.Value.Name == c.Name && d.Value.ModuleName == c.Module.Name))
                .ToList();

            foreach (var config in dynamicallyCreatedSettings)
            {
                var definition = new SettingDefinition<object>(config.Name, new object { }, config.Module.Name)
                {
                    Accessor = config.Name,
                    Category = "User Settings",
                    IsUserSpecific = true,
                    ModuleName = config.Module.Name,
                };

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
