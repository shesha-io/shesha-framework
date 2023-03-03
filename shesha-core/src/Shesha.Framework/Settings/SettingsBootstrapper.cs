using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Bootstrappers;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Services.Settings;
using Shesha.Services.Settings.Dto;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Settings bootstrapper. Updates settings definiion in the DB
    /// </summary>
    public class SettingsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepository;
        private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly ISettingDefinitionManager _settingDefinitionManager;
        private readonly ISettingStore _settingStore;
        private readonly IModuleManager _moduleManager;

        public SettingsBootstrapper(ISettingDefinitionManager settingDefinitionManager, ISettingStore settingStore, IRepository<SettingConfiguration, Guid> settingConfigurationRepository, 
            IRepository<ConfigurationItem, Guid> configItemRepository,
            IModuleManager moduleManager,
            IRepository<Module, Guid> moduleRepository)
        {
            _settingDefinitionManager = settingDefinitionManager;
            _settingStore = settingStore;
            _settingConfigurationRepository = settingConfigurationRepository;
            _configItemRepository = configItemRepository;
            _moduleManager = moduleManager;
            _moduleRepository = moduleRepository;
        }

        public async Task Process()
        {
            var definitionsInCode = _settingDefinitionManager.GetAll();

            var configurationsInDb = await _settingConfigurationRepository.GetAll().ToListAsync();

            var modules = _moduleRepository.GetAll().ToList();
            // delete only the ones which are hard linked to the app
            //var toDelete = configurationsInDb

            var consolidated = definitionsInCode.Select(d => new {
                    Code = d, 
                    Db = configurationsInDb.FirstOrDefault(c => new ByNameAndModuleSpecification<SettingConfiguration>(d.Name, d.ModuleName).IsSatisfiedBy(c))
                })
                .ToList();

            var toAdd = consolidated.Where(i => i.Db == null).ToList();
            foreach (var itemToAdd in toAdd) 
            {
                var definition = itemToAdd.Code;

                var module = !string.IsNullOrWhiteSpace(definition.ModuleName)
                    ? modules.FirstOrDefault(m => m.Name == definition.ModuleName)
                    : null;

                var dataType = definition.GetSettingDataType();

                await _settingStore.CreateSettingDefinitionAsync(new CreateSettingDefinitionDto
                {
                    Name = definition.Name,
                    Label = definition.DisplayName,
                    Description = definition.Description,
                    Category = definition.Category,                    
                    IsClientSpecific = definition.IsClientSpecific,
                    DataType = dataType.DataType,
                    EditorFormModule = definition.EditForm?.Module,
                    EditorFormName = definition.EditForm?.Name,
                    ModuleId = module?.Id,
                });
            }

            var toUpdate = consolidated.Where(i => i.Db != null).ToList();
            foreach (var itemToUpdate in toUpdate) 
            {
                var config = itemToUpdate.Db;
                var definition = itemToUpdate.Code;

                var module = !string.IsNullOrWhiteSpace(definition.ModuleName)
                    ? modules.FirstOrDefault(m => m.Name == definition.ModuleName)
                    : null;

                /*
                if (config.Configuration.Label != definition.DisplayName) 
                {
                    config.Configuration.Label = definition.DisplayName;

                    await _configItemRepository.UpdateAsync(config.Configuration);
                }*/
                config.Configuration.Label = definition.DisplayName;
                config.Configuration.Description = definition.Description;
                config.Category = definition.Category;
                config.IsClientSpecific = definition.IsClientSpecific;
                config.EditorFormModule = definition.EditForm?.Module;
                config.EditorFormName = definition.EditForm?.Name;

                await _configItemRepository.UpdateAsync(config.Configuration);
                await _settingConfigurationRepository.UpdateAsync(config);                
            }
        }
    }
}
