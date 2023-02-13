using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.DeviceRegistrations.Dto
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(DeviceRegistration))]
    public class DeviceRegistrationInput 
    {
        public string DeviceRegistrationId { get; set; }
    }
}
