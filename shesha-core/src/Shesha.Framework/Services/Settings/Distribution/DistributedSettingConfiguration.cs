using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Services.Settings.Distribution
{
    /// <summary>
    /// Distributed setting configuration
    /// </summary>
    public class DistributedSettingConfiguration : DistributedConfigurableItemBase
    {
        public string DataType { get; set; }
        public string? EditorFormName { get; set; }
        public string? EditorFormModule { get; set; }
        public int OrderIndex { get; set; }
        public string? Category { get; set; }
        public bool IsClientSpecific { get; set; }
        public RefListSettingAccessMode AccessMode { get; set; }
        public bool IsUserSpecific { get; set; }
        public RefListUserSettingAccessMode ClientAccess { get; set; }

        public List<DistributedSettingValue> Values { get; set; } = new List<DistributedSettingValue>();
    }
}
