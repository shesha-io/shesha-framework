using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;

namespace Shesha.MobileDevices
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(MobileDevice))]
    public class MobileDeviceDto : EntityDto<Guid>
    {
        /// <summary>
        /// Device name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string ReadRouteName { get; set; }

        /// <summary>
        /// Device IMEI number
        /// </summary>
        public string IMEI { get; set; }

        /// <summary>
        /// Indicates that the device is locked
        /// </summary>
        public bool IsLocked { get; set; }
    }
}
