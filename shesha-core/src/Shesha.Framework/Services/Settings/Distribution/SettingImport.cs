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
    public class SettingImport : ConfigurationItemImportBase<SettingConfiguration, DistributedSettingConfiguration>, ISettingImport, ITransientDependency
    {
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;

        public SettingImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<SettingConfiguration, Guid> repository,
            IRepository<SettingValue, Guid> settingValueRepo): base(repository, moduleRepo, frontEndAppRepo)
        {
            _settingValueRepo = settingValueRepo;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        protected override Task<bool> CustomPropsAreEqualAsync(SettingConfiguration item, DistributedSettingConfiguration distributedItem)
        {
            var equals = item.DataType == distributedItem.DataType &&
                item.EditorFormName == distributedItem.EditorFormName &&
                item.EditorFormModule == distributedItem.EditorFormModule &&
                item.OrderIndex == distributedItem.OrderIndex &&
                item.Category == distributedItem.Category &&
                item.IsClientSpecific == distributedItem.IsClientSpecific &&
                item.AccessMode == distributedItem.AccessMode &&
                item.IsUserSpecific == distributedItem.IsUserSpecific &&
                item.ClientAccess == distributedItem.ClientAccess;

            return Task.FromResult(equals);
        }

        protected override async Task AfterImportAsync(SettingConfiguration item, DistributedSettingConfiguration distributedItem, IConfigurationItemsImportContext context)
        {
            await ImportSettingValuesAsync(item, distributedItem.Values, context);
        }

        protected override Task MapCustomPropsToItemAsync(SettingConfiguration item, DistributedSettingConfiguration distributedItem)
        {
            // setting configuration specific properties
            item.DataType = distributedItem.DataType;
            item.EditorFormName = distributedItem.EditorFormName;
            item.EditorFormModule = distributedItem.EditorFormModule;
            item.OrderIndex = distributedItem.OrderIndex;
            item.Category = distributedItem.Category;
            item.IsClientSpecific = distributedItem.IsClientSpecific;
            item.AccessMode = distributedItem.AccessMode;
            item.IsUserSpecific = distributedItem.IsUserSpecific;
            item.ClientAccess = distributedItem.ClientAccess;

            return Task.CompletedTask;
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
    }
}