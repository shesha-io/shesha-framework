using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.Settings.Distribution
{
    /// <summary>
    /// Setting import
    /// </summary>
    public class SettingImport: ConfigurationItemImportBase<SettingConfiguration, DistributedSettingConfiguration>, ISettingImport, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigRepo;
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;
        private readonly ISettingStore _settingStore;

        public SettingImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            ISettingStore settingStore, 
            IRepository<SettingConfiguration, Guid> settingConfigRepo, 
            IRepository<SettingValue, Guid> settingValueRepo): base(moduleRepo, frontEndAppRepo)
        {
            _settingStore = settingStore;
            _settingConfigRepo = settingConfigRepo;
            _settingValueRepo = settingValueRepo;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        /// inheritedDoc
        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedSettingConfiguration setting))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedSettingConfiguration)}. Actual type is {item.GetType().FullName}");

            return ImportSettingAsync(setting, context);
        }

        /// inheritedDoc
        protected async Task<ConfigurationItem> ImportSettingAsync(DistributedSettingConfiguration item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingSetting = await _settingConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module != null && f.Module.Name == item.ModuleName));

            if (existingSetting != null) 
            {
                // create new version
                var newVersion = await _settingStore.CreateNewVersionAsync(existingSetting);
                MapToSettingConfiguration(item, newVersion);

                // TODO: V1 review
                //newVersion.CreatedByImport = context.ImportResult;
                newVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _settingConfigRepo.UpdateAsync(newVersion);

                await ImportSettingValuesAsync(newVersion, item.Values, context);

                return newVersion;
            } else 
            {
                var newSetting = new SettingConfiguration();
                MapToSettingConfiguration(item, newSetting);

                newSetting.Module = await GetModuleAsync(item.ModuleName, context);

                newSetting.Normalize();

                await _settingConfigRepo.InsertAsync(newSetting);

                await ImportSettingValuesAsync(newSetting, item.Values, context);

                return newSetting;
            }
        }

        private async Task ImportSettingValuesAsync(SettingConfiguration settingConfiguration, List<DistributedSettingValue> items, IConfigurationItemsImportContext context)
        {
            foreach (var distributedItem in items)
            {
                var settingValue = await _settingValueRepo.GetAll()
                    .Where(v => v.SettingConfiguration == settingConfiguration)
                    .Where(new ByApplicationSpecification<SettingValue>(distributedItem.AppKey).ToExpression())
                    .FirstOrDefaultAsync();

                if (settingValue == null)
                {
                    settingValue = new SettingValue { 
                        SettingConfiguration = settingConfiguration                        
                    };
                    await MapSettingValueAsync(distributedItem, settingValue, context);
                    await _settingValueRepo.InsertAsync(settingValue);
                }
                else {
                    await MapSettingValueAsync(distributedItem, settingValue, context);
                    await _settingValueRepo.UpdateAsync(settingValue);
                }
            }
        }
        private async Task MapSettingValueAsync(DistributedSettingValue src, SettingValue dst, IConfigurationItemsImportContext context)
        {
            dst.Value = src.Value;
            dst.Application = await GetFrontEndAppAsync(src.AppKey, context);
        }

        private void MapToSettingConfiguration(DistributedSettingConfiguration src, SettingConfiguration dst) 
        {
            dst.Name = src.Name;
            dst.Suppress = src.Suppress;

            var revision = dst.EnsureLatestRevision();

            revision.Label = src.Label;
            revision.Description = src.Description;

            // setting configuration specific properties
            revision.DataType = src.DataType;
            revision.EditorFormName = src.EditorFormName;
            revision.EditorFormModule = src.EditorFormModule;
            revision.OrderIndex = src.OrderIndex;
            revision.Category = src.Category;
            revision.IsClientSpecific = src.IsClientSpecific;
            revision.AccessMode = src.AccessMode;
            revision.IsUserSpecific = src.IsUserSpecific;
            revision.ClientAccess = src.ClientAccess;
        }
    }
}