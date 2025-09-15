using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Reflection;
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
        private readonly IUnitOfWorkManager _uowManager;
        

        public DynamicSettingDefinitionProvider(IRepository<SettingConfiguration, Guid> settingConfigurationRepository, ISettingDefinitionManager settingDefinitionManager, IUnitOfWorkManager uowManager)
        {
            _settingConfigurationRepository = settingConfigurationRepository;
            _settingDefinitionManager = settingDefinitionManager;
            _uowManager = uowManager;
        }

        public int OrderIndex => 2;

        public void Define(ISettingDefinitionContext context)
        {
            using (var uow = _uowManager.Begin()) 
            {
                var settings = context.GetAll();
                var dbSettings = _settingConfigurationRepository.GetAll().Where(sc => sc.Module != null).ToList();

                var dynamicallyCreatedSettings = dbSettings
                    .Where(c => !settings.Any(d => d.Value.Name == c.Name && d.Value.ModuleName == c.Module.NotNull().Name))
                    .ToList();

                foreach (var setting in dynamicallyCreatedSettings)
                {
                    var definition = _settingDefinitionManager.CreateUserSettingDefinition(setting.Module.NotNull().Name, setting.Name, setting.DataType, null);

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

                uow.Complete();
            }
        }
    }
}
