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
    public class SettingExport : ConfigurableItemExportBase<SettingConfiguration, SettingConfigurationRevision, DistributedSettingConfiguration>, ISettingExport, ITransientDependency
    {
        private readonly IRepository<SettingValue, Guid> _settingValueRepo;

        public SettingExport(IRepository<SettingValue, Guid> settingValueRepo)
        {
            _settingValueRepo = settingValueRepo;
        }

        public string ItemType => SettingConfiguration.ItemTypeName;

        protected override async Task MapCustomPropsAsync(SettingConfiguration item, SettingConfigurationRevision revision, DistributedSettingConfiguration result)
        {
            // setting configuration specific properties
            result.DataType = revision.DataType;
            result.EditorFormName = revision.EditorFormName;
            result.EditorFormModule = revision.EditorFormModule;
            result.OrderIndex = revision.OrderIndex;
            result.Category = revision.Category;
            result.IsClientSpecific = revision.IsClientSpecific;
            result.AccessMode = revision.AccessMode;
            result.ClientAccess = revision.ClientAccess;
            result.IsUserSpecific = revision.IsUserSpecific;

            result.Values = await ExportSettingValuesAsync(item);
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