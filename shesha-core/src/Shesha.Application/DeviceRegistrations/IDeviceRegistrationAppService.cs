using Abp.Application.Services;
using Shesha.DeviceRegistrations.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DeviceRegistrations
{
    public interface IDeviceRegistrationAppService: IApplicationService
    {
        Task<DeviceRegistrationDto> CreateAsync(DeviceRegistrationInput input);
        Task<DeviceRegistrationDto> UpdateAsync(DeviceRegistrationInput input);
    }
}
