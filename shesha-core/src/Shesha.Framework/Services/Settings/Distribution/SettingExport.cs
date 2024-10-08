using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.Settings.Distribution
{
    /// <summary>
    /// Setting export
    /// </summary>
    public class SettingExport: ISettingExport, ITransientDependency
    {
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepo;
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;

        public SettingExport(IRepository<SettingConfiguration, Guid> settingConfigurationRepo, IRepository<SettingValue, Guid> settingValueRepo)
        {
            _settingConfigurationRepo = settingConfigurationRepo;
            _settingValueRepo = settingValueRepo;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id) 
        {
            var form = await _settingConfigurationRepo.GetAsync(id);
            return await ExportItemAsync(form);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item) 
        {
            if (!(item is SettingConfiguration settingConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(SettingConfiguration)}, actual: {item.GetType().FullName}");

            var result = new DistributedSettingConfiguration
            {
                Id = settingConfig.Id,
                Name = settingConfig.Name,
                ModuleName = settingConfig.Module?.Name,
                FrontEndApplication = settingConfig.Application?.AppKey,
                ItemType = settingConfig.ItemType,

                Label = settingConfig.Label,
                Description = settingConfig.Description,
                OriginId = settingConfig.Origin?.Id,
                BaseItem = settingConfig.BaseItem?.Id,
                VersionNo = settingConfig.VersionNo,
                VersionStatus = settingConfig.VersionStatus,
                ParentVersionId = settingConfig.ParentVersion?.Id,
                Suppress = settingConfig.Suppress,

                // setting configuration specific properties
                DataType = settingConfig.DataType,
                EditorFormName = settingConfig.EditorFormName,
                EditorFormModule = settingConfig.EditorFormModule,
                OrderIndex = settingConfig.OrderIndex,
                Category = settingConfig.Category,
                IsClientSpecific = settingConfig.IsClientSpecific,
                AccessMode = settingConfig.AccessMode,
                ClientAccess = settingConfig.ClientAccess,
                IsUserSpecific = settingConfig.IsUserSpecific,
            };
            result.Values = await ExportSettingValuesAsync(settingConfig);

            return result;
        }

        private async Task<List<DistributedSettingValue>> ExportSettingValuesAsync(SettingConfiguration settingConfig)
        {
            var values = await _settingValueRepo.GetAll().Where(v => v.SettingConfiguration == settingConfig).ToListAsync();

            return values.Select(v => new DistributedSettingValue
            {
                Value = v.Value,
                AppKey = v.Application?.AppKey
            }).ToList();
        }

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}
