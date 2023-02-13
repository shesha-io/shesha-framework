using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Shesha.Domain;

namespace Shesha.DeviceForceUpdate.Dto
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(Shesha.Domain.DeviceForceUpdate))]
    public class DeviceForceUpdateDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string AppStoreUrl { get; set; }
        public int? OSType { get; set; }
        public double? VersionNo { get; set; }

    }
}
