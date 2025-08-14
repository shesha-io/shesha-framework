using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services.Settings.Distribution
{
    /// <summary>
    /// Setting export
    /// </summary>
    public class SettingExport: ConfigurableItemExportBase<SettingConfiguration, SettingConfigurationRevision, DistributedSettingConfiguration>, ISettingExport, ITransientDependency
    {
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;

        public SettingExport(IRepository<SettingValue, Guid> settingValueRepo)
        {
            _settingValueRepo = settingValueRepo;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        /// inheritedDoc
        public override async Task<DistributedSettingConfiguration> ExportAsync(SettingConfiguration settingConfig) 
        {
            var revision = settingConfig.Revision;
            var result = new DistributedSettingConfiguration
            {
                Id = settingConfig.Id,
                Name = settingConfig.Name,
                ModuleName = settingConfig.Module?.Name,
                FrontEndApplication = settingConfig.Application?.AppKey,
                ItemType = settingConfig.ItemType,

                Label = revision.Label,
                Description = revision.Description,
                OriginId = settingConfig.Origin?.Id,
                Suppress = settingConfig.Suppress,

                // setting configuration specific properties
                DataType = revision.DataType,
                EditorFormName = revision.EditorFormName,
                EditorFormModule = revision.EditorFormModule,
                OrderIndex = revision.OrderIndex,
                Category = revision.Category,
                IsClientSpecific = revision.IsClientSpecific,
                AccessMode = revision.AccessMode,
                ClientAccess = revision.ClientAccess,
                IsUserSpecific = revision.IsUserSpecific,
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
    }
}