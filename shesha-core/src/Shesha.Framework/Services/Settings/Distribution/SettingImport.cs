using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.Settings.Distribution
{
    /// <summary>
    /// Setting import
    /// </summary>
    public class SettingImport: ConfigurationItemImportBase, ISettingImport, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigRepo;
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;
        private readonly ISettingStore _settingStore;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public SettingImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            ISettingStore settingStore, 
            IRepository<SettingConfiguration, Guid> settingConfigRepo, 
            IRepository<SettingValue, Guid> settingValueRepo, 
            IUnitOfWorkManager unitOfWorkManager): base(moduleRepo, frontEndAppRepo)
        {
            _settingStore = settingStore;
            _settingConfigRepo = settingConfigRepo;
            _settingValueRepo = settingValueRepo;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedSettingConfiguration setting))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedSettingConfiguration)}. Actual type is {item.GetType().FullName}");

            return await ImportSettingAsync(setting, context);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream) 
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedSettingConfiguration>(json);
            }
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportSettingAsync(DistributedSettingConfiguration item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingSetting = await _settingConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module.Name == item.ModuleName) && f.IsLast);

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingSetting != null) 
            {
                switch (existingSetting.VersionStatus)
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready: 
                    {
                        // cancel existing version
                        await _settingStore.CancelVersionAsync(existingSetting);
                        break;
                    }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live) 
                {
                    var liveVersion = existingSetting.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingSetting
                        : await _settingConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module.Name == item.ModuleName) && f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveVersion != null)
                    {
                        await _settingStore.UpdateStatusAsync(liveVersion, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }

                // create new version
                var newVersion = await _settingStore.CreateNewVersionAsync(existingSetting);
                MapToSettingConfiguration(item, newVersion);

                // important: set status according to the context
                newVersion.VersionStatus = statusToImport;
                newVersion.CreatedByImport = context.ImportResult;
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

                // fill audit?
                newSetting.VersionNo = 1;
                newSetting.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newSetting.VersionStatus = statusToImport;
                newSetting.CreatedByImport = context.ImportResult;

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
            dst.Label = src.Label;
            dst.Description = src.Description;
            dst.VersionStatus = src.VersionStatus;
            dst.Suppress = src.Suppress;

            // setting configuration specific properties
            dst.DataType = src.DataType;
            dst.EditorFormName = src.EditorFormName;
            dst.EditorFormModule = src.EditorFormModule;
            dst.OrderIndex = src.OrderIndex;
            dst.Category = src.Category;
            dst.IsClientSpecific = src.IsClientSpecific;
            dst.AccessMode = src.AccessMode;
        }
    }
}
