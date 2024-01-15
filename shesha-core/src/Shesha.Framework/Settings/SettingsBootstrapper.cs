using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Bootstrappers;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Services.Settings;
using Shesha.Services.Settings.Dto;
using Shesha.Settings.Exceptions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Settings bootstrapper. Updates settings definiion in the DB
    /// </summary>
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class SettingsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepository;
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly ISettingDefinitionManager _settingDefinitionManager;
        private readonly ISettingStore _settingStore;
        private readonly IModuleManager _moduleManager;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public SettingsBootstrapper(ISettingDefinitionManager settingDefinitionManager, ISettingStore settingStore, IRepository<SettingConfiguration, Guid> settingConfigurationRepository, 
            IModuleManager moduleManager,
            IRepository<Module, Guid> moduleRepository,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _settingDefinitionManager = settingDefinitionManager;
            _settingStore = settingStore;
            _settingConfigurationRepository = settingConfigurationRepository;
            _moduleManager = moduleManager;
            _moduleRepository = moduleRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task ProcessAsync()
        {
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                var definitionsInCode = _settingDefinitionManager.GetAll();

                var configurationsInDb = await _settingConfigurationRepository.GetAll().ToListAsync();

                var modules = _moduleRepository.GetAll().ToList();
                // delete only the ones which are hard linked to the app
                //var toDelete = configurationsInDb

                // check for duplicated settings names
                var duplicates = definitionsInCode.GroupBy(d => d.FullName,
                    d => d,
                    (name, items) => new {
                        Name = name,
                        Items = items
                    })
                    .Where(g => g.Items.Count() > 1)
                    .ToDictionary(i => i.Name, i => i.Items.ToList());
                if (duplicates.Any())
                    throw new AmbiguousSettingsException(duplicates);

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

                    await _settingStore.CreateSettingConfigurationAsync(new CreateSettingDefinitionDto
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

                    config.Label = definition.DisplayName;
                    config.Description = definition.Description;
                    config.Category = definition.Category;
                    config.IsClientSpecific = definition.IsClientSpecific;
                    config.EditorFormModule = definition.EditForm?.Module;
                    config.EditorFormName = definition.EditForm?.Name;

                    await _settingConfigurationRepository.UpdateAsync(config);
                }
            }
        }
    }
}
