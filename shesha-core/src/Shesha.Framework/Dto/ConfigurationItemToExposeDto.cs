using Abp.Application.Services.Dto;
using System;

namespace Shesha.Dto
{
    public class ConfigurationItemToExposeDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string ItemType { get; set; }

        public string OriginModuleName { get; set; }

        public string OverrideModuleName { get; set; }
        public DateTime? DateUpdated { get; set; }
    }
}
