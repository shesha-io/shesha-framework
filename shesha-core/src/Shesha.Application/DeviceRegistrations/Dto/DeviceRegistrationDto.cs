using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.DeviceRegistrations.Dto
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(DeviceRegistration))]
    public class DeviceRegistrationDto : EntityDto<Guid>
    {
        public string DeviceRegistrationId { get; set; }

        public Guid PersonId { get; set; }
    }
}
